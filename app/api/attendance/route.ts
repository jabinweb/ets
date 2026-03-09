import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch attendance records for current user based on role
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { 
        id: true, 
        role: true, 
        classId: true,
        email: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    let records: Array<{
      id: string
      date: string
      status: string
      notes?: string | null
      student?: { name: string; studentNumber: string | null }
    }> = []
    let stats = {
      totalDays: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      excusedDays: 0,
      attendanceRate: 0
    }
    let children: Array<{ id: string; name: string; class: string }> = []

    // STUDENT - View their own attendance
    if (user.role === 'STUDENT') {
      const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: { studentId: user.id },
        include: {
          attendance: {
            select: { date: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      })

      records = attendanceRecords.map(record => ({
        id: record.id,
        date: record.attendance.date.toISOString().split('T')[0],
        status: record.status,
        notes: record.notes
      }))

      const totalRecords = attendanceRecords.length
      const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length
      const absentCount = attendanceRecords.filter(r => r.status === 'ABSENT').length
      const lateCount = attendanceRecords.filter(r => r.status === 'LATE').length
      const excusedCount = attendanceRecords.filter(r => r.status === 'EXCUSED').length

      stats = {
        totalDays: totalRecords,
        presentDays: presentCount,
        absentDays: absentCount,
        lateDays: lateCount,
        excusedDays: excusedCount,
        attendanceRate: totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0
      }
    }
    // TEACHER - View all students in their classes
    else if (user.role === 'TEACHER') {
      // Get classes where user is the teacher
      const teacherClasses = await prisma.class.findMany({
        where: { teacherId: user.id },
        select: { id: true }
      })

      const classIds = teacherClasses.map(c => c.id)

      const attendanceRecords = await prisma.attendanceRecord.findMany({
        where: {
          student: {
            classId: { in: classIds }
          }
        },
        include: {
          attendance: {
            select: { date: true }
          },
          student: {
            select: {
              name: true,
              studentNumber: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 200
      })

      records = attendanceRecords.map(record => ({
        id: record.id,
        date: record.attendance.date.toISOString().split('T')[0],
        status: record.status,
        notes: record.notes,
        student: {
          name: record.student.name || 'Unknown',
          studentNumber: record.student.studentNumber || ''
        }
      }))

      // Calculate aggregate stats
      const totalRecords = attendanceRecords.length
      const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length
      const absentCount = attendanceRecords.filter(r => r.status === 'ABSENT').length
      const lateCount = attendanceRecords.filter(r => r.status === 'LATE').length
      const excusedCount = attendanceRecords.filter(r => r.status === 'EXCUSED').length

      stats = {
        totalDays: totalRecords,
        presentDays: presentCount,
        absentDays: absentCount,
        lateDays: lateCount,
        excusedDays: excusedCount,
        attendanceRate: totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0
      }
    }
    // ADMIN - View all attendance records
    else if (user.role === 'ADMIN') {
      const attendanceRecords = await prisma.attendanceRecord.findMany({
        include: {
          attendance: {
            select: { date: true }
          },
          student: {
            select: {
              name: true,
              studentNumber: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 300
      })

      records = attendanceRecords.map(record => ({
        id: record.id,
        date: record.attendance.date.toISOString().split('T')[0],
        status: record.status,
        notes: record.notes,
        student: {
          name: record.student.name || 'Unknown',
          studentNumber: record.student.studentNumber || ''
        }
      }))

      // Calculate aggregate stats
      const totalRecords = attendanceRecords.length
      const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length
      const absentCount = attendanceRecords.filter(r => r.status === 'ABSENT').length
      const lateCount = attendanceRecords.filter(r => r.status === 'LATE').length
      const excusedCount = attendanceRecords.filter(r => r.status === 'EXCUSED').length

      stats = {
        totalDays: totalRecords,
        presentDays: presentCount,
        absentDays: absentCount,
        lateDays: lateCount,
        excusedDays: excusedCount,
        attendanceRate: totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        records,
        stats,
        children: children.length > 0 ? children : undefined
      }
    })
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}
