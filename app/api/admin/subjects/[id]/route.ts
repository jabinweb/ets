import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface SubjectUpdateBody {
  name?: string
  code?: string
  description?: string
  credits?: number
}

// GET - Fetch single subject by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params

  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const subject = await prisma.subject.findUnique({
      where: { id: resolvedParams.id },
      include: {
        classes: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                grade: true,
                section: true
              }
            }
          }
        },
        teachers: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            classes: true,
            teachers: true
          }
        }
      }
    })

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: subject
    })

  } catch (error) {
    console.error('Error fetching subject:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update subject
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params

  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: SubjectUpdateBody = await request.json()

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingSubject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      )
    }

    // Validate credits if provided
    if (body.credits !== undefined && (body.credits < 1 || body.credits > 10)) {
      return NextResponse.json(
        { success: false, error: 'Credits must be between 1 and 10' },
        { status: 400 }
      )
    }

    // Check for conflicts if name or code is being updated
    if (body.name || body.code) {
      const conflictSubject = await prisma.subject.findFirst({
        where: {
          AND: [
            { id: { not: resolvedParams.id } },
            {
              OR: [
                ...(body.code ? [{ code: body.code.toUpperCase() }] : []),
                ...(body.name ? [{ name: body.name }] : [])
              ]
            }
          ]
        }
      })

      if (conflictSubject) {
        return NextResponse.json(
          { success: false, error: 'Subject with this name or code already exists' },
          { status: 409 }
        )
      }
    }

    // Update the subject
    const updatedSubject = await prisma.subject.update({
      where: { id: resolvedParams.id },
      data: {
        ...(body.name && { name: body.name.trim() }),
        ...(body.code && { code: body.code.trim().toUpperCase() }),
        ...(body.description !== undefined && { description: body.description.trim() }),
        ...(body.credits !== undefined && { credits: body.credits }),
        updatedAt: new Date()
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

    return NextResponse.json({
      success: true,
      message: 'Subject updated successfully',
      data: updatedSubject
    })

  } catch (error) {
    console.error('Error updating subject:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update subject' },
      { status: 500 }
    )
  }
}

// DELETE - Delete subject
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params

  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id: resolvedParams.id },
      include: {
        _count: {
          select: {
            classes: true,
            teachers: true,
            exams: true
          }
        }
      }
    })

    if (!existingSubject) {
      return NextResponse.json(
        { success: false, error: 'Subject not found' },
        { status: 404 }
      )
    }

    // Check if subject is being used
    if (existingSubject._count.classes > 0 || existingSubject._count.teachers > 0 || existingSubject._count.exams > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot delete subject that is assigned to classes, teachers, or has exams. Please remove all associations first.' 
        },
        { status: 400 }
      )
    }

    // Delete the subject
    await prisma.subject.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Subject deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting subject:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete subject' },
      { status: 500 }
    )
  }
}
