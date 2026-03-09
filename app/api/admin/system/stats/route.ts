import { NextRequest, NextResponse } from 'next/server'
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

    // Mock system stats - in production, these would come from actual system monitoring
    const stats = {
      cpu: {
        usage: Math.floor(Math.random() * 30 + 30), // 30-60%
        cores: 8
      },
      memory: {
        used: 6.2,
        total: 16,
        unit: 'GB'
      },
      storage: {
        used: 142,
        total: 500,
        unit: 'GB'
      },
      uptime: {
        days: 45,
        hours: 12
      },
      status: 'healthy'
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching system stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system stats' },
      { status: 500 }
    )
  }
}
