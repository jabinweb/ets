import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AttendanceStatus } from '@prisma/client'

export const runtime = "nodejs"

interface AttendanceRequestBody {
  classId: string
  date: string
  records: Array<{
    studentId: string
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
    notes?: string
  }>
}

interface AttendanceResponse {
  success: boolean
  message?: string
  data?: unknown
  error?: string
}

// GET - Fetch attendance records
export async function GET(request: NextRequest): Promise<NextResponse<AttendanceResponse>> {
  try {
    const session = await auth()
    
    // Fix: allow both ADMIN and TEACHER (not just one)
    if (
      !session ||
      (session.user?.role !== 'ADMIN' && session.user?.role !== 'TEACHER')
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '50')

    const whereClause: {
      classId?: string
      date?: Date
    } = {}
    if (classId) whereClause.classId = classId
    if (date) whereClause.date = new Date(date)

    const attendanceSessions = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true
          }
        },
        takenBy: {
          select: {
            name: true
          }
        },
        records: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                studentNumber: true,
                class: {
                  select: {
                    name: true,
                    grade: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Transform the data for frontend
    const transformedSessions = attendanceSessions.map(session => ({
      id: session.id,
      classId: session.classId,
      class: session.class,
      date: session.date.toISOString().split('T')[0],
      takenBy: session.takenBy,
      createdAt: session.createdAt.toISOString(),
      records: session.records.map(record => ({
        id: record.id,
        studentId: record.studentId,
        student: record.student,
        status: record.status,
        notes: record.notes,
        date: session.date.toISOString().split('T')[0]
      }))
    }))

    return NextResponse.json({
      success: true,
      data: {
        sessions: transformedSessions
      }
    })

  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create attendance record
export async function POST(request: NextRequest): Promise<NextResponse<AttendanceResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: AttendanceRequestBody = await request.json()

    // Validate required fields
    if (!body.classId || !body.date || !body.records || body.records.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Class, date, and attendance records are required' },
        { status: 400 }
      )
    }

    // Validate date format
    const attendanceDate = new Date(body.date)
    if (isNaN(attendanceDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
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

    // Check if attendance already exists for this class and date
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        classId_date: {
          classId: body.classId,
          date: attendanceDate
        }
      }
    })

    if (existingAttendance) {
      return NextResponse.json(
        { success: false, error: 'Attendance already recorded for this class and date' },
        { status: 409 }
      )
    }

    // Validate all students exist
    const studentIds = body.records.map(r => r.studentId)
    const studentsCount = await prisma.user.count({
      where: {
        id: { in: studentIds },
        role: 'STUDENT'
      }
    })

    if (studentsCount !== studentIds.length) {
      return NextResponse.json(
        { success: false, error: 'One or more students not found' },
        { status: 400 }
      )
    }

    // Create attendance session with records
    const attendance = await prisma.attendance.create({
      data: {
        classId: body.classId,
        date: attendanceDate,
        takenById: session.user.id,
        records: {
          create: body.records.map(record => ({
            studentId: record.studentId,
            status: record.status as AttendanceStatus,
            notes: record.notes || null
          }))
        }
      },
      include: {
        class: {
          select: {
            name: true,
            grade: true
          }
        },
        records: {
          include: {
            student: {
              select: {
                name: true,
                studentNumber: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Attendance recorded successfully',
      data: {
        id: attendance.id,
        classId: attendance.classId,
        class: attendance.class,
        date: attendance.date.toISOString().split('T')[0],
        recordsCount: attendance.records.length,
        presentCount: attendance.records.filter(r => r.status === 'PRESENT').length
      }
    })

  } catch (error) {
    console.error('Error creating attendance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record attendance' },
      { status: 500 }
    )
  }
}
