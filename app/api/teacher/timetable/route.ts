import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user || !hasRole(user, ['TEACHER'])) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Teacher access required' },
        { status: 401 }
      )
    }

    const teacher = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        name: true
      }
    })

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Get teacher's subjects and classes
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacherId: teacher.id
      },
      include: {
        subject: {
          include: {
            classes: {
              include: {
                class: true
              }
            }
          }
        }
      }
    })

    // Get unique classes
    const classIds = new Set<string>()
    teacherSubjects.forEach(ts => {
      ts.subject.classes.forEach(cs => {
        classIds.add(cs.classId)
      })
    })

    // Fetch schedules for these classes
    const schedules = await prisma.timetableEntry.findMany({
      where: {
        classId: {
          in: Array.from(classIds)
        }
      },
      include: {
        class: true,
        subject: true
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Group schedules by day
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    
    const timetable = daysOfWeek.map(day => ({
      day,
      classes: schedules
        .filter((schedule) => schedule.day === day)
        .map((schedule) => ({
          id: schedule.id,
          subject: schedule.subject.name,
          subjectCode: schedule.subject.code,
          class: `${schedule.class.name} - ${schedule.class.section}`,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          duration: calculateDuration(schedule.startTime, schedule.endTime)
        }))
    }))

    return NextResponse.json({
      success: true,
      data: {
        teacherName: teacher.name,
        timetable,
        totalClasses: schedules.length
      }
    })

  } catch (error) {
    console.error('Error fetching teacher timetable:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch timetable data' },
      { status: 500 }
    )
  }
}

function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  return endMinutes - startMinutes
}
