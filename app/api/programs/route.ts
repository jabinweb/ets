import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const institution = searchParams.get('institution')
    const level = searchParams.get('level')

    const where: any = { isActive: true }
    
    if (institution) {
      where.institution = institution
    }
    
    if (level) {
      where.level = level
    }

    const programs = await prisma.program.findMany({
      where,
      include: {
        features: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      success: true,
      data: programs
    })
  } catch (error) {
    console.error('Error fetching programs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch programs' },
      { status: 500 }
    )
  }
}
