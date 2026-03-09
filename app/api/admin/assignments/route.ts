import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ExamType } from '@prisma/client'

export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    let assignments

    if (session.user.role === 'ADMIN') {
      // Admin can see all assignments
      assignments = await prisma.exam.findMany({
        include: {
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
              section: true,
              _count: {
                select: { students: true }
              }
            }
          },
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          results: {
            select: {
              id: true,
              marksObtained: true,
              grade: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      // Teachers can only see assignments for their classes
      assignments = await prisma.exam.findMany({
        where: {
          class: {
            teacherId: session.user.id
          }
        },
        include: {
          class: {
            select: {
              id: true,
              name: true,
              grade: true,
              section: true,
              _count: {
                select: { students: true }
              }
            }
          },
          subject: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          results: {
            select: {
              id: true,
              marksObtained: true,
              grade: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    // Transform the data to match the frontend interface
    const transformedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description || '',
      type: assignment.type,
      classId: assignment.classId,
      class: {
        name: assignment.class.name,
        grade: assignment.class.grade,
        section: assignment.class.section
      },
      subjectId: assignment.subjectId,
      subject: {
        name: assignment.subject.name,
        code: assignment.subject.code
      },
      dueDate: assignment.date.toISOString(),
      totalMarks: assignment.totalMarks,
      instructions: assignment.description || '',
      status: 'PUBLISHED', // Default status since we don't have this field in Exam model
      submissions: {
        total: assignment.class._count.students,
        submitted: assignment.results.length,
        graded: assignment.results.filter(r => r.grade !== null).length
      },
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: transformedAssignments
    })

  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Allow both ADMIN and TEACHER to create assignments
    if (!['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      classId,
      subjectId,
      dueDate,
      totalMarks,
      instructions
    } = body

    // Validate required fields
    if (!title || !classId || !subjectId || !dueDate || !totalMarks) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // If user is a teacher, verify they can create assignment for this class
    if (session.user.role === 'TEACHER') {
      const teacherClass = await prisma.class.findFirst({
        where: {
          id: classId,
          teacherId: session.user.id
        }
      })

      if (!teacherClass) {
        return NextResponse.json(
          { success: false, error: 'You can only create assignments for your own classes' },
          { status: 403 }
        )
      }

      // Verify teacher teaches this subject
      const teacherSubject = await prisma.teacherSubject.findFirst({
        where: {
          teacherId: session.user.id,
          subjectId: subjectId
        }
      })

      if (!teacherSubject) {
        return NextResponse.json(
          { success: false, error: 'You can only create assignments for subjects you teach' },
          { status: 403 }
        )
      }
    }

    // Create the assignment
    const assignment = await prisma.exam.create({
      data: {
        title,
        description: description || instructions || '',
        type: type as ExamType,
        classId,
        subjectId,
        date: new Date(dueDate),
        duration: 60, // Default duration
        totalMarks: parseInt(totalMarks),
        passMarks: Math.floor(parseInt(totalMarks) * 0.6)
      },
      include: {
        class: {
          select: {
            name: true,
            grade: true,
            section: true
          }
        },
        subject: {
          select: {
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Assignment created successfully',
      data: assignment
    })

  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create assignment' },
      { status: 500 }
    )
  }
}
