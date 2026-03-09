import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { DayOfWeek } from '@prisma/client';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Student access required' },
        { status: 401 }
      );
    }

    const student = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        class: {
          include: {
            subjects: {
              include: {
                subject: true
              }
            }
          }
        },
        examResults: {
          include: {
            exam: {
              include: {
                subject: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        attendanceRecords: {
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        subjectPerformances: {
          where: {
            academicYear: new Date().getFullYear().toString()
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get today's classes
    const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][new Date().getDay()] as DayOfWeek;
    
    const todaysClasses = student.class ? await prisma.timetableEntry.count({
      where: {
        classId: student.class.id,
        day: dayOfWeek
      }
    }) : 0;

    // Calculate overall GPA from subject performances
    const subjectPerformances = student.subjectPerformances;
    const totalGPA = subjectPerformances.reduce((sum, perf) => sum + Number(perf.currentPercentage), 0);
    const overallGPA = subjectPerformances.length > 0 
      ? Number((totalGPA / subjectPerformances.length / 25).toFixed(2)) // Convert percentage to 4.0 scale
      : 0;

    // Calculate attendance rate
    const attendanceRecords = student.attendanceRecords;
    const presentRecords = attendanceRecords.filter(record => 
      record.status === 'PRESENT' || record.status === 'LATE'
    ).length;
    const attendanceRate = attendanceRecords.length > 0 
      ? Math.round((presentRecords / attendanceRecords.length) * 100) 
      : 0;

    // Get upcoming exams
    const upcomingExams = student.classId ? await prisma.exam.count({
      where: {
        classId: student.classId,
        date: {
          gte: new Date()
        }
      }
    }) : 0;

    // Get pending assignments (exams without results for this student)
    const pendingAssignments = student.classId ? await prisma.exam.count({
      where: {
        classId: student.classId,
        date: {
          lte: new Date()
        },
        results: {
          none: {
            studentId: student.id
          }
        }
      }
    }) : 0;

    // Get recent activities
    const recentExamResults = student.examResults.slice(0, 3);
    const recentActivities = [
      ...recentExamResults.map(result => 
        `${result.exam.title} - ${result.exam.subject.name}: ${result.grade || `${result.marksObtained}/${result.exam.totalMarks}`}`
      ),
      `Current GPA: ${overallGPA}`,
      `Attendance Rate: ${attendanceRate}%`,
      'Class schedule updated',
      'New assignment posted'
    ].filter(Boolean);

    const dashboardData = {
      classesToday: todaysClasses,
      pendingAssignments,
      overallGPA,
      attendanceRate,
      upcomingExams,
      completedAssignments: student.examResults.length,
      studentName: student.name,
      className: student.class?.name || 'Not assigned',
      subjects: student.class?.subjects.map(cs => cs.subject.name) || [],
      recentGrades: recentExamResults.map(result => ({
        subject: result.exam.subject.name,
        grade: result.grade,
        marks: `${result.marksObtained}/${result.exam.totalMarks}`,
        date: result.createdAt
      })),
      recentActivities
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Student dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
