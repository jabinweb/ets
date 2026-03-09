import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET - Fetch announcements for the current user
export async function GET() {
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
        classId: true 
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Build where clause based on user role
    const whereClause: {
      isActive: boolean
      publishDate: { lte: Date }
      OR?: Array<{ expiryDate: null | { gte: Date } } | { classId: string | null } | { classId: { in: string[] } }>
    } = {
      isActive: true,
      publishDate: { lte: new Date() },
      OR: [
        { expiryDate: null },
        { expiryDate: { gte: new Date() } }
      ]
    }

    // Students see class-specific and school-wide announcements
    if (user.role === 'STUDENT' && user.classId) {
      whereClause.OR = [
        { classId: user.classId },
        { classId: null }
      ]
    }
    // Teachers see all announcements
    else if (user.role === 'TEACHER') {
      // Teachers can see all announcements
    }
    // Admins see all announcements
    else if (user.role === 'ADMIN') {
      // Admins see everything
    }

    // Fetch announcements
    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      include: {
        class: {
          select: { name: true }
        },
        userAnnouncements: {
          where: { userId: user.id },
          select: {
            isRead: true,
            readAt: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { publishDate: 'desc' }
      ]
    })

    // Transform data to include read status
    const transformedAnnouncements = announcements.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      priority: announcement.priority,
      isActive: announcement.isActive,
      publishDate: announcement.publishDate.toISOString(),
      expiryDate: announcement.expiryDate?.toISOString() || null,
      class: announcement.class,
      isRead: announcement.userAnnouncements[0]?.isRead || false,
      readAt: announcement.userAnnouncements[0]?.readAt?.toISOString() || null
    }))

    return NextResponse.json({
      success: true,
      data: transformedAnnouncements
    })
  } catch (error) {
    console.error('Error fetching announcements:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch announcements' },
      { status: 500 }
    )
  }
}
