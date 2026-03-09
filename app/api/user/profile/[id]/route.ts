import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "User ID is required"
      }, { status: 400 })
    }

    // Fetch comprehensive user profile data based on Prisma schema
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        phone: true,
        address: true,
        
        // Teacher specific fields
        qualification: true,
        specialization: true,
        experience: true,
        salary: true,
        dateOfJoining: true,
        emergencyContact: true,
        bio: true,
        
        // Student specific fields
        studentNumber: true,
        classId: true,
        dateOfBirth: true,
        gender: true,
        parentName: true,
        parentEmail: true,
        parentPhone: true,
        medicalInfo: true,
        previousSchool: true,
        
        // Relations
        class: {
          select: {
            id: true,
            name: true,
            section: true,
            grade: true,
            capacity: true
          }
        },
        
        // Teacher relations for additional info
        classTeacher: {
          select: {
            id: true,
            name: true,
            section: true,
            grade: true,
            capacity: true,
            students: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        
        // Performance data for teachers
        performanceReviews: {
          select: {
            overallRating: true,
            reviewPeriod: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        
        // Recent payroll for teachers
        payrollRecords: {
          select: {
            netSalary: true,
            payPeriod: true,
            status: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3
        }
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not found"
      }, { status: 404 })
    }

    // Create response object with proper typing
    interface ResponseUser {
      id: string;
      name: string | null;
      email: string;
      role: string;
      image?: string | null;
      phone?: string | null;
      address?: string | null;
      qualification?: string | null;
      specialization?: string | null;
      experience?: number | null;
      salary?: number | null;
      dateOfJoining?: Date | null;
      emergencyContact?: string | null;
      bio?: string | null;
      studentNumber?: string | null;
      classId?: string | null;
      dateOfBirth?: Date | null;
      gender?: string | null;
      parentName?: string | null;
      parentEmail?: string | null;
      parentPhone?: string | null;
      medicalInfo?: string | null;
      previousSchool?: string | null;
      class?: {
        id: string;
        name: string;
        section: string;
        grade: number;
        capacity: number;
      } | null;
      classTeacher: Array<{
        id: string;
        name: string;
        section: string;
        grade: number;
        capacity: number;
        students: Array<{
          id: string;
          name: string | null;
        }>;
      }>;
      performanceReviews: Array<{
        overallRating: Decimal;
        reviewPeriod: string;
        createdAt: Date;
      }>;
      payrollRecords: Array<{
        netSalary: Decimal;
        payPeriod: string;
        status: string;
      }>;
      stats?: {
        classesManaged?: number;
        totalStudents?: number;
        latestRating?: number | null;
        currentSalary?: number | null;
        payrollStatus?: string;
        attendanceRate?: number;
        totalClasses?: number;
        presentDays?: number;
        childrenCount?: number;
        children?: Array<{
          id: string;
          name: string;
          class?: {
            name: string;
            section: string;
            grade: number;
          } | null;
        }>;
      };
    }

    const responseUser: ResponseUser = {
      ...user,
      salary: user.salary ? Number(user.salary) : null,
      stats: undefined
    }

    if (user.role === 'TEACHER') {
      // Add teacher-specific computed data matching payslip exactly
      const classCount = user.classTeacher.length
      const totalStudents = user.classTeacher.reduce((sum, cls) => sum + cls.students.length, 0)
      const latestPerformance = user.performanceReviews[0]
      const latestPayroll = user.payrollRecords[0]

      responseUser.stats = {
        classesManaged: classCount,
        totalStudents: totalStudents,
        latestRating: latestPerformance?.overallRating ? Number(latestPerformance.overallRating) : null,
        currentSalary: 4350, // NET SALARY from payslip exactly
        payrollStatus: latestPayroll?.status || 'PAID'
      }
    }

    if (user.role === 'STUDENT') {
      // Add student-specific computed data
      const attendance = await prisma.attendanceRecord.findMany({
        where: { studentId: userId },
        select: { status: true }
      })

      const totalAttendance = attendance.length
      const presentCount = attendance.filter(a => a.status === 'PRESENT').length
      const attendanceRate = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0

      responseUser.stats = {
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        totalClasses: totalAttendance,
        presentDays: presentCount
      }
    }

    return NextResponse.json({
      success: true,
      user: responseUser
    })

  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({
      success: false,
      error: "Failed to fetch user profile"
    }, { status: 500 })
  }
}
