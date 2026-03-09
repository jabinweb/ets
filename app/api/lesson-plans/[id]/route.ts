import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/lesson-plans/[id] - Get a single lesson plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const lessonPlan = await prisma.lessonPlan.findUnique({
      where: { id },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true
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
      }
    })

    if (!lessonPlan) {
      return NextResponse.json(
        { success: false, error: 'Lesson plan not found' },
        { status: 404 }
      )
    }

    // Check access permissions
    const canAccess = 
      lessonPlan.teacherId === session.user.id || 
      lessonPlan.isPublic ||
      session.user.role === 'ADMIN'

    if (!canAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: lessonPlan
    })
  } catch (error) {
    console.error('Error fetching lesson plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lesson plan' },
      { status: 500 }
    )
  }
}

// PUT /api/lesson-plans/[id] - Update a lesson plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if lesson plan exists and user has permission
    const existingPlan = await prisma.lessonPlan.findUnique({
      where: { id }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: 'Lesson plan not found' },
        { status: 404 }
      )
    }

    const canEdit = 
      existingPlan.teacherId === session.user.id || 
      session.user.role === 'ADMIN'

    if (!canEdit) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Update lesson plan
    const updatedPlan = await prisma.lessonPlan.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        subjectId: body.subjectId,
        classId: body.classId || null,
        duration: body.duration ? parseInt(body.duration) : existingPlan.duration,
        academicYear: body.academicYear,
        semester: body.semester,
        unit: body.unit,
        lessonNumber: body.lessonNumber ? parseInt(body.lessonNumber) : null,
        objectives: body.objectives,
        materials: body.materials,
        activities: body.activities,
        assessment: body.assessment,
        differentiation: body.differentiation,
        homework: body.homework,
        notes: body.notes,
        standards: body.standards,
        status: body.status,
        isTemplate: body.isTemplate,
        isPublic: body.isPublic,
        tags: body.tags,
        attachments: body.attachments
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
      data: updatedPlan
    })
  } catch (error) {
    console.error('Error updating lesson plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update lesson plan' },
      { status: 500 }
    )
  }
}

// DELETE /api/lesson-plans/[id] - Delete a lesson plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if lesson plan exists and user has permission
    const existingPlan = await prisma.lessonPlan.findUnique({
      where: { id }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: 'Lesson plan not found' },
        { status: 404 }
      )
    }

    const canDelete = 
      existingPlan.teacherId === session.user.id || 
      session.user.role === 'ADMIN'

    if (!canDelete) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Delete lesson plan
    await prisma.lessonPlan.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Lesson plan deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting lesson plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete lesson plan' },
      { status: 500 }
    )
  }
}
