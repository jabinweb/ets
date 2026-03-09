import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { PayrollRecord } from '@prisma/client'

export async function GET(): Promise<NextResponse> {  
  const startTime = Date.now();
  console.log('=== PAYROLL RECORDS API CALLED ===', new Date().toISOString());
  
  try {
    // Get user from NextAuth session
    const session = await auth()
    const user = session?.user
    
    console.log('Auth session check completed in', Date.now() - startTime, 'ms');
    console.log('Payroll records API - User:', !!user, user?.email, user?.role);
    
    if (!user) {
      console.log('No valid session found, unauthorized');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    if (user.role !== 'TEACHER') {
      console.log('User is not a teacher:', user.role);
      return NextResponse.json(
        { success: false, error: 'Access denied. Teacher role required.' },
        { status: 403 }
      )
    }

    const teacherId = user.id
    console.log('Fetching payroll records for teacher ID:', teacherId);
    console.log('Database query start time:', Date.now() - startTime, 'ms');

    // Get existing payroll records with timeout protection
    const payrollRecords = await Promise.race([
      prisma.payrollRecord.findMany({
        where: {
          employeeId: teacherId
        },
        orderBy: [
          { payYear: 'desc' },
          { payMonth: 'desc' }
        ]
      }),
      new Promise<PayrollRecord[]>((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      )
    ]);

    console.log('Database query completed in', Date.now() - startTime, 'ms');
    console.log('Found payroll records:', payrollRecords.length);

    // If no records found, return empty array (production approach)
    if (payrollRecords.length === 0) {
      console.log('No payroll records found for teacher:', teacherId);
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Transform existing records
    const transformedRecords = payrollRecords.map(record => ({
      id: record.id,
      employeeId: record.employeeId,
      payPeriod: record.payPeriod,
      payYear: record.payYear,
      payMonth: record.payMonth,
      baseSalary: Number(record.baseSalary),
      allowances: Number(record.allowances),
      overtime: Number(record.overtime),
      bonus: Number(record.bonus),
      taxDeducted: Number(record.taxDeducted),
      insurance: Number(record.insurance),
      providentFund: Number(record.providentFund),
      otherDeductions: Number(record.otherDeductions),
      grossSalary: Number(record.grossSalary),
      totalDeductions: Number(record.totalDeductions),
      netSalary: Number(record.netSalary),
      paymentDate: record.paymentDate?.toISOString() || null,
      paymentMethod: record.paymentMethod,
      bankAccount: record.bankAccount,
      transactionId: record.transactionId,
      status: record.status,
      workingDays: record.workingDays,
      actualDays: record.actualDays,
      notes: record.notes
    }))

    console.log('Returning transformed records:', transformedRecords.length);

    return NextResponse.json({
      success: true,
      data: transformedRecords
    })

  } catch (error) {
    console.error('Error fetching payroll records:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payroll records' },
      { status: 500 }
    )
  }
}
    