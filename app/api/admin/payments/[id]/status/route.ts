import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { PaymentStatus } from '@prisma/client'

interface StatusUpdateBody {
  status: PaymentStatus
}

interface StatusResponse {
  success: boolean
  message?: string
  error?: string
}

// PUT - Update payment status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<StatusResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { status }: StatusUpdateBody = await request.json()

    // Validate status
    if (!Object.values(PaymentStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment status' },
        { status: 400 }
      )
    }

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

    // Update payment status
    const updateData: any = {
      status,
      updatedAt: new Date()
    }

    // Set payment date when marking as paid
    if (status === PaymentStatus.PAID && !existingPayment.paymentDate) {
      updateData.paymentDate = new Date()
    }

    await prisma.feePayment.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${status.toLowerCase()}`
    })

  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update payment status' },
      { status: 500 }
    )
  }
}
