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

interface ScheduleData {
  id: string
  classId: string
  subjectId: string
  day: DayOfWeek
  startTime: string
  endTime: string
  class: {
    id: string
    name: string
    section: string
    grade: number
  }
  subject: {
    id: string
    name: string
    code: string
  }
}

interface ScheduleResponse {
  success: boolean
  message?: string
  data?: ScheduleData | ScheduleData[]
  error?: string
}

// GET - Fetch all schedules
export async function GET(request: NextRequest): Promise<NextResponse<ScheduleResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const day = searchParams.get('day')

    const whereClause: any = {}
    if (classId) whereClause.classId = classId
    if (day) whereClause.day = day as DayOfWeek

    const schedules = await prisma.timetableEntry.findMany({
      where: whereClause,
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
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: schedules
    })

  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new schedule
export async function POST(request: NextRequest): Promise<NextResponse<ScheduleResponse>> {
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

    // Check if class exists
    const classExists = await prisma.class.findUnique({
      where: { id: body.classId }
    })

    if (!classExists) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      )
    }

    // Check if subject exists
    const subjectExists = await prisma.subject.findUnique({
      where: { id: body.subjectId }
    })

    if (!subjectExists) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      )
    }

    // Check for schedule conflicts (same class, day, and overlapping time)
    const conflictingSchedule = await prisma.timetableEntry.findFirst({
      where: {
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

    // Create the schedule
    const schedule = await prisma.timetableEntry.create({
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
      message: 'Schedule created successfully',
      data: schedule
    })

  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create schedule' },
      { status: 500 }
    )
  }
}
