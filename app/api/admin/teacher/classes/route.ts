import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(): Promise<NextResponse> {
    try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Teacher role required.' },
        { status: 403 }
      )
    }

    const teacherId = session.user.id

    // Get classes taught by this teacher
    const classes = await prisma.class.findMany({
      where: {
        teacherId: teacherId
      },
      include: {
        _count: {
          select: {
            students: true
          }
        },
        subjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        }
      },
      orderBy: {
        grade: 'asc'
      }
    })

    // Transform the data to match frontend interface
    const transformedClasses = classes.map(cls => ({
      id: cls.id,
      name: cls.name,
      section: cls.section,
      grade: cls.grade,
      capacity: cls.capacity,
      students: {
        count: cls._count.students
      },
      subjects: cls.subjects.map(cs => cs.subject)
    }))

    return NextResponse.json({
      success: true,
      data: transformedClasses
    })

  } catch (error) {
    console.error('Error fetching teacher classes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}
