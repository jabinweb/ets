import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    const where = classId ? { classId } : {}

    const timetables = await prisma.timetableEntry.findMany({
      where,
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
      data: timetables
    })
  } catch (error) {
    console.error('Error fetching timetables:', error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch timetables" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { classId, subjectId, day, startTime, endTime } = body

    // Validate required fields
    if (!classId || !subjectId || !day || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      )
    }

    // Validate day enum
    const validDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    if (!validDays.includes(day)) {
      return NextResponse.json(
        { success: false, message: "Invalid day of week" },
        { status: 400 }
      )
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { success: false, message: "Invalid time format. Use HH:MM" },
        { status: 400 }
      )
    }

    // Validate start time is before end time
    if (startTime >= endTime) {
      return NextResponse.json(
        { success: false, message: "Start time must be before end time" },
        { status: 400 }
      )
    }

    // Check for time slot conflicts
    const existingEntries = await prisma.timetableEntry.findMany({
      where: {
        classId,
        day
      }
    })

    for (const entry of existingEntries) {
      // Check for time overlap
      if (
        (startTime >= entry.startTime && startTime < entry.endTime) ||
        (endTime > entry.startTime && endTime <= entry.endTime) ||
        (startTime <= entry.startTime && endTime >= entry.endTime)
      ) {
        const subject = await prisma.subject.findUnique({
          where: { id: entry.subjectId },
          select: { name: true }
        })
        
        return NextResponse.json(
          { 
            success: false, 
            message: `Time slot conflict with ${subject?.name || 'another subject'} (${entry.startTime} - ${entry.endTime})` 
          },
          { status: 400 }
        )
      }
    }

    // Verify class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId }
    })
    
    if (!classExists) {
      return NextResponse.json(
        { success: false, message: "Class not found" },
        { status: 404 }
      )
    }

    // Verify subject exists
    const subjectExists = await prisma.subject.findUnique({
      where: { id: subjectId }
    })
    
    if (!subjectExists) {
      return NextResponse.json(
        { success: false, message: "Subject not found" },
        { status: 404 }
      )
    }

    // Create timetable entry
    const timetable = await prisma.timetableEntry.create({
      data: {
        classId,
        subjectId,
        day,
        startTime,
        endTime
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
      data: timetable,
      message: "Timetable entry created successfully"
    })
  } catch (error) {
    console.error('Error creating timetable entry:', error)
    return NextResponse.json(
      { success: false, message: "Failed to create timetable entry" },
      { status: 500 }
    )
  }
}
