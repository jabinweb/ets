import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') || 'all'
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '100')

    // Generate logs from actual database activities
    const logs: Array<{
      id: string
      level: 'info' | 'success' | 'warning' | 'error'
      message: string
      timestamp: string
      source: string
      user: string
    }> = []

    // Get recent user registrations
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })

    recentUsers.forEach(user => {
      logs.push({
        id: `user-${user.id}`,
        level: 'success',
        message: `New ${user.role.toLowerCase()} account created: ${user.name || user.email}`,
        timestamp: user.createdAt.toISOString(),
        source: 'User Management',
        user: 'System'
      })
    })

    // Get recent login activities (from sessions)
    const recentSessions = await prisma.session.findMany({
      orderBy: { expires: 'desc' },
      take: 30,
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    recentSessions.forEach(session => {
      const sessionDate = new Date(session.expires.getTime() - 30 * 24 * 60 * 60 * 1000) // Approximate login time
      logs.push({
        id: `session-${session.sessionToken.substring(0, 8)}`,
        level: 'info',
        message: `User login: ${session.user.name || session.user.email} (${session.user.role})`,
        timestamp: sessionDate.toISOString(),
        source: 'Authentication',
        user: session.user.email
      })
    })

    // Get recent admission applications
    const recentApplications = await prisma.admissionApplication.findMany({
      where: {
        submittedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { submittedAt: 'desc' },
      take: 15,
      select: {
        id: true,
        studentFirstName: true,
        studentLastName: true,
        parentEmail: true,
        submittedAt: true,
        status: true
      }
    })

    recentApplications.forEach(app => {
      logs.push({
        id: `app-${app.id}`,
        level: app.status === 'REJECTED' ? 'warning' : 'success',
        message: `Admission application ${app.status.toLowerCase()}: ${app.studentFirstName} ${app.studentLastName}`,
        timestamp: app.submittedAt?.toISOString() || new Date().toISOString(),
        source: 'Admissions',
        user: app.parentEmail || 'N/A'
      })
    })

    // Get recent announcements
    const recentAnnouncements = await prisma.announcement.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    })

    recentAnnouncements.forEach(announcement => {
      logs.push({
        id: `announcement-${announcement.id}`,
        level: 'info',
        message: `New announcement published: ${announcement.title}`,
        timestamp: announcement.createdAt.toISOString(),
        source: 'Communications',
        user: 'System'
      })
    })

    // Get recent attendance records
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const todayAttendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        createdAt: {
          gte: todayStart
        }
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    todayAttendanceRecords.forEach(record => {
      logs.push({
        id: `attendance-${record.id}`,
        level: record.status === 'PRESENT' ? 'success' : 'warning',
        message: `Attendance marked ${record.status}: ${record.student.name || record.student.email}`,
        timestamp: record.createdAt.toISOString(),
        source: 'Attendance',
        user: 'System'
      })
    })

    // Get recent exam records
    const recentExams = await prisma.exam.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
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

    recentExams.forEach(exam => {
      logs.push({
        id: `exam-${exam.id}`,
        level: 'info',
        message: `Exam scheduled: ${exam.title} for ${exam.class.name} - ${exam.subject.name}`,
        timestamp: exam.createdAt.toISOString(),
        source: 'Examinations',
        user: 'System'
      })
    })

    // Check for system warnings (simulate from database state)
    const [totalStudents, totalClasses] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.class.count()
    ])

    // Add system health logs
    if (totalStudents > 0 && totalClasses === 0) {
      logs.push({
        id: 'warning-no-classes',
        level: 'warning',
        message: 'System warning: Students exist but no classes are configured',
        timestamp: new Date().toISOString(),
        source: 'System Monitor',
        user: 'System'
      })
    }

    // Sort logs by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Apply filters
    let filteredLogs = logs

    if (level !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.level === level)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.source.toLowerCase().includes(searchLower) ||
        log.user.toLowerCase().includes(searchLower)
      )
    }

    // Limit results
    filteredLogs = filteredLogs.slice(0, limit)

    // Calculate stats
    const stats = {
      total: logs.length,
      error: logs.filter(l => l.level === 'error').length,
      warning: logs.filter(l => l.level === 'warning').length,
      info: logs.filter(l => l.level === 'info').length,
      success: logs.filter(l => l.level === 'success').length
    }

    return NextResponse.json({ logs: filteredLogs, stats })

  } catch (error) {
    console.error('Error fetching system logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system logs' },
      { status: 500 }
    )
  }
}
