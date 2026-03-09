import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/exams - List exams for teacher or student
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const subjectId = searchParams.get('subjectId')

    let exams

    if (session.user.role === 'TEACHER' || session.user.role === 'ADMIN') {
      // Teachers see exams for their classes
      const where: {
        classId?: string
        subjectId?: string
        class?: { teacherId: string }
      } = {}

      if (classId) where.classId = classId
      if (subjectId) where.subjectId = subjectId
      
      if (session.user.role === 'TEACHER') {
        where.class = { teacherId: session.user.id }
      }

      exams = await prisma.exam.findMany({
        where,
        include: {
          subject: true,
          class: true,
          results: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      })
    } else if (session.user.role === 'STUDENT') {
      // Students see their own exam results
      exams = await prisma.exam.findMany({
        where: {
          results: {
            some: {
              studentId: session.user.id
            }
          }
        },
        include: {
          subject: true,
          class: true,
          results: {
            where: {
              studentId: session.user.id
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: exams
    })
  } catch (error) {
    console.error('Error fetching exams:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exams' },
      { status: 500 }
    )
  }
}

// POST /api/exams - Create a new exam
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Only teachers can create exams' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.classId || !body.subjectId || !body.date || !body.totalMarks) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify teacher has access to this class
    if (session.user.role === 'TEACHER') {
      const classData = await prisma.class.findUnique({
        where: { id: body.classId }
      })

      if (!classData || classData.teacherId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'You do not have permission to create exams for this class' },
          { status: 403 }
        )
      }
    }

    // Create exam
    const exam = await prisma.exam.create({
      data: {
        title: body.title,
        description: body.description || null,
        type: body.type || 'QUIZ',
        classId: body.classId,
        subjectId: body.subjectId,
        date: new Date(body.date),
        duration: parseInt(body.duration) || 60,
        totalMarks: parseInt(body.totalMarks),
        passMarks: parseInt(body.passMarks) || Math.ceil(parseInt(body.totalMarks) * 0.4)
      },
      include: {
        subject: true,
        class: true
      }
    })

    return NextResponse.json({
      success: true,
      data: exam
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating exam:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create exam' },
      { status: 500 }
    )
  }
}
