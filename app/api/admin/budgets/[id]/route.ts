import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const budget = await prisma.budget.update({
      where: { id },
      data: {
        ...body,
        allocatedAmount: body.allocatedAmount ? parseFloat(body.allocatedAmount) : undefined,
        fiscalYear: body.fiscalYear ? parseInt(body.fiscalYear) : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined
      }
    })

    return NextResponse.json({
      success: true,
      data: budget,
      message: "Budget updated successfully"
    })
  } catch (error) {
    console.error('Error updating budget:', error)
    return NextResponse.json(
      { success: false, message: "Failed to update budget" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    await prisma.budget.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Budget deleted successfully"
    })
  } catch (error) {
    console.error('Error deleting budget:', error)
    return NextResponse.json(
      { success: false, message: "Failed to delete budget" },
      { status: 500 }
    )
  }
}
