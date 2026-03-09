import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

// GET /api/teacher/subjects - Get subjects taught by the teacher
export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Only teachers can access this endpoint' },
        { status: 403 }
      )
    }

    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacherId: session.user.id
      },
      include: {
        subject: true
      }
    })

    const subjects = teacherSubjects.map(ts => ts.subject)

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
