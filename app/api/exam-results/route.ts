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

    const userRole = session.user.role
    
    if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Only teachers and admins can grade exams' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { results } = body

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Results array is required' },
        { status: 400 }
      )
    }

    // Validate all results have required fields
    for (const result of results) {
      if (!result.examId || !result.studentId || result.marksObtained === undefined) {
        return NextResponse.json(
          { success: false, error: 'Each result must have examId, studentId, and marksObtained' },
          { status: 400 }
        )
      }
    }

    // If teacher, verify they own the class for this exam
    if (userRole === 'TEACHER') {
      const examId = results[0].examId
      const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: { class: true }
      })

      if (!exam) {
        return NextResponse.json(
          { success: false, error: 'Exam not found' },
          { status: 404 }
        )
      }

      if (exam.class.teacherId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: 'You can only grade exams for your own classes' },
          { status: 403 }
        )
      }
    }

    // Upsert all results (create or update)
    const operations = results.map((result: {
      examId: string
      studentId: string
      marksObtained: number
      grade?: string | null
      remarks?: string | null
    }) =>
      prisma.examResult.upsert({
        where: {
          examId_studentId: {
            examId: result.examId,
            studentId: result.studentId
          }
        },
        create: {
          examId: result.examId,
          studentId: result.studentId,
          marksObtained: result.marksObtained,
          grade: result.grade || null,
          remarks: result.remarks || null
        },
        update: {
          marksObtained: result.marksObtained,
          grade: result.grade || null,
          remarks: result.remarks || null
        }
      })
    )

    await prisma.$transaction(operations)

    return NextResponse.json({
      success: true,
      message: `Successfully saved ${results.length} result(s)`
    })
  } catch (error) {
    console.error('Error saving exam results:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save exam results' },
      { status: 500 }
    )
  }
}

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
    const examId = searchParams.get('examId')
    const studentId = searchParams.get('studentId')

    let results

    if (examId && studentId) {
      // Get specific result
      results = await prisma.examResult.findUnique({
        where: {
          examId_studentId: {
            examId,
            studentId
          }
        },
        include: {
          exam: true,
          student: {
            select: {
              id: true,
              name: true,
              studentNumber: true
            }
          }
        }
      })
    } else if (examId) {
      // Get all results for an exam
      results = await prisma.examResult.findMany({
        where: { examId },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              studentNumber: true
            }
          }
        },
        orderBy: {
          student: {
            name: 'asc'
          }
        }
      })
    } else if (studentId) {
      // Get all results for a student
      results = await prisma.examResult.findMany({
        where: { studentId },
        include: {
          exam: {
            include: {
              subject: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Either examId or studentId is required' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('Error fetching exam results:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exam results' },
      { status: 500 }
    )
  }
}
