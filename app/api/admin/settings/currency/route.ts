import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch the first (and should be only) school settings record
    const settings = await prisma.schoolSettings.findFirst({
      select: {
        currency: true,
        currencySymbol: true,
        currencyPosition: true,
      }
    })

    // If no settings found, return defaults
    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          currency: 'USD',
          currencySymbol: '$',
          currencyPosition: 'before'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        currency: settings.currency,
        currencySymbol: settings.currencySymbol,
        currencyPosition: settings.currencyPosition
      }
    })

  } catch (error) {
    console.error('Error fetching currency settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch currency settings' },
      { status: 500 }
    )
  }
}
