import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Student access required' },
        { status: 401 }
      )
    }

    const student = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        classId: true
      }
    })

    if (!student?.classId) {
      return NextResponse.json(
        { success: false, error: 'Student not assigned to a class' },
        { status: 404 }
      )
    }

    // Get upcoming exams
    const upcomingExams = await prisma.exam.findMany({
      where: {
        classId: student.classId,
        date: {
          gte: new Date()
        }
      },
      include: {
        subject: {
          select: {
            name: true,
            code: true
          }
        },
        class: {
          select: {
            name: true,
            grade: true,
            section: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Get exam results
    const examResults = await prisma.examResult.findMany({
      where: {
        studentId: student.id
      },
      include: {
        exam: {
          include: {
            subject: {
              select: {
                name: true,
                code: true
              }
            },
            class: {
              select: {
                name: true,
                grade: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform upcoming exams
    const transformedUpcoming = upcomingExams.map(exam => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      type: exam.type,
      subject: exam.subject.name,
      subjectCode: exam.subject.code,
      date: exam.date,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passMarks: exam.passMarks,
      className: `${exam.class.grade} ${exam.class.section || ''}`.trim()
    }))

    // Transform results
    const transformedResults = examResults.map(result => ({
      id: result.id,
      examId: result.examId,
      examTitle: result.exam.title,
      examType: result.exam.type,
      subject: result.exam.subject.name,
      subjectCode: result.exam.subject.code,
      marksObtained: result.marksObtained,
      totalMarks: result.exam.totalMarks,
      percentage: Math.round((result.marksObtained / result.exam.totalMarks) * 100),
      grade: result.grade,
      remarks: result.remarks,
      examDate: result.exam.date,
      resultDate: result.createdAt,
      className: result.exam.class.name
    }))

    // Calculate statistics
    const stats = {
      totalExams: examResults.length,
      upcomingExams: upcomingExams.length,
      averagePercentage: examResults.length > 0
        ? Math.round(
            examResults.reduce((sum, r) => 
              sum + (r.marksObtained / r.exam.totalMarks) * 100, 0
            ) / examResults.length
          )
        : 0,
      passedExams: examResults.filter(r => 
        r.marksObtained >= r.exam.passMarks
      ).length
    }

    return NextResponse.json({
      success: true,
      data: {
        upcoming: transformedUpcoming,
        results: transformedResults,
        statistics: stats
      }
    })

  } catch (error) {
    console.error('Error fetching student exams:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exams' },
      { status: 500 }
    )
  }
}
