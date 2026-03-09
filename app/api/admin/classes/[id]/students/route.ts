import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface StudentAssignmentResponse {
  success: boolean
  message?: string
  error?: string
}

// POST - Assign students to class
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<StudentAssignmentResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: classId } = await params
    const { studentIds } = await request.json()

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No students provided' },
        { status: 400 }
      )
    }

    // Verify class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!classExists) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      )
    }

    // Assign students to class
    await prisma.user.updateMany({
      where: {
        id: { in: studentIds },
        role: 'STUDENT'
      },
      data: {
        classId: classId
      }
    })

    return NextResponse.json({
      success: true,
      message: `${studentIds.length} student(s) assigned successfully`
    })

  } catch (error) {
    console.error('Error assigning students:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to assign students' },
      { status: 500 }
    )
  }
}
