import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { DayOfWeek } from '@prisma/client'

interface ScheduleRequestBody {
  classId: string
  subjectId: string
  day: string
  startTime: string
  endTime: string
}

interface ScheduleResponse {
  success: boolean
  message?: string
  data?: unknown
  error?: string
}

// PUT - Update schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ScheduleResponse>> {
  const resolvedParams = await params

  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: ScheduleRequestBody = await request.json()

    // Validate required fields
    if (!body.classId || !body.subjectId || !body.day || !body.startTime || !body.endTime) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate day
    const validDays = Object.values(DayOfWeek)
    if (!validDays.includes(body.day as DayOfWeek)) {
      return NextResponse.json(
        { success: false, error: 'Invalid day of week' },
        { status: 400 }
      )
    }

    // Validate time format and logic
    if (body.startTime >= body.endTime) {
      return NextResponse.json(
        { success: false, error: 'End time must be after start time' },
        { status: 400 }
      )
    }

    // Check if schedule exists
    const existingSchedule = await prisma.timetableEntry.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // Check for schedule conflicts (excluding current schedule)
    const conflictingSchedule = await prisma.timetableEntry.findFirst({
      where: {
        id: { not: resolvedParams.id },
        classId: body.classId,
        day: body.day as DayOfWeek,
        OR: [
          {
            AND: [
              { startTime: { lte: body.startTime } },
              { endTime: { gt: body.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: body.endTime } },
              { endTime: { gte: body.endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: body.startTime } },
              { endTime: { lte: body.endTime } }
            ]
          }
        ]
      }
    })

    if (conflictingSchedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule conflict detected. This class already has a schedule during this time period.' },
        { status: 409 }
      )
    }

    // Update the schedule
    const updatedSchedule = await prisma.timetableEntry.update({
      where: { id: resolvedParams.id },
      data: {
        classId: body.classId,
        subjectId: body.subjectId,
        day: body.day as DayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true,
            grade: true
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Schedule updated successfully',
      data: updatedSchedule
    })

  } catch (error) {
    console.error('Error updating schedule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update schedule' },
      { status: 500 }
    )
  }
}

// DELETE - Delete schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ScheduleResponse>> {
  const resolvedParams = await params

  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if schedule exists
    const existingSchedule = await prisma.timetableEntry.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingSchedule) {
      return NextResponse.json(
        { success: false, error: 'Schedule not found' },
        { status: 404 }
      )
    }

    // Delete the schedule
    await prisma.timetableEntry.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete schedule' },
      { status: 500 }
    )
  }
}


