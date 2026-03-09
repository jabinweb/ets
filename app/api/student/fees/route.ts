import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email || !['STUDENT'].includes(session.user.role || '')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Student access required' },
        { status: 401 }
      )
    }

    // Get query params for filtering
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') || 'all' // 'all', 'month-wise'
    const academicYear = searchParams.get('academicYear')
    const studentId = searchParams.get('studentId') // For parents viewing specific child

    let student

    if (session.user.role === 'STUDENT') {
      // Student viewing their own fees
      student = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          name: true,
          email: true,
          studentNumber: true,
          classId: true,
          class: {
            select: {
              id: true,
              name: true,
              grade: true
            }
          }
        }
      })

      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student not found' },
          { status: 404 }
        )
      }
    } else {
      // Parent viewing their child's fees
      // If studentId is provided, use it; otherwise get the first child
      if (studentId) {
        // Verify this student belongs to this parent
        student = await prisma.user.findFirst({
          where: {
            id: studentId,
            role: 'STUDENT',
            parentEmail: session.user.email
          },
          select: {
            id: true,
            name: true,
            email: true,
            studentNumber: true,
            classId: true,
            class: {
              select: {
                id: true,
                name: true,
                grade: true
              }
            }
          }
        })
      } else {
        // Get first child
        student = await prisma.user.findFirst({
          where: {
            role: 'STUDENT',
            parentEmail: session.user.email
          },
          select: {
            id: true,
            name: true,
            email: true,
            studentNumber: true,
            classId: true,
            class: {
              select: {
                id: true,
                name: true,
                grade: true
              }
            }
          }
        })
      }

      if (!student) {
        return NextResponse.json(
          { success: false, error: 'No child found for this parent' },
          { status: 404 }
        )
      }
    }

    // Get all fee payments for this student with detailed fee info
    const feePayments = await prisma.feePayment.findMany({
      where: {
        studentId: student.id
      },
      include: {
        fee: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform fee payments
    const transformedPayments = feePayments.map(payment => ({
      id: payment.id,
      feeId: payment.feeId,
      feeTitle: payment.fee.title,
      feeType: payment.fee.type,
      totalAmount: Number(payment.fee.amount),
      amountPaid: Number(payment.amountPaid),
      originalAmount: payment.originalAmount ? Number(payment.originalAmount) : null,
      discountApplied: payment.discountApplied,
      discountAmount: Number(payment.discountAmount),
      lateFeeApplied: payment.lateFeeApplied,
      lateFeeAmount: Number(payment.lateFeeAmount),
      status: payment.status,
      dueDate: payment.fee.dueDate,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      description: payment.fee.description,
      generatedFor: payment.fee.generatedFor,
      academicYear: payment.fee.academicYear,
      isRecurring: payment.fee.isRecurring,
      createdAt: payment.createdAt
    }))

    // Group by month if month-wise view requested
    const monthWiseData: Record<string, {
      month: string
      monthName: string
      academicYear: string | null
      totalAmount: number
      amountPaid: number
      amountDue: number
      fees: typeof transformedPayments
      summary: {
        totalFees: number
        paidFees: number
        pendingFees: number
        overdueFees: number
      }
    }> = {}

    if (view === 'month-wise') {
      transformedPayments.forEach(payment => {
        const monthKey = payment.generatedFor || format(new Date(payment.dueDate), 'MMMM yyyy')
        
        if (!monthWiseData[monthKey]) {
          monthWiseData[monthKey] = {
            month: monthKey,
            monthName: monthKey,
            academicYear: payment.academicYear,
            totalAmount: 0,
            amountPaid: 0,
            amountDue: 0,
            fees: [],
            summary: {
              totalFees: 0,
              paidFees: 0,
              pendingFees: 0,
              overdueFees: 0
            }
          }
        }

        const monthData = monthWiseData[monthKey]
        monthData.fees.push(payment)
        monthData.totalAmount += payment.totalAmount
        monthData.amountPaid += payment.amountPaid
        monthData.amountDue += (payment.totalAmount - payment.amountPaid)
        monthData.summary.totalFees++
        
        if (payment.status === 'PAID') {
          monthData.summary.paidFees++
        } else if (payment.status === 'PENDING') {
          monthData.summary.pendingFees++
        } else if (payment.status === 'OVERDUE') {
          monthData.summary.overdueFees++
        }
      })
    }

    // Get all fees to show pending ones
    const allFees = await prisma.fee.findMany({
      where: academicYear ? { academicYear } : {},
      orderBy: {
        dueDate: 'asc'
      }
    })

    // Find pending fees (fees without payments or with partial/pending payments)
    const paidFeeIds = feePayments
      .filter(p => p.status === 'PAID')
      .map(p => p.feeId)

    const pendingFees = allFees
      .filter(fee => !paidFeeIds.includes(fee.id))
      .map(fee => {
        const partialPayment = feePayments.find(
          p => p.feeId === fee.id && p.status !== 'PAID'
        )
        
        const totalAmount = Number(fee.amount)
        const amountPaid = partialPayment ? Number(partialPayment.amountPaid) : 0
        
        return {
          id: fee.id,
          title: fee.title,
          type: fee.type,
          totalAmount,
          amountPaid,
          amountDue: totalAmount - amountPaid,
          status: partialPayment?.status || 'PENDING',
          dueDate: fee.dueDate,
          description: fee.description,
          isOverdue: new Date(fee.dueDate) < new Date()
        }
      })

    // Calculate summary statistics
    const totalAmount = transformedPayments.reduce((sum, p) => sum + p.totalAmount, 0)
    const totalPaid = transformedPayments.reduce((sum, p) => sum + p.amountPaid, 0)
    const totalDiscount = transformedPayments.reduce((sum, p) => sum + p.discountAmount, 0)
    const totalLateFees = transformedPayments.reduce((sum, p) => sum + p.lateFeeAmount, 0)
    const totalDue = totalAmount - totalPaid

    const summary = {
      totalAmount,
      totalPaid,
      totalDue,
      totalDiscount,
      totalLateFees,
      totalFees: transformedPayments.length,
      paidFees: transformedPayments.filter(p => p.status === 'PAID').length,
      pendingFees: transformedPayments.filter(p => p.status === 'PENDING').length,
      overdueFees: transformedPayments.filter(p => p.status === 'OVERDUE').length
    }

    // Return different views based on query param
    if (view === 'month-wise') {
      const months = Object.values(monthWiseData).sort((a, b) => {
        const dateA = new Date(a.month)
        const dateB = new Date(b.month)
        return dateB.getTime() - dateA.getTime()
      })

      return NextResponse.json({
        success: true,
        view: 'month-wise',
        data: {
          months,
          summary,
          studentInfo: {
            id: student.id,
            name: student.name || '',
            email: student.email || '',
            admissionNumber: student.studentNumber || null,
            classId: student.classId || null,
            className: student.class?.name || null,
            grade: student.class?.grade?.toString() || null
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      view: 'all',
      data: {
        payments: transformedPayments,
        pending: pendingFees,
        summary,
        studentInfo: {
          id: student.id,
          name: student.name || '',
          email: student.email || '',
          admissionNumber: student.studentNumber || null,
          classId: student.classId || null,
          className: student.class?.name || null,
          grade: student.class?.grade?.toString() || null
        }
      }
    })

  } catch (error) {
    console.error('Error fetching student fees:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fees' },
      { status: 500 }
    )
  }
}
