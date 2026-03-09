import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface TeacherUpdateResponse {
  success: boolean
  message?: string
  error?: string
}

// PUT - Update class teacher
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<TeacherUpdateResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { teacherId } = await request.json()

    // Validate teacher exists
    if (teacherId) {
      const teacher = await prisma.user.findUnique({
        where: { id: teacherId, role: 'TEACHER' }
      })

      if (!teacher) {
        return NextResponse.json(
          { success: false, error: 'Teacher not found' },
          { status: 404 }
        )
      }
    }

    // Update class teacher
    await prisma.class.update({
      where: { id },
      data: { teacherId: teacherId || null }
    })

    return NextResponse.json({
      success: true,
      message: 'Class teacher updated successfully'
    })

  } catch (error) {
    console.error('Error updating class teacher:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update class teacher' },
      { status: 500 }
    )
  }
}
