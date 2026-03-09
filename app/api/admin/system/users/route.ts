import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get user counts by role
    const [totalUsers, adminCount, teacherCount, studentCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.user.count({ where: { role: 'STUDENT' } }),
    ])

    // Get active users (users who have logged in)
    const activeUsers = await prisma.user.count({
      where: {
        sessions: {
          some: {}
        }
      }
    })

    // Get users created this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const newUsersThisMonth = await prisma.user.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    })

    // Get all users with their details
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        sessions: {
          select: {
            id: true,
            expires: true
          },
          orderBy: {
            expires: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const usersWithStatus = users.map(user => ({
      ...user,
      status: user.sessions.length > 0 && user.sessions[0].expires > new Date() ? 'active' : 'inactive',
      lastLogin: user.sessions.length > 0 ? user.sessions[0].expires : null
    }))

    return NextResponse.json({
      stats: {
        total: totalUsers,
        active: activeUsers,
        admins: adminCount,
        teachers: teacherCount,
        students: studentCount,
        newThisMonth: newUsersThisMonth
      },
      users: usersWithStatus
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
