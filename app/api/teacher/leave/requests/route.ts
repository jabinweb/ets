import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { LeaveType } from '@prisma/client'

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

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        employeeId: teacherId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: leaveRequests
    })

  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leave requests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json()

    const {
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason
    } = body

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: teacherId,
        leaveType: leaveType as LeaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays: parseInt(totalDays),
        reason,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveRequest
    })

  } catch (error) {
    console.error('Error creating leave request:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create leave request' },
      { status: 500 }
    )
  }
}
