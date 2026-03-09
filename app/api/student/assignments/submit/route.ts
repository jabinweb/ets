import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { success: false, error: 'Only students can submit assignments' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { examId, submissionText, fileName } = body

    if (!examId || !submissionText) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if assignment exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        class: true
      }
    })

    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      )
    }

    // Verify student is in the class
    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { classId: true }
    })

    if (student?.classId !== exam.classId) {
      return NextResponse.json(
        { success: false, error: 'You are not enrolled in this class' },
        { status: 403 }
      )
    }

    // Check if already submitted
    const existingSubmission = await prisma.examResult.findUnique({
      where: {
        examId_studentId: {
          examId,
          studentId: session.user.id
        }
      }
    })

    if (existingSubmission) {
      return NextResponse.json(
        { success: false, error: 'You have already submitted this assignment' },
        { status: 400 }
      )
    }

    // Create submission (ExamResult with remarks containing submission text)
    const submission = await prisma.examResult.create({
      data: {
        examId,
        studentId: session.user.id,
        marksObtained: 0, // Will be updated by teacher when grading
        remarks: `Submission: ${submissionText}${fileName ? `\nFile: ${fileName}` : ''}`,
        grade: null // Will be set by teacher
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Assignment submitted successfully',
      data: submission
    })

  } catch (error) {
    console.error('Error submitting assignment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit assignment' },
      { status: 500 }
    )
  }
}
