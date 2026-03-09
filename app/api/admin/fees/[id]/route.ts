import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { FeeType } from '@prisma/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Fetch single fee by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const resolvedParams = await params

  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const fee = await prisma.fee.findUnique({
      where: { id: resolvedParams.id },
      include: {
        payments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                studentNumber: true
              }
            }
          }
        }
      }
    })

    if (!fee) {
      return NextResponse.json(
        { success: false, error: 'Fee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: fee
    })

  } catch (error) {
    console.error('Error fetching fee:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update fee
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const resolvedParams = await params

  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, type, amount, description, dueDate } = body

    // Validation
    if (type && !Object.values(FeeType).includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid fee type' },
        { status: 400 }
      )
    }

    const updateData: Partial<{
      title: string
      type: FeeType
      amount: number
      description: string
      dueDate: Date
    }> = {}
    if (title !== undefined) updateData.title = title
    if (type !== undefined) updateData.type = type
    if (amount !== undefined) updateData.amount = amount
    if (description !== undefined) updateData.description = description
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate)

    const fee = await prisma.fee.update({
      where: { id: resolvedParams.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: fee
    })

  } catch (error) {
    console.error('Error updating fee:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete fee
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const resolvedParams = await params

  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if fee has any payments
    const paymentsCount = await prisma.feePayment.count({
      where: { feeId: resolvedParams.id }
    })

    if (paymentsCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete fee with existing payments' },
        { status: 400 }
      )
    }

    await prisma.fee.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Fee deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting fee:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
