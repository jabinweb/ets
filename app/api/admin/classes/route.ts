import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface ClassData {
  id: string
  name: string
  section: string
  grade: number
  capacity: number
  teacher?: {
    name: string | null
  } | null
  _count?: {
    students: number
  }
}

interface ClassResponse {
  success: boolean
  message?: string
  data?: ClassData[]
  error?: string
}

// GET - Fetch all classes
export async function GET(): Promise<NextResponse<ClassResponse>> {
  try {
    const session = await auth()
    
    // Fix: allow both ADMIN and TEACHER (not just one)
    if (
      !session ||
      (session.user?.role !== 'ADMIN' && session.user?.role !== 'TEACHER')
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const classes = await prisma.class.findMany({
      include: {
        teacher: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            students: true
          }
        }
      },
      orderBy: [
        { grade: 'asc' },
        { section: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: classes
    })

  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
