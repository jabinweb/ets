import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@prisma/client'

interface PaymentUpdateBody {
  amountPaid?: number
  paymentMethod?: string
  transactionId?: string
  notes?: string
}

interface PaymentResponse {
  success: boolean
  message?: string
  data?: any
  error?: string
}

// PUT - Update payment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PaymentResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body: PaymentUpdateBody = await request.json()

    // Check if payment exists
    const existingPayment = await prisma.feePayment.findUnique({
      where: { id }
    })

    if (!existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Update the payment
    const updatedPayment = await prisma.feePayment.update({
      where: { id },
      data: {
        ...(body.amountPaid && { amountPaid: body.amountPaid }),
        ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
        ...(body.transactionId && { transactionId: body.transactionId }),
        ...(body.notes !== undefined && { notes: body.notes }),
        updatedAt: new Date()
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

    return NextResponse.json({
      success: true,
      message: 'Payment updated successfully',
      data: updatedPayment
    })

  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update payment' },
      { status: 500 }
    )
  }
}

// DELETE - Delete payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PaymentResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if payment exists
    const existingPayment = await prisma.feePayment.findUnique({
      where: { id }
    })

    if (!existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Delete the payment
    await prisma.feePayment.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete payment' },
      { status: 500 }
    )
  }
}
