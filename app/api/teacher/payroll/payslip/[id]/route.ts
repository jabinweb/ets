import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getSchoolSettings } from '@/lib/settings'
import { Decimal } from '@prisma/client/runtime/library'

// Type definitions for payroll record - Updated to match Prisma types
interface PayrollRecord {
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
  paymentDate?: Date | null
  paymentMethod?: string | null
  bankAccount?: string | null
  transactionId?: string | null
  status: string
  workingDays: number
  actualDays: number
  notes?: string | null
  employee: {
    name: string | null
    email: string
  }
}

// Type definitions for school settings - Updated to match lib/settings.ts
interface SchoolSettings {
  schoolName: string
  schoolPhone?: string | null
  adminEmail?: string | null
  currencySymbol: string
  currencyPosition: string
}

// Type definitions for jsPDF with autoTable
interface AutoTableData {
  cell: {
    text: string[]
    styles: {
      fillColor?: number[]
      textColor?: number[]
      fontStyle?: string
    }
  }
}

interface AutoTableOptions {
  startY: number
  head: string[][]
  body: string[][]
  theme: string
  headStyles: {
    fillColor: number[]
  }
  margin?: {
    left: number
    right: number
  }
  tableWidth?: number
  styles?: {
    fontSize: number
  }
  columnStyles?: {
    [key: number]: {
      fontStyle?: string
      cellWidth?: number
      halign?: string
    }
  }
  didParseCell?: (data: AutoTableData) => void
}

interface JsPDFWithAutoTable {
  autoTable: (options: AutoTableOptions) => void
  lastAutoTable: {
    finalY: number
  }
  setFillColor: (...args: number[]) => void
  rect: (x: number, y: number, width: number, height: number, style?: string) => void
  setTextColor: (...args: number[]) => void
  setFontSize: (size: number) => void
  setFont: (font: string, style?: string) => void
  text: (text: string, x: number, y: number) => void
  splitTextToSize: (text: string, maxWidth: number) => string[]
  output: (type: string) => ArrayBuffer
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: recordId } = await params
    const teacherId = session.user.id

    // Get payroll record
    const payrollRecord = await prisma.payrollRecord.findFirst({
      where: {
        id: recordId,
        employeeId: teacherId
      },
      include: {
        employee: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!payrollRecord) {
      return NextResponse.json(
        { success: false, error: 'Payroll record not found' },
        { status: 404 }
      )
    }

    // Get school settings for currency
    const settings = await getSchoolSettings()

    // Generate PDF buffer using jsPDF
    const pdfBuffer = await generatePayslipPDF(payrollRecord, settings)
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="payslip-${recordId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Error generating payslip:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate payslip' },
      { status: 500 }
    )
  }
}

async function generatePayslipPDF(payrollRecord: PayrollRecord, settings: SchoolSettings): Promise<Buffer> {
  try {
    // Dynamic imports for PDF generation - fixes chunk loading issues
    const [{ jsPDF }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ])

    const doc = new jsPDF() as unknown as JsPDFWithAutoTable
    
    // Helper function to format currency - Updated to handle Decimal
    const formatCurrency = (amount: Decimal | number | string | null | undefined) => {
      // Convert Decimal to number and handle edge cases
      let numAmount: number
      
      if (amount instanceof Decimal) {
        numAmount = amount.toNumber()
      } else if (typeof amount === 'number') {
        numAmount = amount
      } else if (typeof amount === 'string') {
        numAmount = parseFloat(amount)
      } else {
        numAmount = 0
      }
      
      // Handle NaN or invalid numbers
      const validAmount = isNaN(numAmount) ? 0 : numAmount
      
      const formatted = validAmount.toFixed(2)
      return settings.currencyPosition === 'before' 
        ? `${settings.currencySymbol}${formatted}`
        : `${formatted}${settings.currencySymbol}`
    }

    // Set up colors
    const primaryColor = [30, 64, 175] // Blue
    const accentColor = [5, 150, 105] // Green
    const textColor = [51, 51, 51] // Dark gray

    // Header with school branding
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 40, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text(settings.schoolName, 20, 20)
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('Employee Payslip', 20, 30)

    // Reset text color
    doc.setTextColor(...textColor)

    // Employee Information Section
    let yPos = 55
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Employee Information', 20, yPos)

    yPos += 15
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')

    const employeeInfo = [
      ['Employee Name:', payrollRecord.employee.name || 'N/A'],
      ['Employee ID:', payrollRecord.employeeId],
      ['Email:', payrollRecord.employee.email],
      ['Pay Period:', payrollRecord.payPeriod],
      ['Payment Date:', payrollRecord.paymentDate ? new Date(payrollRecord.paymentDate).toLocaleDateString() : 'Pending']
    ]

    employeeInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(value, 80, yPos)
      yPos += 8
    })

    // Attendance Information
    yPos += 10
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Attendance Summary', 20, yPos)

    yPos += 10
    const attendanceData = [
      ['Working Days', payrollRecord.workingDays.toString()],
      ['Days Worked', payrollRecord.actualDays.toString()],
      ['Attendance Rate', `${((payrollRecord.actualDays / payrollRecord.workingDays) * 100).toFixed(1)}%`]
    ]

    // Create attendance table
    doc.autoTable({
      startY: yPos,
      head: [['Metric', 'Value']],
      body: attendanceData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor },
      margin: { left: 20, right: 20 },
      tableWidth: 80
    })

    yPos = doc.lastAutoTable.finalY + 20

    // Earnings and Deductions Table
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Salary Breakdown', 20, yPos)

    yPos += 10

    const salaryData = [
      // Earnings
      ['EARNINGS', '', ''],
      ['Base Salary', '', formatCurrency(payrollRecord.baseSalary)],
      ['Allowances', '', formatCurrency(payrollRecord.allowances)],
      ['Overtime', '', formatCurrency(payrollRecord.overtime)],
      ['Bonus', '', formatCurrency(payrollRecord.bonus)],
      ['Gross Salary', '', formatCurrency(payrollRecord.grossSalary)],
      ['', '', ''],
      // Deductions
      ['DEDUCTIONS', '', ''],
      ['Income Tax', '', formatCurrency(payrollRecord.taxDeducted)],
      ['Health Insurance', '', formatCurrency(payrollRecord.insurance)],
      ['Provident Fund', '', formatCurrency(payrollRecord.providentFund)],
      ['Other Deductions', '', formatCurrency(payrollRecord.otherDeductions)],
      ['Total Deductions', '', formatCurrency(payrollRecord.totalDeductions)]
    ]

    doc.autoTable({
      startY: yPos,
      head: [['Description', '', 'Amount']],
      body: salaryData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 40 },
        2: { cellWidth: 50, halign: 'right' }
      },
      didParseCell: (data: AutoTableData) => {
        // Style section headers
        if (data.cell.text[0] === 'EARNINGS' || data.cell.text[0] === 'DEDUCTIONS') {
          data.cell.styles.fillColor = accentColor
          data.cell.styles.textColor = [255, 255, 255]
          data.cell.styles.fontStyle = 'bold'
        }
        // Style totals
        if (data.cell.text[0] === 'Gross Salary' || data.cell.text[0] === 'Total Deductions') {
          data.cell.styles.fontStyle = 'bold'
          data.cell.styles.fillColor = [240, 240, 240]
        }
      },
      margin: { left: 20, right: 20 }
    })

    yPos = doc.lastAutoTable.finalY + 15

    // Net Salary Highlight Box
    doc.setFillColor(...accentColor)
    doc.rect(20, yPos, 170, 25, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('NET SALARY:', 30, yPos + 10)
    doc.text(formatCurrency(payrollRecord.netSalary), 30, yPos + 20)

    // Reset text color
    doc.setTextColor(...textColor)
    yPos += 35

    // Payment Information (if available)
    if (payrollRecord.paymentDate) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Payment Details', 20, yPos)

      yPos += 10
      const paymentInfo = [
        ['Payment Method', payrollRecord.paymentMethod || 'Bank Transfer'],
        ['Transaction ID', payrollRecord.transactionId || 'N/A'],
        ['Bank Account', payrollRecord.bankAccount || 'XXXX-XXXX-XXXX-1234'],
        ['Status', payrollRecord.status]
      ]

      doc.autoTable({
        startY: yPos,
        head: [['Detail', 'Information']],
        body: paymentInfo,
        theme: 'grid',
        headStyles: { fillColor: primaryColor },
        margin: { left: 20, right: 20 },
        tableWidth: 120
      })

      yPos = doc.lastAutoTable.finalY + 15
    }

    // Notes section (if available) - Fixed splitTextToSize usage
    if (payrollRecord.notes) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Notes:', 20, yPos)
      
      yPos += 8
      doc.setFont('helvetica', 'normal')
      const splitNotes = doc.splitTextToSize(payrollRecord.notes, 170)
      // Handle both string and string[] return types properly
      if (Array.isArray(splitNotes)) {
        splitNotes.forEach((line, index) => {
          doc.text(line, 20, yPos + (index * 6))
        })
        yPos += splitNotes.length * 6 + 10
      } else {
        doc.text(splitNotes, 20, yPos)
        yPos += 16
      }
    }

    // Footer
    yPos = Math.max(yPos, 250) // Ensure footer is at bottom
    doc.setFillColor(240, 240, 240)
    doc.rect(0, yPos, 210, 40, 'F')
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('This is a system-generated payslip. For queries, contact HR Department.', 20, yPos + 10)
    doc.text(`${settings.schoolName} | Email: ${settings.adminEmail || 'N/A'} | Phone: ${settings.schoolPhone || 'N/A'}`, 20, yPos + 20)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPos + 30)

    // Convert to buffer for server response
    const pdfOutput = doc.output('arraybuffer')
    return Buffer.from(pdfOutput)

  } catch (error) {
    console.error('Error in PDF generation:', error)
    // Fallback: Generate a simple text-based PDF
    return generateFallbackPDF(payrollRecord, settings)
  }
}

// Fallback PDF generation without autoTable - Updated parameter types
async function generateFallbackPDF(payrollRecord: PayrollRecord, settings: SchoolSettings): Promise<Buffer> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF()
  
  const formatCurrency = (amount: Decimal | number | string | null | undefined) => {
    // Convert Decimal to number and handle edge cases
    let numAmount: number
    
    if (amount instanceof Decimal) {
      numAmount = amount.toNumber()
    } else if (typeof amount === 'number') {
      numAmount = amount
    } else if (typeof amount === 'string') {
      numAmount = parseFloat(amount)
    } else {
      numAmount = 0
    }
    
    // Handle NaN or invalid numbers
    const validAmount = isNaN(numAmount) ? 0 : numAmount
    
    const formatted = validAmount.toFixed(2)
    return settings.currencyPosition === 'before' 
      ? `${settings.currencySymbol}${formatted}`
      : `${formatted}${settings.currencySymbol}`
  }

  // Simple header
  doc.setFontSize(20)
  doc.text(settings.schoolName, 20, 20)
  doc.setFontSize(16)
  doc.text('Employee Payslip', 20, 30)
  
  // Employee info
  doc.setFontSize(12)
  let y = 50
  doc.text(`Employee: ${payrollRecord.employee.name || 'N/A'}`, 20, y)
  y += 10
  doc.text(`Pay Period: ${payrollRecord.payPeriod}`, 20, y)
  y += 20
  
  // Earnings
  doc.text('EARNINGS:', 20, y)
  y += 10
  doc.text(`Base Salary: ${formatCurrency(payrollRecord.baseSalary)}`, 30, y)
  y += 7
  doc.text(`Allowances: ${formatCurrency(payrollRecord.allowances)}`, 30, y)
  y += 7
  doc.text(`Overtime: ${formatCurrency(payrollRecord.overtime)}`, 30, y)
  y += 7
  doc.text(`Bonus: ${formatCurrency(payrollRecord.bonus)}`, 30, y)
  y += 10
  doc.text(`Gross Salary: ${formatCurrency(payrollRecord.grossSalary)}`, 30, y)
  y += 20
  
  // Deductions
  doc.text('DEDUCTIONS:', 20, y)
  y += 10
  doc.text(`Tax: ${formatCurrency(payrollRecord.taxDeducted)}`, 30, y)
  y += 7
  doc.text(`Insurance: ${formatCurrency(payrollRecord.insurance)}`, 30, y)
  y += 7
  doc.text(`Provident Fund: ${formatCurrency(payrollRecord.providentFund)}`, 30, y)
  y += 10
  doc.text(`Total Deductions: ${formatCurrency(payrollRecord.totalDeductions)}`, 30, y)
  y += 20
  
  // Net salary
  doc.setFontSize(16)
  doc.text(`NET SALARY: ${formatCurrency(payrollRecord.netSalary)}`, 20, y)
  
  const pdfOutput = doc.output('arraybuffer')
  return Buffer.from(pdfOutput)
}
