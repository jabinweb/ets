import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user || !hasRole(user, ['STUDENT'])) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Student access required' },
        { status: 401 }
      )
    }

    const student = await prisma.user.findUnique({
      where: { email: user.email },
      include: {
        class: true
      }
    })

    if (!student || !student.class) {
      return NextResponse.json(
        { success: false, error: 'Student or class not found' },
        { status: 404 }
      )
    }

    // Fetch schedules for the student's class
    const schedules = await prisma.timetableEntry.findMany({
      where: {
        classId: student.classId!
      },
      include: {
        subject: true,
        class: true
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
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          duration: calculateDuration(schedule.startTime, schedule.endTime)
        }))
    }))

    return NextResponse.json({
      success: true,
      data: {
        studentName: student.name,
        className: student.class.name,
        section: student.class.section,
        timetable,
        totalClasses: schedules.length
      }
    })

  } catch (error) {
    console.error('Error fetching student timetable:', error)
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
