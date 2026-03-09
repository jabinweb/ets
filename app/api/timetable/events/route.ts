import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { startOfWeek, addDays, addMonths } from 'date-fns'

// GET - Retrieve timetable events for a user
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 })
    }
    
    const userId = session.user.id
    const userRole = session.user.role
    
    // Get URL query parameters
    const searchParams = request.nextUrl.searchParams
    const start = searchParams.get('start') // Start date
    const end = searchParams.get('end') // End date
    
    // Calculate default date range if not provided
    const startDate = start ? new Date(start) : new Date()
    const endDate = end ? new Date(end) : addMonths(startDate, 1)
    
    // Retrieve events based on user role
    if (userRole === 'STUDENT') {
      // Find student's class
      const student = await prisma.user.findUnique({
        where: { id: userId },
        select: { classId: true }
      })
      
      if (!student?.classId) {
        return NextResponse.json({
          success: false,
          error: "Student not assigned to any class"
        }, { status: 404 })
      }
      
      // Get timetable entries for student's class
      const timetableEntries = await prisma.timetableEntry.findMany({
        where: {
          classId: student.classId
        },
        include: {
          class: true,
          subject: true
        }
      })
      
      // Get exams for student's class
      const exams = await prisma.exam.findMany({
        where: {
          classId: student.classId,
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          class: true,
          subject: true
        }
      })
      
      // Get school holidays
      const holidays = await prisma.announcement.findMany({
        where: {
          type: 'EVENT',
          isActive: true,
          publishDate: {
            gte: startDate,
            lte: endDate
          }
        }
      })
      
      // Generate recurring events from timetable entries
      // For example, weekly classes
      const events = generateRecurringEventsFromTimetable(timetableEntries, startDate, endDate)
      
      // Add exams as events
      const examEvents = exams.map(exam => ({
        id: `exam-${exam.id}`,
        title: `${exam.title} - ${exam.subject.name}`,
        description: exam.description || '',
        startTime: new Date(exam.date).toISOString(),
        endTime: new Date(new Date(exam.date).setMinutes(new Date(exam.date).getMinutes() + exam.duration)).toISOString(),
        location: exam.class.name,
        type: 'exam' as const,
        recurring: false
      }))
      
      // Add holidays as events
      const holidayEvents = holidays.map(holiday => ({
        id: `holiday-${holiday.id}`,
        title: holiday.title,
        description: holiday.content,
        startTime: new Date(holiday.publishDate).toISOString(),
        endTime: holiday.expiryDate 
          ? new Date(holiday.expiryDate).toISOString()
          : new Date(new Date(holiday.publishDate).setHours(23, 59, 59)).toISOString(),
        location: 'School-wide',
        type: 'holiday' as const,
        recurring: false
      }))
      
      return NextResponse.json({
        success: true,
        events: [...events, ...examEvents, ...holidayEvents]
      })
      
    } else if (userRole === 'TEACHER') {
      // For teachers, get their assigned classes and timetable entries
      const teacherClasses = await prisma.class.findMany({
        where: {
          teacherId: userId
        }
      })
      
      const classIds = teacherClasses.map(cls => cls.id)
      
      // Get teacher's subject assignments
    //   const teacherSubjects = await prisma.teacherSubject.findMany({
    //     where: {
    //       teacherId: userId
    //     },
    //     include: {
    //       subject: true
    //     }
    //   })
      
      // Get timetable entries
      const timetableEntries = await prisma.timetableEntry.findMany({
        where: {
          classId: {
            in: classIds
          }
        },
        include: {
          class: true,
          subject: true
        }
      })
      
      // Get exams the teacher is responsible for
      const exams = await prisma.exam.findMany({
        where: {
          classId: {
            in: classIds
          },
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          class: true,
          subject: true
        }
      })
      
      // Get meetings/PTMs
      const meetings = await prisma.announcement.findMany({
        where: {
          type: 'EVENT',
          isActive: true,
          publishDate: {
            gte: startDate,
            lte: endDate
          }
        }
      })
      
      // Generate events from timetable
      const events = generateRecurringEventsFromTimetable(timetableEntries, startDate, endDate)
      
      // Add exams
      const examEvents = exams.map(exam => ({
        id: `exam-${exam.id}`,
        title: `${exam.title} - ${exam.subject.name}`,
        description: exam.description || '',
        startTime: new Date(exam.date).toISOString(),
        endTime: new Date(new Date(exam.date).setMinutes(new Date(exam.date).getMinutes() + exam.duration)).toISOString(),
        location: exam.class.name,
        type: 'exam' as const,
        recurring: false
      }))
      
      // Add meetings
      const meetingEvents = meetings.map(meeting => ({
        id: `meeting-${meeting.id}`,
        title: meeting.title,
        description: meeting.content,
        startTime: new Date(meeting.publishDate).toISOString(),
        endTime: meeting.expiryDate 
          ? new Date(meeting.expiryDate).toISOString()
          : new Date(new Date(meeting.publishDate).setHours(23, 59, 59)).toISOString(),
        location: 'School Campus',
        type: 'meeting' as const,
        recurring: false
      }))
      
      return NextResponse.json({
        success: true,
        events: [...events, ...examEvents, ...meetingEvents]
      })
      
    }
    
    // For other roles (including ADMIN), return empty calendar
    // Note: Admins have separate dedicated routes for full school management
    return NextResponse.json({
      success: true,
      events: []
    })
    
  } catch (error) {
    console.error("Error fetching timetable:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to retrieve timetable events"
    }, { status: 500 })
  }
}

// Helper function to generate recurring events from timetable
function generateRecurringEventsFromTimetable(
  timetableEntries: Array<{
    id: string
    day: string
    startTime: string
    endTime: string
    class: { name: string }
    subject: { name: string }
  }>,
  startDate: Date,
  endDate: Date
) {
  const events: Array<{
    id: string
    title: string
    description: string
    startTime: string
    endTime: string
    location: string
    type: 'class'
    recurring: boolean
    recurringPattern: 'weekly'
  }> = []
  const currentWeekStart = startOfWeek(startDate, { weekStartsOn: 1 }) // Monday as start of week
  const endWeekStart = startOfWeek(endDate, { weekStartsOn: 1 })
  
  // Map day of week strings to numbers (0 = Monday, 6 = Sunday)
  const dayMap: Record<string, number> = {
    'MONDAY': 0,
    'TUESDAY': 1,
    'WEDNESDAY': 2,
    'THURSDAY': 3,
    'FRIDAY': 4,
    'SATURDAY': 5,
    'SUNDAY': 6
  }
  
  // Generate recurring events for each week in the date range
  let weekStart = currentWeekStart
  
  while (weekStart <= endWeekStart) {
    timetableEntries.forEach(entry => {
      // Convert day string to day index
      const dayIndex = dayMap[entry.day]
      if (dayIndex === undefined) return
      
      // Calculate event date for this week
      const eventDate = addDays(weekStart, dayIndex)
      
      // Compare dates only (not time) to avoid timezone issues
      const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate())
      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
      const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
      
      if (eventDateOnly > endDateOnly || eventDateOnly < startDateOnly) {
        return
      }
      
      // Parse start and end times
      const [startHour, startMinute] = entry.startTime.split(':').map(Number)
      const [endHour, endMinute] = entry.endTime.split(':').map(Number)
      
      // Use local time methods to avoid timezone shifts
      const year = eventDate.getFullYear()
      const month = String(eventDate.getMonth() + 1).padStart(2, '0')
      const day = String(eventDate.getDate()).padStart(2, '0')
      const startHourStr = String(startHour).padStart(2, '0')
      const startMinStr = String(startMinute).padStart(2, '0')
      const endHourStr = String(endHour).padStart(2, '0')
      const endMinStr = String(endMinute).padStart(2, '0')
      
      const eventStartTime = `${year}-${month}-${day}T${startHourStr}:${startMinStr}:00`
      const eventEndTime = `${year}-${month}-${day}T${endHourStr}:${endMinStr}:00`
      
      events.push({
        id: `timetable-${entry.id}-${eventDate.toISOString()}`,
        title: `${entry.subject.name} - ${entry.class.name}`,
        description: `Regular scheduled class for ${entry.subject.name}`,
        startTime: eventStartTime,
        endTime: eventEndTime,
        location: entry.class.name,
        type: 'class' as const,
        recurring: true,
        recurringPattern: 'weekly' as const
      })
    })
    
    // Move to next week
    weekStart = addDays(weekStart, 7)
  }
  
  return events
}
