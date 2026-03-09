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

    // Get counts from database
    const [
      totalUsers,
      totalClasses,
      totalSubjects,
      totalStudents,
      totalTeachers,
      totalAttendanceRecords,
      totalExams,
      totalFees,
      totalAnnouncements,
      totalApplications,
      totalExpenses
    ] = await Promise.all([
      prisma.user.count(),
      prisma.class.count(),
      prisma.subject.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.attendance.count(),
      prisma.exam.count(),
      prisma.fee.count(),
      prisma.announcement.count(),
      prisma.admissionApplication.count(),
      prisma.expense.count()
    ])

    // Get recent activity
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    })

    const recentApplications = await prisma.admissionApplication.count({
      where: {
        submittedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    // Get active sessions
    const activeSessions = await prisma.session.count({
      where: {
        expires: {
          gt: new Date()
        }
      }
    })

    const overview = {
      counts: {
        users: totalUsers,
        classes: totalClasses,
        subjects: totalSubjects,
        students: totalStudents,
        teachers: totalTeachers,
        attendanceRecords: totalAttendanceRecords,
        exams: totalExams,
        fees: totalFees,
        announcements: totalAnnouncements,
        applications: totalApplications,
        expenses: totalExpenses
      },
      activity: {
        newUsersThisWeek: recentUsers,
        newApplicationsThisWeek: recentApplications,
        activeSessions
      },
      modules: [
        {
          id: 'users',
          title: 'User Management',
          description: 'Manage users, roles, and permissions',
          count: totalUsers,
          icon: 'users'
        },
        {
          id: 'permissions',
          title: 'Permissions',
          description: 'Configure role-based access control',
          count: 4, // Number of roles
          icon: 'shield'
        },
        {
          id: 'backup',
          title: 'Backup & Recovery',
          description: 'Database backup and restoration',
          count: 0, // Will be updated when backup system is implemented
          icon: 'database'
        },
        {
          id: 'logs',
          title: 'Activity Logs',
          description: 'View system logs and audit trail',
          count: 0, // Will be updated when logging system is implemented
          icon: 'fileText'
        },
        {
          id: 'data',
          title: 'Data Management',
          description: 'Import and export data',
          count: 11, // Number of data types
          icon: 'download'
        }
      ]
    }

    return NextResponse.json(overview)

  } catch (error) {
    console.error('Error fetching system overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system overview' },
      { status: 500 }
    )
  }
}
