import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Role, PayrollStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// Define proper types for payroll data with Decimal handling
interface PayrollRecordWithEmployee {
  id: string
  employeeId: string
  payPeriod: string
  payYear: number
  payMonth: number
  baseSalary: Decimal
  allowances: Decimal
  overtime: Decimal
  bonus: Decimal
  taxDeducted: Decimal
  insurance: Decimal
  providentFund: Decimal
  otherDeductions: Decimal
  grossSalary: Decimal
  totalDeductions: Decimal
  netSalary: Decimal
  status: PayrollStatus
  paymentDate?: Date | null
  paymentMethod?: string | null
  bankAccount?: string | null
  transactionId?: string | null
  workingDays: number
  actualDays: number
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  employee: {
    name: string | null
    email: string
    dateOfJoining?: Date | null
    experience?: number | null
  }
}

interface TransformedPayrollData {
  id: string
  employeeId: string
  employeeName: string
  position: string
  department: string
  baseSalary: number
  allowances: number
  deductions: number
  overtime: number
  netSalary: number
  payPeriod: string
  payDate: string
  status: string
  bankAccount: string
  taxDeducted: number
}

// Helper function to safely convert Decimal to number
function decimalToNumber(decimal: Decimal | null | undefined): number {
  if (!decimal) return 0
  return Number(decimal.toString())
}

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get existing payroll records
    const existingPayroll = await prisma.payrollRecord.findMany({
      include: {
        employee: {
          select: {
            name: true,
            email: true,
            dateOfJoining: true,
            experience: true
          }
        }
      },
      orderBy: [
        { payYear: 'desc' },
        { payMonth: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // If no payroll records exist, generate for current month
    if (existingPayroll.length === 0) {
      await generateMonthlyPayroll()
      
      // Fetch again after generation
      const newPayroll = await prisma.payrollRecord.findMany({
        include: {
          employee: {
            select: {
              name: true,
              email: true,
              dateOfJoining: true,
              experience: true
            }
          }
        },
        orderBy: [
          { payYear: 'desc' },
          { payMonth: 'desc' },
          { createdAt: 'desc' }
        ]
      })

      return NextResponse.json({
        success: true,
        data: transformPayrollData(newPayroll)
      })
    }

    return NextResponse.json({
      success: true,
      data: transformPayrollData(existingPayroll)
    })

  } catch (error) {
    console.error('Error fetching payroll data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payroll data' },
      { status: 500 }
    )
  }
}

async function generateMonthlyPayroll(): Promise<void> {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  // Get all teachers
  const teachers = await prisma.user.findMany({
    where: { role: Role.TEACHER },
    include: {
      classTeacher: {
        include: {
          _count: { select: { students: true } }
        }
      },
      teacherSubjects: true
    }
  })

  for (const teacher of teachers) {
    // Check if payroll already exists for this period
    const existingPayroll = await prisma.payrollRecord.findUnique({
      where: {
        employeeId_payYear_payMonth: {
          employeeId: teacher.id,
          payYear: currentYear,
          payMonth: currentMonth
        }
      }
    })

    if (!existingPayroll) {
      // Calculate salary components with proper Decimal handling
      const baseSalary = decimalToNumber(teacher.salary) || calculateBaseSalary(teacher.experience || 1)
      const allowances = calculateAllowances(teacher.classTeacher.length, teacher.teacherSubjects.length)
      const overtime = Math.floor(Math.random() * 500) + 100 // Random overtime for demo
      
      // Calculate deductions
      const taxRate = 0.15
      const insurance = 150
      const providentFund = baseSalary * 0.12
      
      const grossSalary = baseSalary + allowances + overtime
      const taxDeducted = grossSalary * taxRate
      const totalDeductions = taxDeducted + insurance + providentFund
      const netSalary = grossSalary - totalDeductions

      await prisma.payrollRecord.create({
        data: {
          employeeId: teacher.id,
          payPeriod: `${getMonthName(currentMonth)} ${currentYear}`,
          payYear: currentYear,
          payMonth: currentMonth,
          baseSalary: new Decimal(baseSalary),
          allowances: new Decimal(allowances),
          overtime: new Decimal(overtime),
          bonus: new Decimal(0),
          taxDeducted: new Decimal(taxDeducted),
          insurance: new Decimal(insurance),
          providentFund: new Decimal(providentFund),
          otherDeductions: new Decimal(0),
          grossSalary: new Decimal(grossSalary),
          totalDeductions: new Decimal(totalDeductions),
          netSalary: new Decimal(netSalary),
          status: PayrollStatus.PENDING,
          workingDays: 30,
          actualDays: 30,
          bankAccount: `****${Math.floor(Math.random() * 9000) + 1000}`
        }
      })
    }
  }
}

function calculateBaseSalary(experience: number): number {
  // Base salary calculation based on experience
  const baseAmount = 3000
  const experienceBonus = experience * 200
  return baseAmount + experienceBonus
}

function calculateAllowances(classCount: number, subjectCount: number): number {
  const classAllowance = classCount * 200
  const subjectAllowance = subjectCount * 150
  const transportAllowance = 300
  return classAllowance + subjectAllowance + transportAllowance
}

function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month - 1]
}

function transformPayrollData(payrollRecords: PayrollRecordWithEmployee[]): TransformedPayrollData[] {
  return payrollRecords.map(record => ({
    id: record.id,
    employeeId: `EMP${record.employeeId.slice(-4).toUpperCase()}`,
    employeeName: record.employee.name || 'Unknown',
    position: calculatePosition(record.employee.experience || 0),
    department: 'Teaching Staff',
    baseSalary: decimalToNumber(record.baseSalary),
    allowances: decimalToNumber(record.allowances),
    deductions: decimalToNumber(record.totalDeductions),
    overtime: decimalToNumber(record.overtime),
    netSalary: decimalToNumber(record.netSalary),
    payPeriod: record.payPeriod,
    payDate: record.paymentDate?.toISOString() || new Date(record.payYear, record.payMonth, 0).toISOString(),
    status: record.status.toLowerCase(),
    bankAccount: record.bankAccount || '****0000',
    taxDeducted: decimalToNumber(record.taxDeducted)
  }))
}

function calculatePosition(experience: number): string {
  if (experience >= 10) return 'Senior Teacher'
  if (experience >= 5) return 'Teacher'
  return 'Assistant Teacher'
}

// POST - Process payroll
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, recordId, status } = body

    if (action === 'updateStatus' && recordId && status) {
      const updatedRecord = await prisma.payrollRecord.update({
        where: { id: recordId },
        data: { 
          status: status.toUpperCase(),
          paymentDate: status === 'paid' ? new Date() : null
        }
      })

      return NextResponse.json({
        success: true,
        data: updatedRecord
      })
    }

    if (action === 'processPayroll') {
      // Generate payroll for current month if not exists
      await generateMonthlyPayroll()
      
      return NextResponse.json({
        success: true,
        message: 'Payroll processed successfully'
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error processing payroll:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process payroll' },
      { status: 500 }
    )
  }
}
