import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DayOfWeek } from '@prisma/client';
import { getAuthUser, hasRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    if (!user || !hasRole(user, ['TEACHER'])) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Teacher access required' },
        { status: 401 }
      );
    }

    const teacher = await prisma.user.findUnique({
      where: { email: user.email },
      include: {
        classTeacher: {
          include: {
            students: true,
          }
        },
        teacherSubjects: {
          include: {
            subject: true
          }
        },
        payrollRecords: {
          where: {
            payYear: new Date().getFullYear(),
            payMonth: new Date().getMonth() + 1
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        performanceReviews: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Get today's classes
    const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][new Date().getDay()] as DayOfWeek;
    
    const todaysClasses = await prisma.timetableEntry.count({
      where: {
        class: {
          teacherId: teacher.id
        },
        day: dayOfWeek
      }
    });

    // Get total students across all classes
    const totalStudents = teacher.classTeacher.reduce((sum, cls) => sum + cls.students.length, 0);

    // Get pending exams that need grading
    const pendingGrading = await prisma.exam.count({
      where: {
        class: {
          teacherId: teacher.id
        },
        date: {
          lte: new Date()
        },
        results: {
          none: {}
        }
      }
    });

    // Get attendance rate for classes taught by this teacher
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: {
        attendance: {
          class: {
            teacherId: teacher.id
          },
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }
    });

    const presentRecords = attendanceRecords.filter(record => 
      record.status === 'PRESENT' || record.status === 'LATE'
    ).length;
    const attendanceRate = attendanceRecords.length > 0 
      ? Math.round((presentRecords / attendanceRecords.length) * 100) 
      : 0;

    // Get current month salary
    const currentSalary = teacher.payrollRecords[0]?.netSalary || teacher.salary || 0;

    // Get performance rating
    const performanceRating = teacher.performanceReviews[0]?.overallRating || 4.0;

    // Get recent activities
    const recentExams = await prisma.exam.findMany({
      where: {
        class: {
          teacherId: teacher.id
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3,
      include: {
        subject: true,
        class: true
      }
    });

    const recentActivities = [
      `Current Month Salary: $${Number(currentSalary).toLocaleString()}`,
      ...recentExams.map(exam => 
        `${exam.title} - ${exam.subject.name} (${exam.class.name})`
      ),
      'Attendance records updated',
      'Performance metrics calculated'
    ];

    const dashboardData = {
      classesToday: todaysClasses,
      totalStudents,
      pendingGrading,
      attendanceRate,
      currentMonthSalary: Number(currentSalary),
      performanceRating: Number(performanceRating),
      teacherName: teacher.name,
      classes: teacher.classTeacher.map(cls => ({
        id: cls.id,
        name: cls.name,
        studentCount: cls.students.length
      })),
      subjects: teacher.teacherSubjects.map(ts => ts.subject.name),
      recentActivities
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Teacher dashboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
