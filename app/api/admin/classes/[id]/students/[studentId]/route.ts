import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface StudentRemovalResponse {
  success: boolean
  message?: string
  error?: string
}

// DELETE - Remove student from class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; studentId: string }> }
): Promise<NextResponse<StudentRemovalResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { studentId } = await params

    // Remove student from class
    await prisma.user.update({
      where: {
        id: studentId,
        role: 'STUDENT'
      },
      data: {
        classId: null
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Student removed from class successfully'
    })

  } catch (error) {
    console.error('Error removing student:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove student' },
      { status: 500 }
    )
  }
}
