import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser, hasRole } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    
    if (!user || !hasRole(user, ['TEACHER'])) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Teacher access required' },
        { status: 401 }
      )
    }

    const teacher = await prisma.user.findUnique({
      where: { email: user.email },
      select: {
        id: true,
        name: true,
        qualification: true,
        specialization: true,
        experience: true
      }
    })

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Get classes taught by this teacher through TeacherSubject
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacherId: teacher.id
      },
      include: {
        subject: {
          include: {
            classes: {
              include: {
                class: {
                  include: {
                    _count: {
                      select: {
                        students: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    // Extract unique classes
    const classIds = new Set<string>()
    teacherSubjects.forEach(ts => {
      ts.subject.classes.forEach(cs => {
        classIds.add(cs.classId)
      })
    })

    const classes = await prisma.class.findMany({
      where: {
        id: {
          in: Array.from(classIds)
        }
      },
      include: {
        _count: {
          select: {
            students: true
          }
        }
      }
    })

    // Get teacher's subjects
    const subjects = teacherSubjects.map(ts => ({
      id: ts.subject.id,
      name: ts.subject.name,
      code: ts.subject.code,
      credits: ts.subject.credits,
      description: ts.subject.description
    }))

    // Get recent performance review
    const latestReview = await prisma.performanceReview.findFirst({
      where: {
        teacherId: teacher.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get latest payroll
    const latestPayroll = await prisma.payrollRecord.findFirst({
      where: {
        employeeId: teacher.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data for explore screen
    const exploreData = {
      // Classes teaching
      classesTeaching: classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        section: cls.section,
        capacity: cls.capacity,
        studentCount: cls._count.students
      })),

      // Subjects teaching
      subjects: subjects,

      // Performance review
      performanceReview: latestReview ? {
        id: latestReview.id,
        period: latestReview.reviewPeriod,
        rating: Number(latestReview.overallRating),
        status: latestReview.status
      } : null,

      // Payroll info
      payroll: latestPayroll ? {
        id: latestPayroll.id,
        period: latestPayroll.payPeriod,
        netSalary: Number(latestPayroll.netSalary),
        status: latestPayroll.status
      } : null,

      // Teacher info
      teacherInfo: {
        qualification: teacher.qualification,
        specialization: teacher.specialization,
        experience: teacher.experience
      }
    }

    return NextResponse.json({
      success: true,
      data: exploreData
    })

  } catch (error) {
    console.error('Error fetching teacher explore data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch explore data' },
      { status: 500 }
    )
  }
}
