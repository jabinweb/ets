import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AnnouncementType } from '@prisma/client'

interface EventUpdateBody {
  title?: string
  description?: string
  date?: string
  startTime?: string
  endTime?: string
  type?: 'ACADEMIC' | 'HOLIDAY' | 'EXAM' | 'SPORTS' | 'CULTURAL' | 'MEETING' | 'OTHER'
  location?: string
  isPublic?: boolean
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
}

const mapEventTypeToAnnouncement = (eventType: string): AnnouncementType => {
  switch (eventType) {
    case 'ACADEMIC':
    case 'EXAM':
      return AnnouncementType.ACADEMIC
    case 'HOLIDAY':
    case 'SPORTS':
    case 'CULTURAL':
      return AnnouncementType.EVENT
    case 'MEETING':
      return AnnouncementType.GENERAL
    default:
      return AnnouncementType.EVENT
  }
}

const mapPriorityToNumber = (priority: string): number => {
  switch (priority) {
    case 'HIGH': return 5
    case 'MEDIUM': return 3
    case 'LOW': return 1
    default: return 3
  }
}

// GET - Fetch single event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const session = await auth()
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const event = await prisma.announcement.findUnique({
      where: { 
        id: resolvedParams.id,
        type: AnnouncementType.EVENT
      }
    })

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    // Parse enhanced description to extract time and location
    const lines = event.content.split('\n')
    const description = lines[0] || ''
    let startTime: string | undefined
    let endTime: string | undefined
    let location: string | undefined

    for (const line of lines) {
      if (line.startsWith('Time: ')) {
        const timeStr = line.replace('Time: ', '')
        const timeParts = timeStr.split(' - ')
        startTime = timeParts[0]?.trim()
        endTime = timeParts[1]?.trim()
      }
      if (line.startsWith('Location: ')) {
        location = line.replace('Location: ', '').trim()
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: event.id,
        title: event.title,
        description,
        date: event.publishDate.toISOString(),
        startTime,
        endTime,
        type: 'EVENT',
        location,
        isPublic: event.isActive,
        priority: event.priority >= 5 ? 'HIGH' : event.priority >= 3 ? 'MEDIUM' : 'LOW',
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: EventUpdateBody = await request.json()

    // Check if event exists
    const existingEvent = await prisma.announcement.findUnique({
      where: { 
        id: resolvedParams.id,
        type: AnnouncementType.EVENT
      }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    // Validate date if provided
    let eventDate: Date | undefined
    if (body.date) {
      eventDate = new Date(body.date)
      if (isNaN(eventDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format' },
          { status: 400 }
        )
      }
    }

    // Create enhanced description with time and location
    let enhancedDescription = body.description?.trim() || existingEvent.content.split('\n')[0]
    if (body.startTime !== undefined || body.endTime !== undefined) {
      if (body.startTime || body.endTime) {
        enhancedDescription += `\n\nTime: ${body.startTime || ''} ${body.endTime ? `- ${body.endTime}` : ''}`
      }
    } else {
      // Preserve existing time info if not updating
      const lines = existingEvent.content.split('\n')
      const timeLine = lines.find(line => line.startsWith('Time: '))
      if (timeLine) {
        enhancedDescription += `\n\n${timeLine}`
      }
    }

    if (body.location !== undefined) {
      if (body.location) {
        enhancedDescription += `\nLocation: ${body.location}`
      }
    } else {
      // Preserve existing location info if not updating
      const lines = existingEvent.content.split('\n')
      const locationLine = lines.find(line => line.startsWith('Location: '))
      if (locationLine) {
        enhancedDescription += `\n${locationLine}`
      }
    }

    // Update the event
    const updatedEvent = await prisma.announcement.update({
      where: { id: resolvedParams.id },
      data: {
        ...(body.title && { title: body.title.trim() }),
        ...(body.description !== undefined && { content: enhancedDescription }),
        ...(body.type && { type: mapEventTypeToAnnouncement(body.type) }),
        ...(body.priority && { priority: mapPriorityToNumber(body.priority) }),
        ...(body.isPublic !== undefined && { isActive: body.isPublic }),
        ...(eventDate && { publishDate: eventDate }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Event updated successfully',
      data: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        description: body.description || existingEvent.content.split('\n')[0],
        date: updatedEvent.publishDate.toISOString(),
        startTime: body.startTime,
        endTime: body.endTime,
        type: body.type || 'EVENT',
        location: body.location,
        isPublic: updatedEvent.isActive,
        priority: body.priority || (updatedEvent.priority >= 5 ? 'HIGH' : updatedEvent.priority >= 3 ? 'MEDIUM' : 'LOW'),
        createdAt: updatedEvent.createdAt.toISOString(),
        updatedAt: updatedEvent.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if event exists
    const existingEvent = await prisma.announcement.findUnique({
      where: { 
        id: resolvedParams.id,
        type: AnnouncementType.EVENT
      }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      )
    }

    // Delete the event
    await prisma.announcement.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}

