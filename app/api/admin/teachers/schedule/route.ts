import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

interface TeacherScheduleData {
  id: string
  name: string
  email: string
  subjects: string[]
  totalClasses: number
  weeklyHours: number
  schedules: Array<{
    id: string
    day: string
    startTime: string
    endTime: string
    subjectName: string
    className: string
    room: string
  }>
}

interface ScheduleEntry {
  id: string
  teacherId: string
  teacherName: string
  subjectName: string
  className: string
  day: string
  startTime: string
  endTime: string
  room: string
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

    // Get all timetable entries with proper teacher assignment
    const timetableEntries = await prisma.timetableEntry.findMany({
      include: {
        subject: {
          include: {
            teachers: {
              include: {
                teacher: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        class: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    // Create a map to track room assignments per time slot
    const roomAssignments = new Map<string, string>() // key: day-time, value: room

    // Process each timetable entry to create schedule entries
    const scheduleEntries: ScheduleEntry[] = []
    const teacherScheduleMap = new Map<string, Array<{
      id: string
      day: string
      startTime: string
      endTime: string
      subjectName: string
      className: string
      room: string
    }>>()

    timetableEntries.forEach((entry) => {
      const timeSlotKey = `${entry.day}-${entry.startTime}`
      
      // Assign room if not already assigned for this time slot
      if (!roomAssignments.has(timeSlotKey)) {
        const roomNumber = 100 + roomAssignments.size
        roomAssignments.set(timeSlotKey, `Room ${roomNumber}`)
      }
      
      const assignedRoom = roomAssignments.get(timeSlotKey)!

      // Get the primary teacher for this subject (first teacher assigned to subject)
      const primaryTeacher = entry.subject.teachers[0]?.teacher || entry.class.teacher

      if (primaryTeacher) {
        const scheduleEntry: ScheduleEntry = {
          id: entry.id,
          teacherId: primaryTeacher.id,
          teacherName: primaryTeacher.name || 'Unknown',
          subjectName: entry.subject.name,
          className: entry.class.name,
          day: entry.day,
          startTime: entry.startTime,
          endTime: entry.endTime,
          room: assignedRoom
        }

        scheduleEntries.push(scheduleEntry)

        // Add to teacher's schedule
        if (!teacherScheduleMap.has(primaryTeacher.id)) {
          teacherScheduleMap.set(primaryTeacher.id, [])
        }
        teacherScheduleMap.get(primaryTeacher.id)!.push({
          id: entry.id,
          day: entry.day,
          startTime: entry.startTime,
          endTime: entry.endTime,
          subjectName: entry.subject.name,
          className: entry.class.name,
          room: assignedRoom
        })
      }
    })

    // Get all teachers and build comprehensive data
    const teachers = await prisma.user.findMany({
      where: { role: Role.TEACHER },
      include: {
        teacherSubjects: {
          include: {
            subject: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    const teachersData: TeacherScheduleData[] = teachers.map(teacher => {
      const teacherSchedules = teacherScheduleMap.get(teacher.id) || []

      return {
        id: teacher.id,
        name: teacher.name || 'Unknown',
        email: teacher.email,
        subjects: teacher.teacherSubjects.map(ts => ts.subject.name),
        totalClasses: teacherSchedules.length,
        weeklyHours: teacherSchedules.length, // Assuming 1 hour per class
        schedules: teacherSchedules
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        teachers: teachersData,
        schedules: scheduleEntries
      }
    })

  } catch (error) {
    console.error('Error fetching teacher schedules:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teacher schedules' },
      { status: 500 }
    )
  }
}

// POST - Create new schedule entry with conflict checking
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
    const { classId, subjectId, day, startTime, endTime, teacherId } = body

    // Validate required fields
    if (!classId || !subjectId || !day || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check for scheduling conflicts

    // 1. Check if the time slot is already occupied for this class
    const classConflict = await prisma.timetableEntry.findFirst({
      where: {
        classId,
        day,
        startTime
      }
    })

    if (classConflict) {
      return NextResponse.json(
        { success: false, error: 'This class already has a subject scheduled at this time' },
        { status: 400 }
      )
    }

    // 2. Check if the teacher is already assigned to another class at the same time
    if (teacherId) {
      const teacherConflict = await prisma.timetableEntry.findFirst({
        where: {
          day,
          startTime,
          subject: {
            teachers: {
              some: {
                teacherId: teacherId
              }
            }
          }
        },
        include: {
          class: true,
          subject: true
        }
      })

      if (teacherConflict) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Teacher is already scheduled to teach ${teacherConflict.subject.name} to ${teacherConflict.class.name} at this time` 
          },
          { status: 400 }
        )
      }
    }

    // Create new timetable entry
    const newEntry = await prisma.timetableEntry.create({
      data: {
        classId,
        subjectId,
        day,
        startTime,
        endTime
      },
      include: {
        subject: {
          select: {
            name: true
          }
        },
        class: {
          select: {
            name: true,
            teacher: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // If a specific teacher is provided, ensure they are assigned to teach this subject
    if (teacherId) {
      await prisma.teacherSubject.upsert({
        where: { 
          teacherId_subjectId: { 
            teacherId: teacherId, 
            subjectId: subjectId 
          } 
        },
        update: {},
        create: { 
          teacherId: teacherId, 
          subjectId: subjectId 
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Schedule entry created successfully',
      data: newEntry
    })

  } catch (error) {
    console.error('Error creating schedule entry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create schedule entry' },
      { status: 500 }
    )
  }
}

// PUT - Update schedule entry with conflict checking
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('id')
    const body = await request.json()
    const { classId, subjectId, day, startTime, endTime } = body

    if (!entryId) {
      return NextResponse.json(
        { success: false, error: 'Schedule entry ID is required' },
        { status: 400 }
      )
    }

    // Check for conflicts (excluding the current entry)
    const classConflict = await prisma.timetableEntry.findFirst({
      where: {
        classId,
        day,
        startTime,
        id: { not: entryId }
      }
    })

    if (classConflict) {
      return NextResponse.json(
        { success: false, error: 'This class already has a subject scheduled at this time' },
        { status: 400 }
      )
    }

    // Update the timetable entry
    const updatedEntry = await prisma.timetableEntry.update({
      where: { id: entryId },
      data: {
        classId,
        subjectId,
        day,
        startTime,
        endTime
      },
      include: {
        subject: {
          select: {
            name: true
          }
        },
        class: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Schedule entry updated successfully',
      data: updatedEntry
    })

  } catch (error) {
    console.error('Error updating schedule entry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update schedule entry' },
      { status: 500 }
    )
  }
}

// DELETE - Remove schedule entry
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('id')

    if (!entryId) {
      return NextResponse.json(
        { success: false, error: 'Schedule entry ID is required' },
        { status: 400 }
      )
    }

    // Delete the timetable entry
    await prisma.timetableEntry.delete({
      where: { id: entryId }
    })

    return NextResponse.json({
      success: true,
      message: 'Schedule entry deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting schedule entry:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete schedule entry' },
      { status: 500 }
    )
  }
}
