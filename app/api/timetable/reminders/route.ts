import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET - Retrieve all reminders for current user
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 })
    }
    
    const userId = session.user.id
    
    // Retrieve user's announcements from database
    const reminders = await prisma.userAnnouncement.findMany({
      where: {
        userId: userId
      },
      include: {
        announcement: true
      },
      orderBy: {
        announcement: {
          publishDate: 'asc'
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      reminders: reminders
    })
    
  } catch (error) {
    console.error("Error fetching reminders:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to retrieve reminders"
    }, { status: 500 })
  }
}

// POST - Create a new reminder
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 })
    }
    
    const userId = session.user.id
    const { announcementId } = await request.json()
    
    if (!announcementId) {
      return NextResponse.json({ 
        success: false, 
        error: "Announcement ID is required" 
      }, { status: 400 })
    }
    
    // Check if the announcement exists
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId }
    })
    
    if (!announcement) {
      return NextResponse.json({
        success: false,
        error: "Announcement not found"
      }, { status: 404 })
    }
    
    // Check if user already has this announcement as a reminder
    const existingReminder = await prisma.userAnnouncement.findFirst({
      where: {
        userId: userId,
        announcementId: announcementId
      }
    })
    
    if (existingReminder) {
      return NextResponse.json({
        success: false,
        error: "Reminder already exists for this announcement"
      }, { status: 400 })
    }
    
    // Create a new user announcement (reminder)
    const reminder = await prisma.userAnnouncement.create({
      data: {
        userId: userId,
        announcementId: announcementId,
        isRead: false
      },
      include: {
        announcement: true
      }
    })
    
    return NextResponse.json({
      success: true,
      reminder: reminder
    })
    
  } catch (error) {
    console.error("Error creating reminder:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to create reminder"
    }, { status: 500 })
  }
}
