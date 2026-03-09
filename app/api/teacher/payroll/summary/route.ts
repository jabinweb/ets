import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Teacher role required.' },
        { status: 403 }
      )
    }

    const teacherId = session.user.id
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    // Get current month salary
    const currentMonthRecord = await prisma.payrollRecord.findFirst({
      where: {
        employeeId: teacherId,
        payYear: currentYear,
        payMonth: currentMonth
      }
    })

    // Get year-to-date records
    const ytdRecords = await prisma.payrollRecord.findMany({
      where: {
        employeeId: teacherId,
        payYear: currentYear
      }
    })

    // Calculate summary with proper decimal handling and null safety
    const ytdGross = ytdRecords.reduce((sum, record) => {
      const amount = record.grossSalary ? Number(record.grossSalary) : 0
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
    
    const ytdDeductions = ytdRecords.reduce((sum, record) => {
      const amount = record.totalDeductions ? Number(record.totalDeductions) : 0
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
    
    const ytdNet = ytdRecords.reduce((sum, record) => {
      const amount = record.netSalary ? Number(record.netSalary) : 0
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
    
    const totalTaxDeducted = ytdRecords.reduce((sum, record) => {
      const amount = record.taxDeducted ? Number(record.taxDeducted) : 0
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

    const summary = {
      currentMonthSalary: currentMonthRecord ? (Number(currentMonthRecord.netSalary) || 0) : 0,
      ytdGross,
      ytdDeductions,
      ytdNet,
      avgMonthlySalary: ytdRecords.length > 0 ? ytdNet / ytdRecords.length : 0,
      totalTaxDeducted
    }

    return NextResponse.json({
      success: true,
      data: summary
    })

  } catch (error) {
    console.error('Error fetching payroll summary:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payroll summary' },
      { status: 500 }
    )
  }
}
