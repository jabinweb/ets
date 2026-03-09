import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// DELETE - Delete a specific reminder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 })
    }
    
    const { id: reminderId } = await params;
    
    // Check if the reminder exists and belongs to this user
    const reminder = await prisma.userAnnouncement.findFirst({
      where: {
        id: reminderId,
        userId: session.user.id
      }
    })
    
    if (!reminder) {
      return NextResponse.json({
        success: false,
        error: "Reminder not found or you don't have permission to delete it"
      }, { status: 404 })
    }
    
    // Delete the reminder
    await prisma.userAnnouncement.delete({
      where: {
        id: reminderId
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `Reminder deleted successfully`
    })
    
  } catch (error) {
    console.error("Error deleting reminder:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to delete reminder"
    }, { status: 500 })
  }
}

// PATCH - Mark reminder as read/unread
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 })
    }
    
    const { id: reminderId } = await params;
    const { isRead } = await request.json()
    
    if (isRead === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: "isRead field is required" 
      }, { status: 400 })
    }
    
    // Check if the reminder exists and belongs to this user
    const reminder = await prisma.userAnnouncement.findFirst({
      where: {
        id: reminderId,
        userId: session.user.id
      }
    })
    
    if (!reminder) {
      return NextResponse.json({
        success: false,
        error: "Reminder not found or you don't have permission to update it"
      }, { status: 404 })
    }
    
    // Update the reminder's read status
    const updatedReminder = await prisma.userAnnouncement.update({
      where: {
        id: reminderId
      },
      data: {
        isRead: isRead,
        readAt: isRead ? new Date() : null
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `Reminder marked as ${isRead ? 'read' : 'unread'}`,
      reminder: updatedReminder
    })
    
  } catch (error) {
    console.error("Error updating reminder:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to update reminder"
    }, { status: 500 })
  }
}

// GET - Get a specific reminder details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false, 
        error: "Unauthorized" 
      }, { status: 401 })
    }
    
    const { id: reminderId } = await params;
    
    // Fetch reminder with announcement details
    const reminder = await prisma.userAnnouncement.findFirst({
      where: {
        id: reminderId,
        userId: session.user.id
      },
      include: {
        announcement: true
      }
    })
    
    if (!reminder) {
      return NextResponse.json({
        success: false,
        error: "Reminder not found"
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      reminder
    })
    
  } catch (error) {
    console.error("Error fetching reminder:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch reminder"
    }, { status: 500 })
  }
}
