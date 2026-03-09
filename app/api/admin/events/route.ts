import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { AnnouncementType } from '@prisma/client'

interface EventRequestBody {
  title: string
  description: string
  date: string
  startTime?: string
  endTime?: string
  type: 'ACADEMIC' | 'HOLIDAY' | 'EXAM' | 'SPORTS' | 'CULTURAL' | 'MEETING' | 'OTHER'
  location?: string
  isPublic: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface EventData {
  id: string
  title: string
  description: string
  date: string
  startTime?: string
  endTime?: string
  type: string
  location?: string
  isPublic: boolean
  priority: string
  createdAt: string
  updatedAt: string
}

interface EventResponse {
  success: boolean
  message?: string
  data?: EventData | EventData[]
  error?: string
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

const mapNumberToPriority = (priority: number): string => {
  if (priority >= 5) return 'HIGH'
  if (priority >= 3) return 'MEDIUM'
  return 'LOW'
}

// GET - Fetch all events
export async function GET(request: NextRequest): Promise<NextResponse<EventResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause for events (stored as announcements with type EVENT)
    const where: {
      type: AnnouncementType;
      OR?: Array<{
        title?: { contains: string; mode: 'insensitive' };
        content?: { contains: string; mode: 'insensitive' };
      }>;
      publishDate?: {
        gte?: Date;
        lte?: Date;
      };
    } = {
      type: AnnouncementType.EVENT
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (startDate || endDate) {
      where.publishDate = {}
      if (startDate) where.publishDate.gte = new Date(startDate)
      if (endDate) where.publishDate.lte = new Date(endDate)
    }

    const events = await prisma.announcement.findMany({
      where,
      orderBy: { publishDate: 'asc' }
    })

    // Transform announcements to events format
    const transformedEvents: EventData[] = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.content,
      date: event.publishDate.toISOString(),
      startTime: undefined, // We'll store this in content for now
      endTime: undefined,   // We'll store this in content for now
      type: 'EVENT', // Default since we're filtering by EVENT type
      location: undefined, // We'll store this in content for now
      isPublic: event.isActive,
      priority: mapNumberToPriority(event.priority),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: transformedEvents
    })

  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new event
export async function POST(request: NextRequest): Promise<NextResponse<EventResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: EventRequestBody = await request.json()

    // Validate required fields
    if (!body.title?.trim() || !body.description?.trim() || !body.date) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and date are required' },
        { status: 400 }
      )
    }

    // Validate date format
    const eventDate = new Date(body.date)
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 }
      )
    }

    // Create enhanced description with time and location
    let enhancedDescription = body.description.trim()
    if (body.startTime || body.endTime) {
      enhancedDescription += `\n\nTime: ${body.startTime || ''} ${body.endTime ? `- ${body.endTime}` : ''}`
    }
    if (body.location) {
      enhancedDescription += `\nLocation: ${body.location}`
    }

    // Create the event as an announcement
    const event = await prisma.announcement.create({
      data: {
        title: body.title.trim(),
        content: enhancedDescription,
        type: mapEventTypeToAnnouncement(body.type),
        priority: mapPriorityToNumber(body.priority),
        isActive: body.isPublic,
        publishDate: eventDate
      }
    })

    // Transform response data
    const responseData: EventData = {
      id: event.id,
      title: event.title,
      description: body.description,
      date: event.publishDate.toISOString(),
      startTime: body.startTime,
      endTime: body.endTime,
      type: body.type,
      location: body.location,
      isPublic: event.isActive,
      priority: body.priority,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      message: 'Event created successfully',
      data: responseData
    })

  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
