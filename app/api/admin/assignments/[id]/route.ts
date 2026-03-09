import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ExamType } from '@prisma/client'

interface UpdateAssignmentData {
  title?: string
  description?: string
  type?: ExamType
  date?: Date
  totalMarks?: number
  passMarks?: number
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const { id: assignmentId } = await params
    const body = await request.json()

    // Get existing assignment
    const existingAssignment = await prisma.exam.findUnique({
      where: { id: assignmentId },
      include: {
        class: true
      }
    })

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // If user is a teacher, verify they own this assignment
    if (session.user.role === 'TEACHER' && existingAssignment.class.teacherId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own assignments' },
        { status: 403 }
      )
    }

    // Prepare update data
    const updateData: UpdateAssignmentData = {}
    
    if (body.title) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description || body.instructions || ''
    if (body.type) updateData.type = body.type as ExamType
    if (body.dueDate) updateData.date = new Date(body.dueDate)
    if (body.totalMarks) {
      updateData.totalMarks = parseInt(body.totalMarks)
      updateData.passMarks = Math.floor(parseInt(body.totalMarks) * 0.6)
    }

    // Update assignment
    const updatedAssignment = await prisma.exam.update({
      where: { id: assignmentId },
      data: updateData,
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Assignment updated successfully',
      data: updatedAssignment
    })

  } catch (error) {
    console.error('Error updating assignment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update assignment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const { id: assignmentId } = await params

    // Get existing assignment
    const existingAssignment = await prisma.exam.findUnique({
      where: { id: assignmentId },
      include: {
        class: true,
        results: true
      }
    })

    if (!existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // If user is a teacher, verify they own this assignment
    if (session.user.role === 'TEACHER' && existingAssignment.class.teacherId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own assignments' },
        { status: 403 }
      )
    }

    // Check if assignment has submissions
    if (existingAssignment.results.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete assignment with existing submissions' },
        { status: 400 }
      )
    }

    // Delete assignment
    await prisma.exam.delete({
      where: { id: assignmentId }
    })

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting assignment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete assignment' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: assignmentId } = await params

    // Get assignment with details
    const assignment = await prisma.exam.findUnique({
      where: { id: assignmentId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true,
            teacherId: true,
            _count: {
              select: { students: true }
            }
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
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
      }
    })

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Check if user has access to this assignment
    if (session.user.role === 'TEACHER' && assignment.class.teacherId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Transform the data
    const transformedAssignment = {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description || '',
      type: assignment.type,
      classId: assignment.classId,
      class: {
        name: assignment.class.name,
        grade: assignment.class.grade,
        section: assignment.class.section
      },
      subjectId: assignment.subjectId,
      subject: {
        name: assignment.subject.name,
        code: assignment.subject.code
      },
      dueDate: assignment.date.toISOString(),
      totalMarks: assignment.totalMarks,
      passMarks: assignment.passMarks,
      instructions: assignment.description || '',
      status: 'PUBLISHED',
      submissions: {
        total: assignment.class._count.students,
        submitted: assignment.results.length,
        graded: assignment.results.filter(r => r.grade !== null).length
      },
      results: assignment.results.map(result => ({
        id: result.id,
        student: result.student,
        marksObtained: result.marksObtained,
        grade: result.grade,
        remarks: result.remarks,
        submittedAt: result.createdAt
      })),
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString()
    }

    return NextResponse.json({
      success: true,
      data: transformedAssignment
    })

  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignment' },
      { status: 500 }
    )
  }
}
