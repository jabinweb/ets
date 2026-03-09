import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch latest news (non-event announcements)
    const newsItems = await prisma.announcement.findMany({
      where: {
        type: {
          not: 'EVENT'  // Exclude events
        },
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3  // Limit to 3 items for the homepage
    })

    // Fetch upcoming events
    const events = await prisma.announcement.findMany({
      where: {
        type: 'EVENT',
        isActive: true,
        publishDate: {
          gte: new Date()  // Only future events
        }
      },
      orderBy: {
        publishDate: 'asc'  // Earliest events first
      },
      take: 3  // Limit to 3 events for the homepage
    })

    return NextResponse.json({
      news: newsItems,
      events: events
    })
  } catch (error) {
    console.error('Error fetching news and events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news and events' },
      { status: 500 }
    )
  }
}
