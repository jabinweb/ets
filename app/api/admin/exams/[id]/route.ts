import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface ExamResponse {
  success: boolean
  message?: string
  data?: {
    id: string
    title: string
    description?: string
    date: Date
    duration: number
    totalMarks: number
    createdAt: Date
    updatedAt: Date
  }
  error?: string
}

// DELETE - Delete exam
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ExamResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if exam exists
    const existingExam = await prisma.exam.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            results: true
          }
        }
      }
    })

    if (!existingExam) {
      return NextResponse.json(
        { success: false, error: 'Exam not found' },
        { status: 404 }
      )
    }

    // Don't allow deletion if there are results
    if (existingExam._count.results > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete exam with existing results' },
        { status: 400 }
      )
    }

    // Delete the exam
    await prisma.exam.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Exam deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting exam:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete exam' },
      { status: 500 }
    )
  }
}
