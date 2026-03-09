import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// POST - Mark announcement as read
export async function POST(request: NextRequest) {
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
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    const { announcementId } = await request.json()

    if (!announcementId) {
      return NextResponse.json(
        { success: false, error: 'Announcement ID is required' },
        { status: 400 }
      )
    }

    // Check if announcement exists
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId }
    })

    if (!announcement) {
      return NextResponse.json(
        { success: false, error: 'Announcement not found' },
        { status: 404 }
      )
    }

    // Create or update user announcement record
    const userAnnouncement = await prisma.userAnnouncement.upsert({
      where: {
        userId_announcementId: {
          userId: user.id,
          announcementId: announcementId
        }
      },
      update: {
        isRead: true,
        readAt: new Date()
      },
      create: {
        userId: user.id,
        announcementId: announcementId,
        isRead: true,
        readAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: userAnnouncement
    })
  } catch (error) {
    console.error('Error marking announcement as read:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark announcement as read' },
      { status: 500 }
    )
  }
}
