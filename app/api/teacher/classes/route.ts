import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.email || session.user.role !== 'TEACHER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Teacher access required' },
        { status: 401 }
      )
    }

    const teacher = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true
      }
    })

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Find classes where this teacher is assigned
    // Note: ClassSubject doesn't have teacherId in schema, so we find through TeacherSubject
    const teacherSubjects = await prisma.teacherSubject.findMany({
      where: {
        teacherId: teacher.id
      },
      include: {
        subject: {
          include: {
            classes: {
              include: {
                class: true
              }
            }
          }
        }
      }
    })

    // Get unique class IDs from teacher's subjects
    const classIds = new Set<string>()
    teacherSubjects.forEach(ts => {
      ts.subject.classes.forEach(cs => {
        classIds.add(cs.classId)
      })
    })

    // Get detailed information for each unique class
    const uniqueClassIds = Array.from(classIds)
    
    const classes = await Promise.all(
      uniqueClassIds.map(async (classId) => {
        const classData = await prisma.class.findUnique({
          where: { id: classId },
          include: {
            students: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                studentNumber: true
              },
              orderBy: {
                name: 'asc'
              }
            },
            subjects: {
              include: {
                subject: {
                  select: {
                    name: true,
                    code: true
                  }
                }
              }
            }
          }
        })

        if (!classData) return null

        // Get attendance statistics
        const totalStudents = classData.students.length
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Get today's attendance through Attendance -> AttendanceRecord relation
        const todayAttendanceRecords = await prisma.attendance.findFirst({
          where: {
            classId: classId,
            date: {
              gte: today
            }
          },
          include: {
            records: true
          }
        })

        const todayAttendance = todayAttendanceRecords?.records || []

        const presentToday = todayAttendance.filter(
          a => a.status === 'PRESENT' || a.status === 'LATE'
        ).length

        // Get subject IDs for this teacher's subjects in this class
        const teacherSubjectIds = teacherSubjects
          .filter(ts => ts.subject.classes.some(cs => cs.classId === classId))
          .map(ts => ts.subjectId)

        // Get average grade for this teacher's subjects in this class
        const examResults = await prisma.examResult.findMany({
          where: {
            exam: {
              classId: classId,
              subjectId: {
                in: teacherSubjectIds
              }
            }
          },
          include: {
            exam: true
          }
        })

        const averageGrade = examResults.length > 0
          ? Math.round(
              examResults.reduce((sum, r) => 
                sum + (r.marksObtained / r.exam.totalMarks) * 100, 0
              ) / examResults.length
            )
          : 0

        return {
          id: classData.id,
          name: classData.name,
          grade: classData.grade,
          section: classData.section,
          capacity: classData.capacity,
          totalStudents,
          filledPercentage: Math.round((totalStudents / classData.capacity) * 100),
          subjects: classData.subjects
            .filter(cs => teacherSubjectIds.includes(cs.subjectId))
            .map(cs => ({
              id: cs.subjectId,
              name: cs.subject.name,
              code: cs.subject.code
            })),
          students: classData.students.map(student => ({
            id: student.id,
            name: student.name,
            email: student.email,
            phone: student.phone,
            studentNumber: student.studentNumber,
            // Add today's attendance status if available
            attendanceStatus: todayAttendance.find(a => a.studentId === student.id)?.status || null
          })),
          statistics: {
            totalStudents,
            presentToday,
            absentToday: totalStudents - presentToday,
            attendanceRate: totalStudents > 0 
              ? Math.round((presentToday / totalStudents) * 100) 
              : 0,
            averageGrade
          }
        }
      })
    )

    const filteredClasses = classes.filter(c => c !== null)

    return NextResponse.json({
      success: true,
      data: {
        classes: filteredClasses,
        totalClasses: filteredClasses.length,
        totalStudents: filteredClasses.reduce((sum, c) => sum + c.totalStudents, 0)
      }
    })

  } catch (error) {
    console.error('Error fetching teacher classes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}
