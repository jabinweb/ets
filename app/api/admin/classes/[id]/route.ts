import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

interface ClassDetailsResponse {
  success: boolean
  message?: string
  data?: unknown
  error?: string
}

// GET - Fetch specific class details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ClassDetailsResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const classDetails = await prisma.class.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            qualification: true,
            specialization: true
          }
        },
        students: {
          select: {
            id: true,
            name: true,
            email: true,
            studentNumber: true,
            phone: true,
            parentName: true,
            parentEmail: true
          },
          orderBy: { name: 'asc' }
        },
        subjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
                credits: true
              }
            }
          }
        },
        timetable: {
          include: {
            subject: {
              select: {
                name: true,
                code: true
              }
            }
          },
          orderBy: [
            { day: 'asc' },
            { startTime: 'asc' }
          ]
        }
      }
    })

    if (!classDetails) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      )
    }

    // Calculate statistics
    const totalStudents = classDetails.students.length
    const totalSubjects = classDetails.subjects.length
    
    // Calculate weekly schedule hours
    const scheduleHours = classDetails.timetable.reduce((total, entry) => {
      const start = new Date(`2024-01-01 ${entry.startTime}`)
      const end = new Date(`2024-01-01 ${entry.endTime}`)
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60) // hours
      return total + duration
    }, 0)

    // Mock attendance data (in real app, calculate from attendance records)
    const averageAttendance = Math.round(85 + Math.random() * 15) // 85-100%

    // Transform the data
    const transformedData = {
      id: classDetails.id,
      name: classDetails.name,
      section: classDetails.section,
      grade: classDetails.grade,
      capacity: classDetails.capacity,
      teacher: classDetails.teacher,
      students: classDetails.students,
      subjects: classDetails.subjects.map(cs => cs.subject),
      schedule: classDetails.timetable.map(entry => ({
        id: entry.id,
        day: entry.day,
        startTime: entry.startTime,
        endTime: entry.endTime,
        subject: entry.subject
      })),
      stats: {
        totalStudents,
        averageAttendance,
        totalSubjects,
        scheduleHours: Math.round(scheduleHours * 10) / 10
      }
    }

    return NextResponse.json({
      success: true,
      data: transformedData
    })

  } catch (error) {
    console.error('Error fetching class details:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ClassDetailsResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id },
      include: {
        students: true,
        timetable: true,
        subjects: true
      }
    })

    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      )
    }

    // Check if class has students
    if (existingClass.students.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete class with enrolled students. Please transfer students first.' },
        { status: 400 }
      )
    }

    // Delete related records first
    await prisma.$transaction([
      // Delete timetable entries
      prisma.timetableEntry.deleteMany({
        where: { classId: id }
      }),
      // Delete class-subject relationships
      prisma.classSubject.deleteMany({
        where: { classId: id }
      }),
      // Delete the class
      prisma.class.delete({
        where: { id }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Class deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete class' },
      { status: 500 }
    )
  }
}

// PUT - Update class
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ClassDetailsResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name, section, grade, capacity, teacherId } = body

    // Validate required fields
    if (!name || !section || grade === undefined || !capacity) {
      return NextResponse.json(
        { success: false, error: 'Name, section, grade, and capacity are required' },
        { status: 400 }
      )
    }

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id }
    })

    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      )
    }

    // Check if teacher exists (if provided)
    if (teacherId) {
      const teacher = await prisma.user.findUnique({
        where: { id: teacherId, role: 'TEACHER' }
      })

      if (!teacher) {
        return NextResponse.json(
          { success: false, error: 'Teacher not found' },
          { status: 400 }
        )
      }
    }

    // Update the class
    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name,
        section,
        grade: parseInt(grade),
        capacity: parseInt(capacity),
        teacherId: teacherId || null
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Class updated successfully',
      data: updatedClass
    })

  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update class' },
      { status: 500 }
    )
  }
}
