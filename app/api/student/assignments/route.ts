import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get student's class from User model
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { classId: true }
    })

    if (!user?.classId) {
      return NextResponse.json(
        { success: true, assignments: [] },
        { status: 200 }
      )
    }

    // Get published assignments (exams) for student's class
    const assignments = await prisma.exam.findMany({
      where: {
        classId: user.classId,
        type: {
          in: ['ASSIGNMENT', 'PROJECT', 'QUIZ']
        }
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
        },
        results: {
          where: {
            studentId: session.user.id
          },
          select: {
            id: true,
            marksObtained: true,
            grade: true,
            remarks: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      assignments: assignments.map(assignment => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        type: assignment.type,
        dueDate: assignment.date,
        totalMarks: assignment.totalMarks,
        class: assignment.class,
        subject: assignment.subject,
        submission: assignment.results[0] || null
      }))
    })
  } catch (error) {
    console.error('Error fetching student assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}
