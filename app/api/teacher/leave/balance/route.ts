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

    // Get leave requests for current year
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        employeeId: teacherId,
        startDate: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`)
        },
        status: {
          in: ['APPROVED', 'PENDING']
        }
      }
    })

    // Calculate leave balance for each type
    const leaveTypes = [
      { type: 'Annual', totalAllowed: 21 },
      { type: 'Sick', totalAllowed: 10 },
      { type: 'Emergency', totalAllowed: 5 },
      { type: 'Unpaid', totalAllowed: 0 }
    ]

    const leaveBalance = leaveTypes.map(leave => {
      const used = leaveRequests
        .filter(req => req.leaveType === leave.type.toUpperCase())
        .reduce((total, req) => total + req.totalDays, 0)
      
      return {
        leaveType: leave.type,
        totalAllowed: leave.totalAllowed,
        used,
        remaining: Math.max(0, leave.totalAllowed - used)
      }
    })

    return NextResponse.json({
      success: true,
      data: leaveBalance
    })

  } catch (error) {
    console.error('Error fetching leave balance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leave balance' },
      { status: 500 }
    )
  }
}
