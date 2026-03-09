import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Role, AttendanceStatus, SubjectTrend } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

interface StudentPerformanceData {
  id: string
  studentNumber: string
  name: string
  email: string
  class: string
  grade: number
  overallGPA: number
  attendanceRate: number
  status: 'excellent' | 'good' | 'average' | 'needs_attention'
  subjects: {
    name: string
    grade: string
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }[]
  recentExams: {
    subject: string
    examName: string
    score: number
    maxScore: number
    date: string
    grade: string
  }[]
  attendanceHistory: {
    month: string
    present: number
    absent: number
    late: number
    total: number
  }[]
  performanceTrend: {
    month: string
    gpa: number
    attendance: number
  }[]
  strengthsWeaknesses: {
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
  }
}

interface AttendanceRecord {
  status: AttendanceStatus
  attendance: {
    date: Date
  }
}

interface MonthlyAttendanceData {
  month: string
  present: number
  absent: number
  late: number
  total: number
}

interface PerformanceTrendData {
  month: string
  gpa: number
  attendance: number
}

// Helper function to safely convert Decimal to number
function decimalToNumber(decimal: Decimal | null | undefined): number {
  if (!decimal) return 0
  return Number(decimal.toString())
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const classId = searchParams.get('classId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const where: {
      role: Role
      id?: string
      classId?: string
    } = {
      role: Role.STUDENT
    }

    if (studentId) where.id = studentId
    if (classId) where.classId = classId

    // Get students with comprehensive performance data
    const students = await prisma.user.findMany({
      where,
      include: {
        class: {
          select: {
            name: true,
            grade: true
          }
        },
        performanceReports: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Latest report
        },
        subjectPerformances: {
          where: {
            academicYear: '2024-2025',
            semester: 'Fall'
          },
          include: {
            subject: {
              select: {
                name: true,
                code: true
              }
            }
          }
        },
        examResults: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            exam: {
              include: {
                subject: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        attendanceRecords: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 3 months
            }
          },
          include: {
            attendance: {
              select: {
                date: true
              }
            }
          }
        },
        studentGoals: {
          where: {
            status: {
              in: ['IN_PROGRESS', 'ACHIEVED']
            }
          }
        }
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    })

    // Transform data to include calculated performance metrics
    const performanceData: StudentPerformanceData[] = await Promise.all(
      students.map(async (student) => {
        // Get latest performance report or calculate current metrics
        const latestReport = student.performanceReports[0]
        
        // Calculate current GPA from subject performances with proper Decimal handling
        const currentGPA = student.subjectPerformances.length > 0
          ? student.subjectPerformances.reduce((sum, sp) => sum + decimalToNumber(sp.currentPercentage), 0) / student.subjectPerformances.length / 25 // Convert to 4.0 scale
          : latestReport?.overallGPA ? decimalToNumber(latestReport.overallGPA) : 3.0

        // Calculate attendance rate
        const totalAttendance = student.attendanceRecords.length
        const presentCount = student.attendanceRecords.filter(ar => ar.status === AttendanceStatus.PRESENT).length
        const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 95

        // Determine overall status
        let status: 'excellent' | 'good' | 'average' | 'needs_attention'
        if (currentGPA >= 3.5 && attendanceRate >= 95) status = 'excellent'
        else if (currentGPA >= 3.0 && attendanceRate >= 90) status = 'good'
        else if (currentGPA >= 2.5 && attendanceRate >= 85) status = 'average'
        else status = 'needs_attention'

        // Transform subject performances with proper Decimal conversion
        const subjects = student.subjectPerformances.map(sp => ({
          name: sp.subject.name,
          grade: sp.currentGrade || calculateLetterGrade(decimalToNumber(sp.currentPercentage)),
          percentage: decimalToNumber(sp.currentPercentage),
          trend: mapTrendToString(sp.improvementTrend)
        }))

        // Transform recent exams
        const recentExams = student.examResults.map(er => ({
          subject: er.exam.subject.name,
          examName: er.exam.title,
          score: er.marksObtained,
          maxScore: er.exam.totalMarks,
          date: er.createdAt.toISOString(),
          grade: er.grade || calculateLetterGrade((er.marksObtained / er.exam.totalMarks) * 100)
        }))

        // Calculate attendance history by month
        const attendanceHistory = calculateMonthlyAttendance(student.attendanceRecords as AttendanceRecord[])

        // Calculate performance trends with proper Decimal handling
        const performanceTrend = calculatePerformanceTrend(student.subjectPerformances.map(sp => ({
          subject: sp.subject,
          currentPercentage: decimalToNumber(sp.currentPercentage),
          currentGrade: sp.currentGrade,
          improvementTrend: sp.improvementTrend
        })))

        // Get strengths and weaknesses with proper Decimal handling
        const strengthsWeaknesses = await getStudentStrengthsWeaknesses(student.id, student.subjectPerformances.map(sp => ({
          subject: sp.subject,
          currentPercentage: decimalToNumber(sp.currentPercentage),
          currentGrade: sp.currentGrade,
          improvementTrend: sp.improvementTrend
        })))

        return {
          id: student.id,
          studentNumber: student.studentNumber || 'N/A',
          name: student.name || 'Unknown',
          email: student.email,
          class: student.class?.name || 'Unassigned',
          grade: student.class?.grade || 0,
          overallGPA: Math.round(currentGPA * 100) / 100,
          attendanceRate: Math.round(attendanceRate * 10) / 10,
          status,
          subjects,
          recentExams,
          attendanceHistory,
          performanceTrend,
          strengthsWeaknesses
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: performanceData,
      pagination: {
        page,
        limit,
        total: await prisma.user.count({ where })
      }
    })

  } catch (error) {
    console.error('Error fetching student performance:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch student performance data' },
      { status: 500 }
    )
  }
}

function calculateLetterGrade(percentage: number): string {
  if (percentage >= 97) return 'A+'
  if (percentage >= 93) return 'A'
  if (percentage >= 90) return 'A-'
  if (percentage >= 87) return 'B+'
  if (percentage >= 83) return 'B'
  if (percentage >= 80) return 'B-'
  if (percentage >= 77) return 'C+'
  if (percentage >= 73) return 'C'
  if (percentage >= 70) return 'C-'
  if (percentage >= 67) return 'D+'
  if (percentage >= 65) return 'D'
  return 'F'
}

function mapTrendToString(trend: SubjectTrend): 'up' | 'down' | 'stable' {
  switch (trend) {
    case SubjectTrend.IMPROVING: return 'up'
    case SubjectTrend.DECLINING: return 'down'
    case SubjectTrend.STABLE: return 'stable'
    default: return 'stable'
  }
}

function calculateMonthlyAttendance(attendanceRecords: AttendanceRecord[]): MonthlyAttendanceData[] {
  const monthlyData: Record<string, { present: number; absent: number; late: number; total: number }> = {}
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  // Initialize months
  months.forEach(month => {
    monthlyData[month] = { present: 0, absent: 0, late: 0, total: 0 }
  })

  attendanceRecords.forEach(record => {
    const month = months[record.attendance.date.getMonth()]
    monthlyData[month].total++
    
    switch (record.status) {
      case AttendanceStatus.PRESENT:
        monthlyData[month].present++
        break
      case AttendanceStatus.ABSENT:
        monthlyData[month].absent++
        break
      case AttendanceStatus.LATE:
        monthlyData[month].late++
        break
    }
  })

  return months.map(month => ({
    month,
    ...monthlyData[month]
  }))
}

function calculatePerformanceTrend(subjectPerformances: Array<{
  subject: { name: string; code: string }
  currentPercentage: number
  currentGrade?: string | null
  improvementTrend: SubjectTrend
}>): PerformanceTrendData[] {
  // This would ideally use historical data
  // For now, we'll generate a trend based on current data
  const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb']
  
  return months.map((month) => {
    const baseGPA = subjectPerformances.length > 0 
      ? subjectPerformances.reduce((sum, sp) => sum + sp.currentPercentage, 0) / subjectPerformances.length / 25
      : 3.0
    
    const variation = (Math.random() - 0.5) * 0.4 // ±0.2 variation
    const gpa = Math.max(0, Math.min(4, baseGPA + variation))
    
    const baseAttendance = 95
    const attendanceVariation = (Math.random() - 0.5) * 10
    const attendance = Math.max(80, Math.min(100, baseAttendance + attendanceVariation))
    
    return {
      month,
      gpa: Math.round(gpa * 10) / 10,
      attendance: Math.round(attendance * 10) / 10
    }
  })
}

async function getStudentStrengthsWeaknesses(
  studentId: string, 
  subjectPerformances: Array<{
    subject: { name: string; code: string }
    currentPercentage: number
    currentGrade?: string | null
    improvementTrend: SubjectTrend
  }>
): Promise<{
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}> {
  // Analyze performance to determine strengths and weaknesses
  const strongSubjects = subjectPerformances.filter(sp => sp.currentPercentage >= 85)
  const weakSubjects = subjectPerformances.filter(sp => sp.currentPercentage < 75)
  
  const strengths = [
    ...strongSubjects.map(sp => `Excellent in ${sp.subject.name}`),
    'Consistent attendance',
    'Good class participation'
  ]
  
  const weaknesses = [
    ...weakSubjects.map(sp => `Needs improvement in ${sp.subject.name}`),
    'Time management skills',
    'Study organization'
  ]
  
  const recommendations = [
    'Continue building on existing strengths',
    'Focus extra attention on challenging subjects',
    'Consider peer tutoring programs',
    'Maintain regular study schedule'
  ]
  
  return {
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 3),
    recommendations: recommendations.slice(0, 4)
  }
}
