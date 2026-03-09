import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ExpenseCategory, ExpenseStatus } from '@prisma/client'

interface ExpenseRequestBody {
  title: string
  description?: string
  category: ExpenseCategory
  amount: number
  vendorName?: string
  vendorContact?: string
  invoiceNumber?: string
  fiscalYear?: number
  fiscalMonth?: number
}

interface ExpenseData {
  id: string
  title: string
  description: string | null
  category: ExpenseCategory
  amount: number
  status: ExpenseStatus
  paymentDate: string | null
  paymentMethod: string | null
  vendorName: string | null
  invoiceNumber: string | null
  fiscalYear: number
  fiscalMonth: number
  createdAt: string
  updatedAt: string
}

interface ExpenseResponse {
  success: boolean
  message?: string
  data?: ExpenseData | ExpenseData[]
  error?: string
}

// GET - Fetch all expenses
export async function GET(request: NextRequest): Promise<NextResponse<ExpenseResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    const where: any = {}
    if (category) where.category = category as ExpenseCategory
    if (status) where.status = status as ExpenseStatus
    if (year) where.fiscalYear = parseInt(year)
    if (month) where.fiscalMonth = parseInt(month)

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    const transformedExpenses: ExpenseData[] = expenses.map(expense => ({
      id: expense.id,
      title: expense.title,
      description: expense.description,
      category: expense.category,
      amount: Number(expense.amount),
      status: expense.status,
      paymentDate: expense.paymentDate?.toISOString() || null,
      paymentMethod: expense.paymentMethod,
      vendorName: expense.vendorName,
      invoiceNumber: expense.invoiceNumber,
      fiscalYear: expense.fiscalYear,
      fiscalMonth: expense.fiscalMonth,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: transformedExpenses
    })

  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new expense
export async function POST(request: NextRequest): Promise<NextResponse<ExpenseResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: ExpenseRequestBody = await request.json()

    // Validate required fields
    if (!body.title?.trim() || !body.category || !body.amount) {
      return NextResponse.json(
        { success: false, error: 'Title, category, and amount are required' },
        { status: 400 }
      )
    }

    // Validate amount
    if (body.amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Set fiscal year and month if not provided
    const now = new Date()
    const fiscalYear = body.fiscalYear || now.getFullYear()
    const fiscalMonth = body.fiscalMonth || (now.getMonth() + 1)

    // Create the expense
    const expense = await prisma.expense.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        category: body.category,
        amount: body.amount,
        vendorName: body.vendorName?.trim() || null,
        vendorContact: body.vendorContact?.trim() || null,
        invoiceNumber: body.invoiceNumber?.trim() || null,
        fiscalYear,
        fiscalMonth,
        status: ExpenseStatus.PENDING
      }
    })

    const responseData: ExpenseData = {
      id: expense.id,
      title: expense.title,
      description: expense.description,
      category: expense.category,
      amount: Number(expense.amount),
      status: expense.status,
      paymentDate: expense.paymentDate?.toISOString() || null,
      paymentMethod: expense.paymentMethod,
      vendorName: expense.vendorName,
      invoiceNumber: expense.invoiceNumber,
      fiscalYear: expense.fiscalYear,
      fiscalMonth: expense.fiscalMonth,
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      message: 'Expense created successfully',
      data: responseData
    })

  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}
