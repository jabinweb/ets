import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

interface StudentUpdateBody {
  name?: string
  email?: string
  studentNumber?: string
  classId?: string
  phone?: string
  address?: string
}

// GET - Fetch single student by ID
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

    const student = await prisma.user.findUnique({
      where: {
        id: resolvedParams.id,
        role: Role.STUDENT
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true
          }
        },
        attendanceRecords: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            attendance: {
              select: {
                date: true
              }
            }
          }
        },
        examResults: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            exam: {
              select: {
                title: true,
                totalMarks: true,
                date: true
              }
            }
          }
        },
        feePayments: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            fee: {
              select: {
                title: true,
                amount: true
              }
            }
          }
        }
      }
    })

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: student
    })

  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update student
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

    const body: StudentUpdateBody = await request.json()

    // Check if student exists
    const existingStudent = await prisma.user.findUnique({
      where: {
        id: resolvedParams.id,
        role: Role.STUDENT
      }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Validate email if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { success: false, error: 'Invalid email format' },
          { status: 400 }
        )
      }

      // Check if email is already taken by another user
      const emailExists = await prisma.user.findFirst({
        where: {
          email: body.email,
          id: { not: resolvedParams.id }
        }
      })

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 409 }
        )
      }
    }

    // Check if student number is already taken by another user
    if (body.studentNumber) {
      const studentNumberExists = await prisma.user.findFirst({
        where: {
          studentNumber: body.studentNumber,
          id: { not: resolvedParams.id }
        }
      })

      if (studentNumberExists) {
        return NextResponse.json(
          { success: false, error: 'Student number already exists' },
          { status: 409 }
        )
      }
    }

    // Update the student
    const updatedStudent = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: {
        ...body,
        updatedAt: new Date()
      },
      include: {
        class: {
          select: {
            name: true,
            grade: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    })

  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update student' },
      { status: 500 }
    )
  }
}

// DELETE - Delete student
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

    // Check if student exists
    const existingStudent = await prisma.user.findUnique({
      where: {
        id: resolvedParams.id,
        role: Role.STUDENT
      }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      )
    }

    // Delete the student (this will cascade delete related records)
    await prisma.user.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete student' },
      { status: 500 }
    )
  }
}
