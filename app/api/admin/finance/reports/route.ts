import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { PaymentStatus, FeeType } from '@prisma/client'

interface MonthlyRevenue {
  month: string
  tuition: number
  fees: number
  other: number
  total: number
}

interface ExpenseBreakdown {
  category: string
  amount: number
  percentage: number
  color: string
}

interface MonthlyTrends {
  month: string
  revenue: number
  expenses: number
  profit: number
}

interface FeeTypeCollection {
  type: string
  collected: number
  pending: number
  total: number
}

interface ClassWiseRevenue {
  class: string
  revenue: number
  students: number
  avgPerStudent: number
}

interface PaymentStatusBreakdown {
  status: string
  count: number
  amount: number
  color: string
}

interface FinanceReportData {
  revenue: MonthlyRevenue[]
  expenses: ExpenseBreakdown[]
  monthlyTrends: MonthlyTrends[]
  feeTypes: FeeTypeCollection[]
  classWiseRevenue: ClassWiseRevenue[]
  paymentStatus: PaymentStatusBreakdown[]
}

interface FinanceReportResponse {
  success: boolean
  data?: FinanceReportData
  error?: string
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const EXPENSE_COLORS: Record<string, string> = {
  'SALARIES': '#3B82F6',
  'INFRASTRUCTURE': '#8B5CF6',
  'UTILITIES': '#F59E0B',
  'SUPPLIES': '#10B981',
  'MARKETING': '#EF4444',
  'MAINTENANCE': '#F97316',
  'TRANSPORT': '#06B6D4',
  'INSURANCE': '#84CC16',
  'TECHNOLOGY': '#EC4899',
  'OTHER': '#6B7280'
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  'PAID': '#10B981',
  'PENDING': '#F59E0B',
  'OVERDUE': '#EF4444',
  'CANCELLED': '#6B7280'
}

export async function GET(request: NextRequest): Promise<NextResponse<FinanceReportResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    // Calculate date range based on period
    const startDate = new Date(year, 0, 1) // January 1st of the year
    const endDate = new Date(year, 11, 31, 23, 59, 59) // December 31st of the year

    // 1. Get Monthly Revenue Data
    const monthlyRevenue = await getMonthlyRevenue(startDate, endDate)

    // 2. Get Expense Breakdown
    const expenseBreakdown = await getExpenseBreakdown(startDate, endDate)

    // 3. Get Monthly Trends (Revenue vs Expenses)
    const monthlyTrends = await getMonthlyTrends(startDate, endDate, monthlyRevenue)

    // 4. Get Fee Type Collections
    const feeTypeCollections = await getFeeTypeCollections(startDate, endDate)

    // 5. Get Class-wise Revenue
    const classWiseRevenue = await getClassWiseRevenue(startDate, endDate)

    // 6. Get Payment Status Breakdown
    const paymentStatusBreakdown = await getPaymentStatusBreakdown(startDate, endDate)

    const reportData: FinanceReportData = {
      revenue: monthlyRevenue,
      expenses: expenseBreakdown,
      monthlyTrends: monthlyTrends,
      feeTypes: feeTypeCollections,
      classWiseRevenue: classWiseRevenue,
      paymentStatus: paymentStatusBreakdown
    }

    return NextResponse.json({
      success: true,
      data: reportData
    })

  } catch (error) {
    console.error('Error generating finance report:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate finance report' },
      { status: 500 }
    )
  }
}

async function getMonthlyRevenue(startDate: Date, endDate: Date): Promise<MonthlyRevenue[]> {
  const payments = await prisma.feePayment.findMany({
    where: {
      status: PaymentStatus.PAID,
      paymentDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      fee: {
        select: {
          type: true
        }
      }
    }
  })

  const monthlyData: Record<number, MonthlyRevenue> = {}

  // Initialize all months
  for (let month = 0; month < 12; month++) {
    monthlyData[month] = {
      month: MONTHS[month],
      tuition: 0,
      fees: 0,
      other: 0,
      total: 0
    }
  }

  // Aggregate payments by month and type
  payments.forEach(payment => {
    if (payment.paymentDate) {
      const month = payment.paymentDate.getMonth()
      const amount = Number(payment.amountPaid)

      switch (payment.fee.type) {
        case FeeType.TUITION:
          monthlyData[month].tuition += amount
          break
        case FeeType.LIBRARY:
        case FeeType.SPORTS:
        case FeeType.EXAMINATION:
          monthlyData[month].fees += amount
          break
        default:
          monthlyData[month].other += amount
          break
      }
      monthlyData[month].total += amount
    }
  })

  return Object.values(monthlyData)
}

async function getExpenseBreakdown(startDate: Date, endDate: Date): Promise<ExpenseBreakdown[]> {
  const expenses = await prisma.expense.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      status: {
        in: ['APPROVED', 'PAID']
      }
    }
  })

  const categoryTotals: Record<string, number> = {}
  let totalExpenses = 0

  expenses.forEach(expense => {
    const amount = Number(expense.amount)
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + amount
    totalExpenses += amount
  })

  return Object.entries(categoryTotals).map(([category, amount]) => ({
    category: category.toLowerCase().replace('_', ' '),
    amount,
    percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    color: EXPENSE_COLORS[category] || '#6B7280'
  }))
}

async function getMonthlyTrends(
  startDate: Date, 
  endDate: Date, 
  monthlyRevenue: MonthlyRevenue[]
): Promise<MonthlyTrends[]> {
  const expenses = await prisma.expense.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      status: {
        in: ['APPROVED', 'PAID']
      }
    }
  })

  const monthlyExpenses: Record<number, number> = {}

  // Initialize monthly expenses
  for (let month = 0; month < 12; month++) {
    monthlyExpenses[month] = 0
  }

  // Aggregate expenses by month
  expenses.forEach(expense => {
    const month = expense.createdAt.getMonth()
    monthlyExpenses[month] += Number(expense.amount)
  })

  return monthlyRevenue.map((revenue, index) => ({
    month: revenue.month,
    revenue: revenue.total,
    expenses: monthlyExpenses[index] || 0,
    profit: revenue.total - (monthlyExpenses[index] || 0)
  }))
}

async function getFeeTypeCollections(startDate: Date, endDate: Date): Promise<FeeTypeCollection[]> {
  const fees = await prisma.fee.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      payments: {
        where: {
          paymentDate: {
            gte: startDate,
            lte: endDate
          }
        }
      }
    }
  })

  const feeTypeData: Record<string, { collected: number; total: number }> = {}

  fees.forEach(fee => {
    const type = fee.type
    const feeAmount = Number(fee.amount)
    
    if (!feeTypeData[type]) {
      feeTypeData[type] = { collected: 0, total: 0 }
    }

    feeTypeData[type].total += feeAmount

    fee.payments.forEach(payment => {
      if (payment.status === PaymentStatus.PAID) {
        feeTypeData[type].collected += Number(payment.amountPaid)
      }
    })
  })

  return Object.entries(feeTypeData).map(([type, data]) => ({
    type: type.toLowerCase().replace('_', ' '),
    collected: data.collected,
    pending: data.total - data.collected,
    total: data.total
  }))
}

async function getClassWiseRevenue(startDate: Date, endDate: Date): Promise<ClassWiseRevenue[]> {
  const payments = await prisma.feePayment.findMany({
    where: {
      status: PaymentStatus.PAID,
      paymentDate: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      student: {
        include: {
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

  const classData: Record<string, { revenue: number; students: Set<string> }> = {}

  payments.forEach(payment => {
    if (payment.student.class) {
      const className = payment.student.class.name
      const amount = Number(payment.amountPaid)

      if (!classData[className]) {
        classData[className] = { revenue: 0, students: new Set() }
      }

      classData[className].revenue += amount
      classData[className].students.add(payment.studentId)
    }
  })

  return Object.entries(classData).map(([className, data]) => ({
    class: className,
    revenue: data.revenue,
    students: data.students.size,
    avgPerStudent: data.students.size > 0 ? data.revenue / data.students.size : 0
  }))
}

async function getPaymentStatusBreakdown(startDate: Date, endDate: Date): Promise<PaymentStatusBreakdown[]> {
  const payments = await prisma.feePayment.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  })

  const statusData: Record<string, { count: number; amount: number }> = {}

  payments.forEach(payment => {
    const status = payment.status
    const amount = Number(payment.amountPaid)

    if (!statusData[status]) {
      statusData[status] = { count: 0, amount: 0 }
    }

    statusData[status].count += 1
    statusData[status].amount += amount
  })

  return Object.entries(statusData).map(([status, data]) => ({
    status: status.toLowerCase(),
    count: data.count,
    amount: data.amount,
    color: PAYMENT_STATUS_COLORS[status] || '#6B7280'
  }))
}
