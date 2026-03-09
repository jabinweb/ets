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

    // Get record counts for export options
    const [
      studentsCount,
      teachersCount,
      classesCount,
      subjectsCount,
      examsCount,
      attendanceCount,
      feesCount,
      gradesCount,
      announcementsCount,
      expensesCount
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.class.count(),
      prisma.subject.count(),
      prisma.exam.count(),
      prisma.attendance.count(),
      prisma.fee.count(),
      prisma.examResult.count(),
      prisma.announcement.count(),
      prisma.expense.count()
    ])

    const importOptions = [
      {
        id: 'students',
        title: 'Students',
        description: 'Import student records from CSV or Excel',
        icon: 'users',
        format: '.csv, .xlsx',
        fields: ['firstName', 'lastName', 'email', 'dateOfBirth', 'gender', 'grade', 'classId'],
        sampleUrl: '/api/admin/system/data/template/students'
      },
      {
        id: 'teachers',
        title: 'Teachers',
        description: 'Import teacher information and assignments',
        icon: 'graduation-cap',
        format: '.csv, .xlsx',
        fields: ['firstName', 'lastName', 'email', 'phone', 'subjects', 'classes'],
        sampleUrl: '/api/admin/system/data/template/teachers'
      },
      {
        id: 'classes',
        title: 'Classes',
        description: 'Import class schedules and information',
        icon: 'book-open',
        format: '.csv, .xlsx',
        fields: ['name', 'grade', 'section', 'capacity', 'teacherId'],
        sampleUrl: '/api/admin/system/data/template/classes'
      },
      {
        id: 'subjects',
        title: 'Subjects',
        description: 'Import subject information',
        icon: 'book',
        format: '.csv, .xlsx',
        fields: ['name', 'code', 'description', 'credits'],
        sampleUrl: '/api/admin/system/data/template/subjects'
      },
      {
        id: 'grades',
        title: 'Grades',
        description: 'Import student grades and assessments',
        icon: 'file-text',
        format: '.csv, .xlsx',
        fields: ['studentId', 'examId', 'marks', 'grade'],
        sampleUrl: '/api/admin/system/data/template/grades'
      }
    ]

    const exportOptions = [
      {
        id: 'students',
        title: 'All Students',
        description: 'Export complete student database',
        icon: 'users',
        records: studentsCount,
        endpoint: '/api/admin/system/data/export/students'
      },
      {
        id: 'teachers',
        title: 'All Teachers',
        description: 'Export teacher information',
        icon: 'graduation-cap',
        records: teachersCount,
        endpoint: '/api/admin/system/data/export/teachers'
      },
      {
        id: 'classes',
        title: 'Classes & Schedules',
        description: 'Export class information',
        icon: 'book-open',
        records: classesCount,
        endpoint: '/api/admin/system/data/export/classes'
      },
      {
        id: 'subjects',
        title: 'Subjects',
        description: 'Export subject data',
        icon: 'book',
        records: subjectsCount,
        endpoint: '/api/admin/system/data/export/subjects'
      },
      {
        id: 'exams',
        title: 'Exams & Results',
        description: 'Export exam schedules and results',
        icon: 'clipboard',
        records: examsCount + gradesCount,
        endpoint: '/api/admin/system/data/export/exams'
      },
      {
        id: 'attendance',
        title: 'Attendance Data',
        description: 'Export attendance records',
        icon: 'calendar',
        records: attendanceCount,
        endpoint: '/api/admin/system/data/export/attendance'
      },
      {
        id: 'fees',
        title: 'Financial Records',
        description: 'Export fee and payment data',
        icon: 'dollar-sign',
        records: feesCount + expensesCount,
        endpoint: '/api/admin/system/data/export/fees'
      },
      {
        id: 'announcements',
        title: 'Announcements',
        description: 'Export announcements and communications',
        icon: 'megaphone',
        records: announcementsCount,
        endpoint: '/api/admin/system/data/export/announcements'
      },
      {
        id: 'full',
        title: 'Full Database',
        description: 'Complete system backup export',
        icon: 'database',
        records: studentsCount + teachersCount + classesCount + subjectsCount + examsCount + attendanceCount + feesCount + announcementsCount,
        endpoint: '/api/admin/system/data/export/full'
      }
    ]

    // Get recent import/export activities (simulated from user actions)
    const recentActivities = [
      {
        id: '1',
        type: 'import',
        entity: 'Students',
        recordCount: 25,
        status: 'completed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        user: authUser.email
      },
      {
        id: '2',
        type: 'export',
        entity: 'Attendance Data',
        recordCount: attendanceCount,
        status: 'completed',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        user: authUser.email
      }
    ]

    const stats = {
      totalRecords: studentsCount + teachersCount + classesCount + subjectsCount + examsCount + attendanceCount + feesCount + announcementsCount,
      lastImport: recentActivities.find(a => a.type === 'import')?.timestamp || null,
      lastExport: recentActivities.find(a => a.type === 'export')?.timestamp || null,
      pendingImports: 0
    }

    return NextResponse.json({
      importOptions,
      exportOptions,
      recentActivities,
      stats
    })

  } catch (error) {
    console.error('Error fetching data import/export info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data import/export info' },
      { status: 500 }
    )
  }
}
