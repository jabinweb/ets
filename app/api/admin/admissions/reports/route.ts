import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ApplicationStatus } from '@prisma/client'

export const runtime = "nodejs"

interface ReportsResponse {
  success: boolean
  data?: {
    stats: {
      total: number
      pending: number
      underReview: number
      accepted: number
      rejected: number
      waitlisted: number
      thisMonth: number
      lastMonth: number
      growthRate: number
    }
    gradeDistribution: Array<{
      grade: string
      applications: number
      accepted: number
      acceptanceRate: number
    }>
    monthlyData: Array<{
      month: string
      applications: number
      accepted: number
      rejected: number
    }>
    recentActivity: Array<{
      id: string
      type: string
      message: string
      time: string
      status: string
    }>
  }
  error?: string
}

// GET - Fetch admissions reports data
export async function GET(request: NextRequest): Promise<NextResponse<ReportsResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'thisYear'
    const grade = searchParams.get('grade') || 'all'

    // Calculate date ranges based on period
    const now = new Date()
    let startDate = new Date(now.getFullYear(), 0, 1) // Start of this year
    let endDate = now

    switch (period) {
      case 'thisWeek':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, 0, 1)
        endDate = new Date(now.getFullYear() - 1, 11, 31)
        break
    }

    // Build where clause for filtering
    const whereClause: {
      submittedAt: { gte: Date; lte: Date }
      studentGrade?: string
    } = {
      submittedAt: {
        gte: startDate,
        lte: endDate
      }
    }

    if (grade !== 'all') {
      whereClause.studentGrade = grade
    }

    // Fetch basic statistics
    const [
      totalApplications,
      pendingApplications,
      underReviewApplications,
      acceptedApplications,
      rejectedApplications,
      waitlistedApplications
    ] = await Promise.all([
      prisma.admissionApplication.count({ where: whereClause }),
      prisma.admissionApplication.count({ 
        where: { ...whereClause, status: ApplicationStatus.PENDING } 
      }),
      prisma.admissionApplication.count({ 
        where: { ...whereClause, status: ApplicationStatus.UNDER_REVIEW } 
      }),
      prisma.admissionApplication.count({ 
        where: { ...whereClause, status: ApplicationStatus.ACCEPTED } 
      }),
      prisma.admissionApplication.count({ 
        where: { ...whereClause, status: ApplicationStatus.REJECTED } 
      }),
      prisma.admissionApplication.count({ 
        where: { ...whereClause, status: ApplicationStatus.WAITLISTED } 
      })
    ])

    // Calculate this month and last month stats
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    const [thisMonth, lastMonth] = await Promise.all([
      prisma.admissionApplication.count({
        where: {
          submittedAt: { gte: thisMonthStart },
          ...(grade !== 'all' && { studentGrade: grade })
        }
      }),
      prisma.admissionApplication.count({
        where: {
          submittedAt: { gte: lastMonthStart, lte: lastMonthEnd },
          ...(grade !== 'all' && { studentGrade: grade })
        }
      })
    ])

    const growthRate = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0

    // Fetch grade distribution
    const gradeDistributionRaw = await prisma.admissionApplication.groupBy({
      by: ['studentGrade'],
      where: whereClause,
      _count: { _all: true }
    })

    const gradeDistribution = await Promise.all(
      gradeDistributionRaw.map(async (grade) => {
        const accepted = await prisma.admissionApplication.count({
          where: {
            ...whereClause,
            studentGrade: grade.studentGrade,
            status: ApplicationStatus.ACCEPTED
          }
        })

        return {
          grade: grade.studentGrade,
          applications: grade._count._all,
          accepted,
          acceptanceRate: grade._count._all > 0 ? (accepted / grade._count._all) * 100 : 0
        }
      })
    )

    // Fetch monthly data for the chart
    const monthlyData = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const [applications, accepted, rejected] = await Promise.all([
        prisma.admissionApplication.count({
          where: {
            submittedAt: { gte: monthStart, lte: monthEnd },
            ...(grade !== 'all' && { studentGrade: grade })
          }
        }),
        prisma.admissionApplication.count({
          where: {
            submittedAt: { gte: monthStart, lte: monthEnd },
            status: ApplicationStatus.ACCEPTED,
            ...(grade !== 'all' && { studentGrade: grade })
          }
        }),
        prisma.admissionApplication.count({
          where: {
            submittedAt: { gte: monthStart, lte: monthEnd },
            status: ApplicationStatus.REJECTED,
            ...(grade !== 'all' && { studentGrade: grade })
          }
        })
      ])

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        applications,
        accepted,
        rejected
      })
    }

    // Fetch recent activity (using application timeline)
    const recentApplications = await prisma.admissionApplication.findMany({
      take: 10,
      orderBy: { submittedAt: 'desc' },
      where: grade !== 'all' ? { studentGrade: grade } : {},
      select: {
        id: true,
        applicationId: true,
        studentFirstName: true,
        studentLastName: true,
        studentGrade: true,
        status: true,
        submittedAt: true,
        updatedAt: true
      }
    })

    const recentActivity = recentApplications.map((app) => ({
      id: app.id,
      type: 'application',
      message: `New application from ${app.studentFirstName} ${app.studentLastName} for ${app.studentGrade}`,
      time: getTimeAgo(app.submittedAt),
      status: app.status === ApplicationStatus.ACCEPTED ? 'success' : 
              app.status === ApplicationStatus.REJECTED ? 'error' : 
              app.status === ApplicationStatus.PENDING ? 'info' : 'warning'
    }))

    const stats = {
      total: totalApplications,
      pending: pendingApplications,
      underReview: underReviewApplications,
      accepted: acceptedApplications,
      rejected: rejectedApplications,
      waitlisted: waitlistedApplications,
      thisMonth,
      lastMonth,
      growthRate: Math.round(growthRate * 10) / 10
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        gradeDistribution,
        monthlyData,
        recentActivity
      }
    })

  } catch (error) {
    console.error('Error fetching admissions reports:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    return `${diffInMinutes} minutes ago`
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  } else {
    return `${diffInDays} days ago`
  }
}
