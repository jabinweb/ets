import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
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

    // Check if entry exists
    const existingEntry = await prisma.timetableEntry.findUnique({
      where: { id }
    })

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, message: "Timetable entry not found" },
        { status: 404 }
      )
    }

    // Check for time slot conflicts (excluding current entry)
    const conflictingEntries = await prisma.timetableEntry.findMany({
      where: {
        classId,
        day,
        id: { not: id }
      }
    })

    for (const entry of conflictingEntries) {
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

    // Update timetable entry
    const updatedTimetable = await prisma.timetableEntry.update({
      where: { id },
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
      data: updatedTimetable,
      message: "Timetable entry updated successfully"
    })
  } catch (error) {
    console.error('Error updating timetable entry:', error)
    return NextResponse.json(
      { success: false, message: "Failed to update timetable entry" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if entry exists
    const existingEntry = await prisma.timetableEntry.findUnique({
      where: { id }
    })

    if (!existingEntry) {
      return NextResponse.json(
        { success: false, message: "Timetable entry not found" },
        { status: 404 }
      )
    }

    // Delete timetable entry
    await prisma.timetableEntry.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Timetable entry deleted successfully"
    })
  } catch (error) {
    console.error('Error deleting timetable entry:', error)
    return NextResponse.json(
      { success: false, message: "Failed to delete timetable entry" },
      { status: 500 }
    )
  }
}
