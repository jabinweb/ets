import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@prisma/client'

interface PaymentRequestBody {
  feeId: string
  studentId: string
  amountPaid: number
  paymentMethod?: string
  transactionId?: string
  notes?: string
}

interface PaymentData {
  id: string
  feeId: string
  studentId: string
  amountPaid: number
  paymentDate: string | null
  paymentMethod: string | null
  status: PaymentStatus
  transactionId: string | null
  notes: string | null
  createdAt: string
  fee: {
    title: string
    type: string
    amount: number
    dueDate: string
  }
  student: {
    name: string
    email: string
    studentNumber: string
    class?: {
      name: string
      grade: number
    } | null
  }
}

interface PaymentResponse {
  success: boolean
  message?: string
  data?: PaymentData | PaymentData[]
  error?: string
}

// GET - Fetch all payments
export async function GET(request: NextRequest): Promise<NextResponse<PaymentResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const studentId = searchParams.get('studentId')
    const feeId = searchParams.get('feeId')

    const whereClause: any = {}
    if (status) whereClause.status = status as PaymentStatus
    if (studentId) whereClause.studentId = studentId
    if (feeId) whereClause.feeId = feeId

    const payments = await prisma.feePayment.findMany({
      where: whereClause,
      include: {
        fee: {
          select: {
            title: true,
            type: true,
            amount: true,
            dueDate: true
          }
        },
        student: {
          select: {
            name: true,
            email: true,
            studentNumber: true,
            class: {
              select: {
                name: true,
                grade: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const transformedPayments: PaymentData[] = payments.map(payment => ({
      id: payment.id,
      feeId: payment.feeId,
      studentId: payment.studentId,
      amountPaid: Number(payment.amountPaid),
      paymentDate: payment.paymentDate?.toISOString() || null,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      transactionId: payment.transactionId,
      notes: payment.notes,
      createdAt: payment.createdAt.toISOString(),
      fee: {
        title: payment.fee.title,
        type: payment.fee.type,
        amount: Number(payment.fee.amount),
        dueDate: payment.fee.dueDate.toISOString()
      },
      student: {
        name: payment.student.name || 'Unknown',
        email: payment.student.email,
        studentNumber: payment.student.studentNumber || 'N/A',
        class: payment.student.class
      }
    }))

    return NextResponse.json({
      success: true,
      data: transformedPayments
    })

  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new payment
export async function POST(request: NextRequest): Promise<NextResponse<PaymentResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: PaymentRequestBody = await request.json()

    // Validate required fields
    if (!body.feeId || !body.studentId || !body.amountPaid) {
      return NextResponse.json(
        { success: false, error: 'Fee ID, student ID, and amount are required' },
        { status: 400 }
      )
    }

    // Validate amount
    if (body.amountPaid <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Check if fee exists
    const fee = await prisma.fee.findUnique({
      where: { id: body.feeId }
    })

    if (!fee) {
      return NextResponse.json(
        { success: false, error: 'Fee not found' },
        { status: 404 }
      )
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { id: body.studentId, role: 'STUDENT' }
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Check if payment already exists
    const existingPayment = await prisma.feePayment.findUnique({
      where: {
        feeId_studentId: {
          feeId: body.feeId,
          studentId: body.studentId
        }
      }
    })

    if (existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment record already exists for this student and fee' },
        { status: 409 }
      )
    }

    // Create the payment
    const payment = await prisma.feePayment.create({
      data: {
        feeId: body.feeId,
        studentId: body.studentId,
        amountPaid: body.amountPaid,
        paymentMethod: body.paymentMethod || null,
        transactionId: body.transactionId || null,
        notes: body.notes || null,
        status: body.paymentMethod ? PaymentStatus.PAID : PaymentStatus.PENDING,
        paymentDate: body.paymentMethod ? new Date() : null
      },
      include: {
        fee: {
          select: {
            title: true,
            type: true,
            amount: true,
            dueDate: true
          }
        },
        student: {
          select: {
            name: true,
            email: true,
            studentNumber: true,
            class: {
              select: {
                name: true,
                grade: true
              }
            }
          }
        }
      }
    })

    const transformedPayment: PaymentData = {
      id: payment.id,
      feeId: payment.feeId,
      studentId: payment.studentId,
      amountPaid: Number(payment.amountPaid),
      paymentDate: payment.paymentDate?.toISOString() || null,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      transactionId: payment.transactionId,
      notes: payment.notes,
      createdAt: payment.createdAt.toISOString(),
      fee: {
        title: payment.fee.title,
        type: payment.fee.type,
        amount: Number(payment.fee.amount),
        dueDate: payment.fee.dueDate.toISOString()
      },
      student: {
        name: payment.student.name || 'Unknown',
        email: payment.student.email,
        studentNumber: payment.student.studentNumber || 'N/A',
        class: payment.student.class
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully',
      data: transformedPayment
    })

  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record payment' },
      { status: 500 }
    )
  }
}
