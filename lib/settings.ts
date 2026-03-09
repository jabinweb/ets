import { prisma } from '@/lib/prisma'

interface SchoolSettings {
  id: string
  schoolName: string
  schoolShortName: string
  schoolTagline: string | null
  schoolDescription: string | null
  schoolAddress: string | null
  schoolPhone: string | null
  schoolEmail: string | null
  schoolWebsite: string | null
  adminEmail: string | null
  currency: string
  currencySymbol: string
  currencyPosition: string
  timeZone: string
  dateFormat: string
  language: string
  academicYearStart: Date
  academicYearEnd: Date
  theme: string
  logoUrl: string | null
  bannerUrl: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  createdAt: Date
  updatedAt: Date
}

export async function getSchoolSettings(): Promise<SchoolSettings> {
  try {
    let settings = await prisma.schoolSettings.findFirst()

    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.schoolSettings.create({
        data: {
          schoolName: 'North India Baptist Seminary',
          schoolShortName: 'ACA',
          schoolTagline: 'TEACH. PRACTICE. THE WORD',
          schoolDescription: 'An Institute of Asian Christian Academy of India',
          schoolAddress: '123 Education Boulevard, Learning City, LC 12345, United States',
          schoolPhone: '(555) 123-4567',
          schoolEmail: 'info@greenwoodhigh.edu',
          schoolWebsite: 'https://nibsindia.com',
          adminEmail: 'admin@greenwoodhigh.edu',
          currency: 'USD',
          currencySymbol: '$',
          currencyPosition: 'before',
          timeZone: 'America/New_York',
          dateFormat: 'MM/dd/yyyy',
          language: 'en',
          academicYearStart: new Date('2024-08-15'),
          academicYearEnd: new Date('2025-06-15'),
          theme: 'system',
          primaryColor: '#1E40AF',
          secondaryColor: '#64748B',
          accentColor: '#059669'
        }
      })
    }

    return settings
  } catch (error) {
    console.error('Error fetching school settings:', error)

    // Return default settings if database query fails
    return {
      id: 'default',
      schoolName: 'North India Baptist Seminary',
      schoolShortName: 'ACA',
      schoolTagline: 'TEACH. PRACTICE. THE WORD',
      schoolDescription: 'An Institute of Asian Christian Academy of India',
      schoolAddress: '123 Education Boulevard, Learning City, LC 12345, United States',
      schoolPhone: '(555) 123-4567',
      schoolEmail: 'info@greenwoodhigh.edu',
      schoolWebsite: 'https://nibsindia.com',
      adminEmail: 'admin@greenwoodhigh.edu',
      currency: 'USD',
      currencySymbol: '$',
      currencyPosition: 'before',
      timeZone: 'America/New_York',
      dateFormat: 'MM/dd/yyyy',
      language: 'en',
      academicYearStart: new Date('2024-08-15'),
      academicYearEnd: new Date('2025-06-15'),
      theme: 'system',
      logoUrl: null,
      bannerUrl: null,
      primaryColor: '#1E40AF',
      secondaryColor: '#64748B',
      accentColor: '#059669',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}

export async function updateSchoolSettings(data: Partial<Omit<SchoolSettings, 'id' | 'createdAt' | 'updatedAt'>>): Promise<SchoolSettings> {
  try {
    const settings = await prisma.schoolSettings.findFirst()

    if (settings) {
      return await prisma.schoolSettings.update({
        where: { id: settings.id },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
    } else {
      return await prisma.schoolSettings.create({
        data: {
          schoolName: 'North India Baptist Seminary',
          schoolShortName: 'ACA',
          currency: 'USD',
          currencySymbol: '$',
          currencyPosition: 'before',
          timeZone: 'America/New_York',
          dateFormat: 'MM/dd/yyyy',
          language: 'en',
          academicYearStart: new Date('2024-08-15'),
          academicYearEnd: new Date('2025-06-15'),
          theme: 'system',
          primaryColor: '#1E40AF',
          secondaryColor: '#64748B',
          accentColor: '#059669',
          ...data
        }
      })
    }
  } catch (error) {
    console.error('Error updating school settings:', error)
    throw new Error('Failed to update school settings')
  }
}

// Helper function to format currency amounts
export function formatCurrency(amount: number, settings?: SchoolSettings): string {
  if (!settings) {
    return `$${amount.toFixed(2)}`
  }

  const formatted = amount.toFixed(2)
  return settings.currencyPosition === 'before'
    ? `${settings.currencySymbol}${formatted}`
    : `${formatted}${settings.currencySymbol}`
}

// Helper function to format dates according to settings
export function formatDate(date: Date, settings?: SchoolSettings): string {
  if (!settings) {
    return date.toLocaleDateString('en-US')
  }

  const format = settings.dateFormat
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear().toString()

  switch (format) {
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`
    case 'dd-MM-yyyy':
      return `${day}-${month}-${year}`
    case 'MM/dd/yyyy':
    default:
      return `${month}/${day}/${year}`
  }
}
