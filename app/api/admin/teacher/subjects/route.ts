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

    // Get subjects taught by this teacher
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacherId: teacherId
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            credits: true
          }
        }
      }
    })

    // Transform the data
    const subjects = teacherSubjects.map(ts => ({
      id: ts.subject.id,
      name: ts.subject.name,
      code: ts.subject.code,
      description: ts.subject.description,
      credits: ts.subject.credits
    }))

    return NextResponse.json({
      success: true,
      data: subjects
    })

  } catch (error) {
    console.error('Error fetching teacher subjects:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}
