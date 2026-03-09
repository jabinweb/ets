import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface SubjectRequestBody {
  name: string
  code: string
  description?: string
  credits: number
}

interface SubjectData {
  id: string
  name: string
  code: string
  description: string
  credits: number
  createdAt: string
  updatedAt: string
  _count?: {
    classes: number
    teachers: number
  }
}

interface SubjectResponse {
  success: boolean
  message?: string
  data?: SubjectData | SubjectData[]
  error?: string
}

// GET - Fetch all subjects
export async function GET(request: NextRequest): Promise<NextResponse<SubjectResponse>> {
  try {
    const session = await auth()
    
    if (!session || !['ADMIN', 'TEACHER'].includes(session.user?.role || '')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const includeStats = searchParams.get('includeStats') === 'true'

    const subjects = await prisma.subject.findMany({
      include: includeStats ? {
        _count: {
          select: {
            classes: true,
            teachers: true,
            exams: true
          }
        }
      } : {
        _count: {
          select: {
            classes: true,
            teachers: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Transform the data to match our interface
    const transformedSubjects: SubjectData[] = subjects.map(subject => ({
      id: subject.id,
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      credits: subject.credits,
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
      _count: subject._count
    }))

    return NextResponse.json({
      success: true,
      data: transformedSubjects
    })

  } catch (error) {
    console.error('Error fetching subjects:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new subject
export async function POST(request: NextRequest): Promise<NextResponse<SubjectResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: SubjectRequestBody = await request.json()

    // Validate required fields
    if (!body.name?.trim() || !body.code?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Name and code are required' },
        { status: 400 }
      )
    }

    // Validate credits
    if (body.credits < 1 || body.credits > 10) {
      return NextResponse.json(
        { success: false, error: 'Credits must be between 1 and 10' },
        { status: 400 }
      )
    }

    // Check if subject code already exists
    const existingSubject = await prisma.subject.findFirst({
      where: {
        OR: [
          { code: body.code.toUpperCase() },
          { name: body.name }
        ]
      }
    })

    if (existingSubject) {
      return NextResponse.json(
        { success: false, error: 'Subject with this name or code already exists' },
        { status: 409 }
      )
    }

    // Create the subject
    const subject = await prisma.subject.create({
      data: {
        name: body.name.trim(),
        code: body.code.trim().toUpperCase(),
        description: body.description?.trim() || '',
        credits: body.credits
      },
      include: {
        _count: {
          select: {
            classes: true,
            teachers: true
          }
        }
      }
    })

    // Transform the response data
    const responseData: SubjectData = {
      id: subject.id,
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      credits: subject.credits,
      createdAt: subject.createdAt.toISOString(),
      updatedAt: subject.updatedAt.toISOString(),
      _count: subject._count
    }

    return NextResponse.json({
      success: true,
      message: 'Subject created successfully',
      data: responseData
    })

  } catch (error) {
    console.error('Error creating subject:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create subject' },
      { status: 500 }
    )
  }
}
