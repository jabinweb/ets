import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ExamType } from '@prisma/client'

interface ExamRequestBody {
  title: string
  description?: string
  type: ExamType
  classId: string
  subjectId: string
  date: string
  duration: number
  totalMarks: number
  passMarks: number
}

interface ExamResponse {
  success: boolean
  message?: string
  data?: {
    id: string
    title: string
    description?: string | null
    type: ExamType
    date: string
    duration: number
    totalMarks: number
    passMarks: number
    class?: {
      name: string
      grade: string
      section?: string
    }
    subject?: {
      name: string
      code: string
    }
    _count?: {
      results: number
    }
    createdAt?: string
    updatedAt?: string
  }[] | {
    id: string
    title: string
    type: ExamType
    date: string
    class: {
      name: string
      grade: string
    }
    subject: {
      name: string
      code: string
    }
  }
  error?: string
}

// GET - Fetch all exams
export async function GET(): Promise<NextResponse<ExamResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const exams = await prisma.exam.findMany({
      include: {
        class: {
          select: {
            name: true,
            grade: true,
            section: true
          }
        },
        subject: {
          select: {
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            results: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    const transformedExams = exams.map(exam => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      type: exam.type,
      date: exam.date.toISOString(),
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passMarks: exam.passMarks,
      class: exam.class ? {
        name: exam.class.name,
        grade: exam.class.grade.toString(),
        section: exam.class.section
      } : undefined,
      subject: exam.subject,
      _count: exam._count,
      createdAt: exam.createdAt.toISOString(),
      updatedAt: exam.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: transformedExams
    })

  } catch (error) {
    console.error('Error fetching exams:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new exam
export async function POST(request: NextRequest): Promise<NextResponse<ExamResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: ExamRequestBody = await request.json()

    // Validate required fields
    if (!body.title?.trim() || !body.type || !body.classId || !body.subjectId || !body.date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate marks
    if (body.totalMarks <= 0 || body.passMarks < 0 || body.passMarks > body.totalMarks) {
      return NextResponse.json(
        { success: false, error: 'Invalid marks configuration' },
        { status: 400 }
      )
    }

    // Validate exam date
    const examDate = new Date(body.date)
    if (examDate < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Exam date cannot be in the past' },
        { status: 400 }
      )
    }

    // Check if class and subject exist
    const classExists = await prisma.class.findUnique({
      where: { id: body.classId }
    })

    const subjectExists = await prisma.subject.findUnique({
      where: { id: body.subjectId }
    })

    if (!classExists || !subjectExists) {
      return NextResponse.json(
        { success: false, error: 'Invalid class or subject' },
        { status: 400 }
      )
    }

    // Create the exam
    const exam = await prisma.exam.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        type: body.type,
        classId: body.classId,
        subjectId: body.subjectId,
        date: examDate,
        duration: body.duration || 60,
        totalMarks: body.totalMarks,
        passMarks: body.passMarks
      },
      include: {
        class: {
          select: {
            name: true,
            grade: true
          }
        },
        subject: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Exam created successfully',
      data: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        type: exam.type,
        date: exam.date.toISOString(),
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passMarks: exam.passMarks,
        class: {
          name: exam.class.name,
          grade: exam.class.grade.toString()
        },
        subject: {
          name: exam.subject.name,
          code: exam.subject.code
        }
      }
    })

  } catch (error) {
    console.error('Error creating exam:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create exam' },
      { status: 500 }
    )
  }
}
