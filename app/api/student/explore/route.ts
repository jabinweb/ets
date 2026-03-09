import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user || !hasRole(user, ['STUDENT'])) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Student access required' },
        { status: 401 }
      )
    }

    const student = await prisma.user.findUnique({
      where: { email: user.email },
      include: {
        class: {
          include: {
            subjects: {
              include: {
                subject: true
              }
            }
          }
        },
        examResults: {
          include: {
            exam: {
              include: {
                subject: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        attendanceRecords: {
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        subjectPerformances: {
          where: {
            academicYear: new Date().getFullYear().toString()
          },
          include: {
            subject: true
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

    // Calculate attendance rate for this month
    const totalAttendance = student.attendanceRecords.length
    const presentCount = student.attendanceRecords.filter(
      r => r.status === 'PRESENT' || r.status === 'LATE'
    ).length
    const attendanceRate = totalAttendance > 0 
      ? Math.round((presentCount / totalAttendance) * 100) 
      : 0

    // Transform data for explore screen
    const exploreData = {
      // Enrolled subjects
      subjects: student.class?.subjects.map(cs => ({
        id: cs.subjectId,
        name: cs.subject.name,
        code: cs.subject.code,
        credits: cs.subject.credits,
        description: cs.subject.description
      })) || [],

      // Recent exam results
      recentExams: student.examResults.map(result => ({
        id: result.id,
        examName: result.exam.title,
        subjectName: result.exam.subject.name,
        marksObtained: result.marksObtained,
        totalMarks: result.exam.totalMarks,
        percentage: Math.round((result.marksObtained / result.exam.totalMarks) * 100),
        grade: result.grade,
        date: result.createdAt
      })),

      // Subject performances
      performance: student.subjectPerformances.map(sp => ({
        id: sp.id,
        subjectName: sp.subject.name,
        currentGrade: sp.currentGrade,
        percentage: Number(sp.currentPercentage),
        trend: sp.improvementTrend
      })),

      // Attendance summary
      attendance: {
        rate: attendanceRate,
        total: totalAttendance,
        present: presentCount,
        month: new Date().toLocaleString('default', { month: 'long' })
      },

      // Class info
      classInfo: student.class ? {
        name: student.class.name,
        grade: student.class.grade,
        section: student.class.section
      } : null
    }

    return NextResponse.json({
      success: true,
      data: exploreData
    })

  } catch (error) {
    console.error('Error fetching student explore data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch explore data' },
      { status: 500 }
    )
  }
}
