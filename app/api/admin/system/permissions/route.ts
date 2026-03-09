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

    // Get role distribution
    const [adminCount, teacherCount, studentCount] = await Promise.all([
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.user.count({ where: { role: 'STUDENT' } })
    ])

    // Define roles with their counts and permissions
    const roles = [
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Full system access',
        userCount: adminCount,
        color: 'red',
        permissions: {
          dashboard: { view: true, edit: true, delete: true },
          users: { view: true, edit: true, delete: true },
          students: { view: true, edit: true, delete: true },
          teachers: { view: true, edit: true, delete: true },
          classes: { view: true, edit: true, delete: true },
          subjects: { view: true, edit: true, delete: true },
          exams: { view: true, edit: true, delete: true },
          attendance: { view: true, edit: true, delete: true },
          grades: { view: true, edit: true, delete: true },
          fees: { view: true, edit: true, delete: true },
          announcements: { view: true, edit: true, delete: true },
          reports: { view: true, edit: true, delete: true },
          settings: { view: true, edit: true, delete: true },
          system: { view: true, edit: true, delete: true }
        }
      },
      {
        id: 'teacher',
        name: 'Teacher',
        description: 'Academic management access',
        userCount: teacherCount,
        color: 'blue',
        permissions: {
          dashboard: { view: true, edit: false, delete: false },
          users: { view: true, edit: false, delete: false },
          students: { view: true, edit: true, delete: false },
          teachers: { view: true, edit: false, delete: false },
          classes: { view: true, edit: true, delete: false },
          subjects: { view: true, edit: false, delete: false },
          exams: { view: true, edit: true, delete: false },
          attendance: { view: true, edit: true, delete: false },
          grades: { view: true, edit: true, delete: false },
          fees: { view: true, edit: false, delete: false },
          announcements: { view: true, edit: true, delete: false },
          reports: { view: true, edit: false, delete: false },
          settings: { view: false, edit: false, delete: false },
          system: { view: false, edit: false, delete: false }
        }
      },
      {
        id: 'student',
        name: 'Student',
        description: 'Seminary portal access',
        userCount: studentCount,
        color: 'green',
        permissions: {
          dashboard: { view: true, edit: false, delete: false },
          users: { view: false, edit: false, delete: false },
          students: { view: false, edit: false, delete: false },
          teachers: { view: true, edit: false, delete: false },
          classes: { view: true, edit: false, delete: false },
          subjects: { view: true, edit: false, delete: false },
          exams: { view: true, edit: false, delete: false },
          attendance: { view: true, edit: false, delete: false },
          grades: { view: true, edit: false, delete: false },
          fees: { view: true, edit: false, delete: false },
          announcements: { view: true, edit: false, delete: false },
          reports: { view: true, edit: false, delete: false },
          settings: { view: false, edit: false, delete: false },
          system: { view: false, edit: false, delete: false }
        }
      },
    ]

    // Define permission categories
    const categories = [
      {
        id: 'core',
        name: 'Core System',
        permissions: ['dashboard', 'users', 'settings', 'system']
      },
      {
        id: 'academic',
        name: 'Academic Management',
        permissions: ['students', 'teachers', 'classes', 'subjects']
      },
      {
        id: 'assessment',
        name: 'Assessment & Evaluation',
        permissions: ['exams', 'attendance', 'grades', 'reports']
      },
      {
        id: 'financial',
        name: 'Financial Management',
        permissions: ['fees', 'announcements']
      }
    ]

    return NextResponse.json({ roles, categories })

  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 }
    )
  }
}
