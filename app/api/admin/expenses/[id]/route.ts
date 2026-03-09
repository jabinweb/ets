import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ExpenseCategory, ExpenseStatus } from '@prisma/client'

interface ExpenseUpdateBody {
  title?: string
  description?: string
  category?: ExpenseCategory
  amount?: number
  status?: ExpenseStatus
  paymentDate?: string
  paymentMethod?: string
  vendorName?: string
  vendorContact?: string
  invoiceNumber?: string
  receiptUrl?: string
}

interface ExpenseResponse {
  success: boolean
  message?: string
  data?: any
  error?: string
}

// GET - Fetch single expense
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ExpenseResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const expense = await prisma.expense.findUnique({
      where: { id }
    })

    if (!expense) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...expense,
        amount: Number(expense.amount)
      }
    })

  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update expense
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ExpenseResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body: ExpenseUpdateBody = await request.json()

    // Check if expense exists
    const existingExpense = await prisma.expense.findUnique({
      where: { id }
    })

    if (!existingExpense) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      )
    }

    // Validate amount if provided
    if (body.amount !== undefined && body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Update the expense
    const updateData: any = {
      updatedAt: new Date()
    }

    if (body.title) updateData.title = body.title.trim()
    if (body.description !== undefined) updateData.description = body.description?.trim() || null
    if (body.category) updateData.category = body.category
    if (body.amount) updateData.amount = body.amount
    if (body.status) updateData.status = body.status
    if (body.paymentMethod) updateData.paymentMethod = body.paymentMethod
    if (body.vendorName !== undefined) updateData.vendorName = body.vendorName?.trim() || null
    if (body.vendorContact !== undefined) updateData.vendorContact = body.vendorContact?.trim() || null
    if (body.invoiceNumber !== undefined) updateData.invoiceNumber = body.invoiceNumber?.trim() || null
    if (body.receiptUrl !== undefined) updateData.receiptUrl = body.receiptUrl?.trim() || null

    // Handle payment date
    if (body.paymentDate) {
      updateData.paymentDate = new Date(body.paymentDate)
    }

    // If marking as paid, set payment date if not provided
    if (body.status === ExpenseStatus.PAID && !body.paymentDate && !existingExpense.paymentDate) {
      updateData.paymentDate = new Date()
    }

    // Set approval details if approving
    if (body.status === ExpenseStatus.APPROVED) {
      updateData.approvedBy = session.user.id
      updateData.approvedAt = new Date()
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: 'Expense updated successfully',
      data: {
        ...updatedExpense,
        amount: Number(updatedExpense.amount)
      }
    })

  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update expense' },
      { status: 500 }
    )
  }
}

// DELETE - Delete expense
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ExpenseResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if expense exists
    const existingExpense = await prisma.expense.findUnique({
      where: { id }
    })

    if (!existingExpense) {
      return NextResponse.json(
        { success: false, error: 'Expense not found' },
        { status: 404 }
      )
    }

    // Don't allow deletion of paid expenses
    if (existingExpense.status === ExpenseStatus.PAID) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete paid expenses' },
        { status: 400 }
      )
    }

    // Delete the expense
    await prisma.expense.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete expense' },
      { status: 500 }
    )
  }
}
