import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface SettingsData {
  schoolName: string
  schoolShortName: string
  schoolTagline: string
  schoolDescription: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail: string
  schoolWebsite: string
  adminEmail: string
  currency: string
  currencySymbol: string
  currencyPosition: 'before' | 'after'
  timeZone: string
  dateFormat: string
  academicYearStart: string
  academicYearEnd: string
  language: string
  theme: string
  logoUrl?: string
  bannerUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

interface SettingsResponse {
  success: boolean
  message?: string
  data?: SettingsData
  error?: string
}

// GET - Fetch all settings
export async function GET(): Promise<NextResponse<SettingsResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const settings = await prisma.schoolSettings.findFirst({
      orderBy: { createdAt: 'desc' }
    })

    if (!settings) {
      // Return default settings if none exist
      const defaultSettings: SettingsData = {
        schoolName: 'North India Baptist Seminary',
        schoolShortName: 'ACA',
        schoolTagline: 'Excellence in Education Since 1999',
        schoolDescription: 'Nurturing minds, building futures with innovative learning and character development.',
        schoolAddress: '123 Education Boulevard, Learning City, LC 12345',
        schoolPhone: '(555) 123-4567',
        schoolEmail: 'info@greenwoodhigh.edu',
        schoolWebsite: 'https://nibsindia.com',
        adminEmail: 'admin@greenwoodhigh.edu',
        currency: 'USD',
        currencySymbol: '$',
        currencyPosition: 'before',
        timeZone: 'America/New_York',
        dateFormat: 'MM/dd/yyyy',
        academicYearStart: '2024-08-01',
        academicYearEnd: '2025-06-30',
        language: 'en',
        theme: 'system',
        primaryColor: '#1E40AF',
        secondaryColor: '#64748B',
        accentColor: '#059669'
      }

      return NextResponse.json({
        success: true,
        data: defaultSettings
      })
    }

    const settingsData: SettingsData = {
      schoolName: settings.schoolName,
      schoolShortName: settings.schoolShortName,
      schoolTagline: settings.schoolTagline || '',
      schoolDescription: settings.schoolDescription || '',
      schoolAddress: settings.schoolAddress || '',
      schoolPhone: settings.schoolPhone || '',
      schoolEmail: settings.schoolEmail || '',
      schoolWebsite: settings.schoolWebsite || '',
      adminEmail: settings.adminEmail || '',
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      currencyPosition: settings.currencyPosition as 'before' | 'after',
      timeZone: settings.timeZone,
      dateFormat: settings.dateFormat,
      academicYearStart: settings.academicYearStart.toISOString().split('T')[0],
      academicYearEnd: settings.academicYearEnd.toISOString().split('T')[0],
      language: settings.language,
      theme: settings.theme,
      logoUrl: settings.logoUrl || undefined,
      bannerUrl: settings.bannerUrl || undefined,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor
    }

    return NextResponse.json({
      success: true,
      data: settingsData
    })

  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// POST - Create or update settings
export async function POST(request: NextRequest): Promise<NextResponse<SettingsResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: SettingsData = await request.json()

    // Validate required fields
    if (!body.schoolName || !body.schoolShortName || !body.currency || !body.currencySymbol) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if settings already exist
    const existingSettings = await prisma.schoolSettings.findFirst()

    const settingsData = {
      schoolName: body.schoolName,
      schoolShortName: body.schoolShortName,
      schoolTagline: body.schoolTagline || '',
      schoolDescription: body.schoolDescription || '',
      schoolAddress: body.schoolAddress || '',
      schoolPhone: body.schoolPhone || '',
      schoolEmail: body.schoolEmail || '',
      schoolWebsite: body.schoolWebsite || '',
      adminEmail: body.adminEmail || '',
      currency: body.currency,
      currencySymbol: body.currencySymbol,
      currencyPosition: body.currencyPosition,
      timeZone: body.timeZone,
      dateFormat: body.dateFormat,
      academicYearStart: new Date(body.academicYearStart),
      academicYearEnd: new Date(body.academicYearEnd),
      language: body.language,
      theme: body.theme,
      logoUrl: body.logoUrl,
      bannerUrl: body.bannerUrl,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      accentColor: body.accentColor
    }

    let settings
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.schoolSettings.update({
        where: { id: existingSettings.id },
        data: settingsData
      })
    } else {
      // Create new settings
      settings = await prisma.schoolSettings.create({
        data: settingsData
      })
    }

    const responseData: SettingsData = {
      schoolName: settings.schoolName,
      schoolShortName: settings.schoolShortName,
      schoolTagline: settings.schoolTagline || '',
      schoolDescription: settings.schoolDescription || '',
      schoolAddress: settings.schoolAddress || '',
      schoolPhone: settings.schoolPhone || '',
      schoolEmail: settings.schoolEmail || '',
      schoolWebsite: settings.schoolWebsite || '',
      adminEmail: settings.adminEmail || '',
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      currencyPosition: settings.currencyPosition as 'before' | 'after',
      timeZone: settings.timeZone,
      dateFormat: settings.dateFormat,
      academicYearStart: settings.academicYearStart.toISOString().split('T')[0],
      academicYearEnd: settings.academicYearEnd.toISOString().split('T')[0],
      language: settings.language,
      theme: settings.theme,
      logoUrl: settings.logoUrl || undefined,
      bannerUrl: settings.bannerUrl || undefined,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
      accentColor: settings.accentColor
    }

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
      data: responseData
    })

  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}
