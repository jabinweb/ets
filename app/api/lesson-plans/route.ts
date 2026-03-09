import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// GET /api/lesson-plans - List all lesson plans for the current teacher
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
    const subjectId = searchParams.get('subjectId')
    const classId = searchParams.get('classId')
    const status = searchParams.get('status')
    const isTemplate = searchParams.get('isTemplate')
    const search = searchParams.get('search')

    // Build where clause
    const where: Prisma.LessonPlanWhereInput = {
      OR: [
        { teacherId: session.user.id },
        { isPublic: true } // Include public lesson plans from other teachers
      ]
    }

    if (subjectId) {
      where.subjectId = subjectId
    }

    if (classId) {
      where.classId = classId
    }

    if (status && ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'IN_REVIEW'].includes(status)) {
      where.status = status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'IN_REVIEW'
    }

    if (isTemplate === 'true') {
      where.isTemplate = true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const lessonPlans = await prisma.lessonPlan.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            section: true,
            grade: true
          }
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: lessonPlans
    })
  } catch (error) {
    console.error('Error fetching lesson plans:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lesson plans' },
      { status: 500 }
    )
  }
}

// POST /api/lesson-plans - Create a new lesson plan
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
        { success: false, error: 'Only teachers can create lesson plans' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.title || !body.subjectId || !body.duration) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, subjectId, duration' },
        { status: 400 }
      )
    }

    // Create lesson plan
    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        teacherId: session.user.id,
        title: body.title,
        description: body.description || null,
        subjectId: body.subjectId,
        classId: body.classId || null,
        duration: parseInt(body.duration),
        academicYear: body.academicYear || null,
        semester: body.semester || null,
        unit: body.unit || null,
        lessonNumber: body.lessonNumber ? parseInt(body.lessonNumber) : null,
        objectives: body.objectives || [],
        materials: body.materials || [],
        activities: body.activities || [],
        assessment: body.assessment || [],
        differentiation: body.differentiation || [],
        homework: body.homework || null,
        notes: body.notes || null,
        standards: body.standards || [],
        status: body.status || 'DRAFT',
        isTemplate: body.isTemplate || false,
        isPublic: body.isPublic || false,
        tags: body.tags || null,
        attachments: body.attachments || []
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        class: {
          select: {
            id: true,
            name: true,
            section: true,
            grade: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: lessonPlan
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating lesson plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create lesson plan' },
      { status: 500 }
    )
  }
}
