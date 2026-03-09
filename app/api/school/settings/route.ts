import { NextResponse } from 'next/server'
import { getSchoolSettings } from '@/lib/settings'

export async function GET() {
  try {
    const settings = await getSchoolSettings()
    
    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error fetching school settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
