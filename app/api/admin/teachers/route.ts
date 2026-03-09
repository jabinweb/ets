import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

// Type definitions for the API
interface TeacherRequestBody {
  name: string
  email: string
  qualification?: string
  specialization?: string
  experience?: number
  dateOfJoining?: string
  salary?: number
  emergencyContact?: string
  bio?: string
  phone?: string
  address?: string
  dateOfBirth?: string
  gender?: string
  subjectIds?: string[]
}

interface TeacherData {
  id: string
  name: string
  email: string
  qualification?: string
  specialization?: string
  experience?: number
  dateOfJoining?: string
  salary?: number
  emergencyContact?: string
  bio?: string
  phone?: string
  address?: string
  dateOfBirth?: string
  gender?: string
  subjects: Array<{
    id: string
    name: string
    code: string
  }>
  classes: Array<{
    id: string
    name: string
    grade: number
    section: string
    studentsCount: number
  }>
  performanceReviews: Array<{
    id: string
    reviewPeriod: string
    overallRating: number
    status: string
    createdAt: string
  }>
  payrollRecords: Array<{
    id: string
    payPeriod: string
    netSalary: number
    status: string
    paymentDate?: string
  }>
}

interface TeacherListData {
  teachers: TeacherData[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface TeacherResponse {
  success: boolean
  message?: string
  data?: TeacherData | TeacherListData
  error?: string
}

// GET - Fetch all teachers with pagination and filters
export async function GET(request: NextRequest): Promise<NextResponse<TeacherResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const subjectId = searchParams.get('subjectId') || ''
    const experience = searchParams.get('experience') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: {
      role: Role;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
        qualification?: { contains: string; mode: 'insensitive' };
        specialization?: { contains: string; mode: 'insensitive' };
      }>;
      teacherSubjects?: {
        some: {
          subjectId: string;
        };
      };
      experience?: {
        gte?: number;
        lte?: number;
      };
    } = {
      role: Role.TEACHER
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { qualification: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (subjectId) {
      where.teacherSubjects = {
        some: {
          subjectId: subjectId
        }
      }
    }

    if (experience) {
      const expValue = parseInt(experience)
      if (expValue === 0) {
        where.experience = { lte: 2 }
      } else if (expValue === 5) {
        where.experience = { gte: 5, lte: 10 }
      } else if (expValue === 10) {
        where.experience = { gte: 10 }
      }
    }

    const teachers = await prisma.user.findMany({
      where,
      include: {
        teacherSubjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        classTeacher: {
          include: {
            _count: {
              select: {
                students: true
              }
            }
          }
        },
        performanceReviews: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            reviewPeriod: true,
            overallRating: true,
            status: true,
            createdAt: true
          }
        },
        payrollRecords: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            payPeriod: true,
            netSalary: true,
            status: true,
            paymentDate: true
          }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit
    })

    const total = await prisma.user.count({ where })

    // Transform the data to match our interface
    const transformedTeachers: TeacherData[] = teachers.map(teacher => ({
      id: teacher.id,
      name: teacher.name || 'Unknown',
      email: teacher.email,
      qualification: teacher.qualification || undefined,
      specialization: teacher.specialization || undefined,
      experience: teacher.experience || undefined,
      dateOfJoining: teacher.dateOfJoining?.toISOString() || undefined,
      salary: teacher.salary ? Number(teacher.salary) : undefined,
      emergencyContact: teacher.emergencyContact || undefined,
      bio: teacher.bio || undefined,
      phone: teacher.phone || undefined,
      address: teacher.address || undefined,
      dateOfBirth: teacher.dateOfBirth?.toISOString() || undefined,
      gender: teacher.gender || undefined,
      subjects: teacher.teacherSubjects.map(ts => ({
        id: ts.subject.id,
        name: ts.subject.name,
        code: ts.subject.code
      })),
      classes: teacher.classTeacher.map(cls => ({
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        section: cls.section,
        studentsCount: cls._count.students
      })),
      performanceReviews: teacher.performanceReviews.map(review => ({
        id: review.id,
        reviewPeriod: review.reviewPeriod,
        overallRating: Number(review.overallRating),
        status: review.status,
        createdAt: review.createdAt.toISOString()
      })),
      payrollRecords: teacher.payrollRecords.map(payroll => ({
        id: payroll.id,
        payPeriod: payroll.payPeriod,
        netSalary: Number(payroll.netSalary),
        status: payroll.status,
        paymentDate: payroll.paymentDate?.toISOString()
      }))
    }))

    return NextResponse.json({
      success: true,
      data: {
        teachers: transformedTeachers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new teacher
export async function POST(request: NextRequest): Promise<NextResponse<TeacherResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: TeacherRequestBody = await request.json()

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Create teacher
    const teacher = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: 'password123', // Default password
        role: Role.TEACHER,
        qualification: body.qualification,
        specialization: body.specialization,
        experience: body.experience,
        dateOfJoining: body.dateOfJoining ? new Date(body.dateOfJoining) : new Date(),
        salary: body.salary,
        emergencyContact: body.emergencyContact,
        bio: body.bio,
        phone: body.phone,
        address: body.address,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        gender: body.gender,
        emailVerified: new Date()
      }
    })

    // Create subject relationships if provided
    if (body.subjectIds && body.subjectIds.length > 0) {
      await prisma.teacherSubject.createMany({
        data: body.subjectIds.map(subjectId => ({
          teacherId: teacher.id,
          subjectId: subjectId
        }))
      })
    }

    // Fetch the created teacher with relationships
    const createdTeacher = await prisma.user.findUnique({
      where: { id: teacher.id },
      include: {
        teacherSubjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        classTeacher: {
          include: {
            _count: {
              select: {
                students: true
              }
            }
          }
        },
        performanceReviews: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            reviewPeriod: true,
            overallRating: true,
            status: true,
            createdAt: true
          }
        },
        payrollRecords: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            payPeriod: true,
            netSalary: true,
            status: true,
            paymentDate: true
          }
        }
      }
    })

    if (!createdTeacher) {
      return NextResponse.json(
        { success: false, error: 'Failed to create teacher' },
        { status: 500 }
      )
    }

    // Transform the data
    const transformedTeacher: TeacherData = {
      id: createdTeacher.id,
      name: createdTeacher.name || 'Unknown',
      email: createdTeacher.email,
      qualification: createdTeacher.qualification || undefined,
      specialization: createdTeacher.specialization || undefined,
      experience: createdTeacher.experience || undefined,
      dateOfJoining: createdTeacher.dateOfJoining?.toISOString() || undefined,
      salary: createdTeacher.salary ? Number(createdTeacher.salary) : undefined,
      emergencyContact: createdTeacher.emergencyContact || undefined,
      bio: createdTeacher.bio || undefined,
      phone: createdTeacher.phone || undefined,
      address: createdTeacher.address || undefined,
      dateOfBirth: createdTeacher.dateOfBirth?.toISOString() || undefined,
      gender: createdTeacher.gender || undefined,
      subjects: createdTeacher.teacherSubjects.map(ts => ({
        id: ts.subject.id,
        name: ts.subject.name,
        code: ts.subject.code
      })),
      classes: createdTeacher.classTeacher.map(cls => ({
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        section: cls.section,
        studentsCount: cls._count.students
      })),
      performanceReviews: createdTeacher.performanceReviews.map(review => ({
        id: review.id,
        reviewPeriod: review.reviewPeriod,
        overallRating: Number(review.overallRating),
        status: review.status,
        createdAt: review.createdAt.toISOString()
      })),
      payrollRecords: createdTeacher.payrollRecords.map(payroll => ({
        id: payroll.id,
        payPeriod: payroll.payPeriod,
        netSalary: Number(payroll.netSalary),
        status: payroll.status,
        paymentDate: payroll.paymentDate?.toISOString()
      }))
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher created successfully',
      data: transformedTeacher
    })

  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create teacher' },
      { status: 500 }
    )
  }
}

// PUT - Update teacher
export async function PUT(request: NextRequest): Promise<NextResponse<TeacherResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('id')

    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Teacher ID is required' },
        { status: 400 }
      )
    }

    const body: TeacherRequestBody = await request.json()

    // Check if teacher exists
    const existingTeacher = await prisma.user.findUnique({
      where: { id: teacherId, role: Role.TEACHER }
    })

    if (!existingTeacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Update teacher
    const updatedTeacher = await prisma.user.update({
      where: { id: teacherId },
      data: {
        name: body.name,
        email: body.email,
        qualification: body.qualification,
        specialization: body.specialization,
        experience: body.experience,
        dateOfJoining: body.dateOfJoining ? new Date(body.dateOfJoining) : undefined,
        salary: body.salary,
        emergencyContact: body.emergencyContact,
        bio: body.bio,
        phone: body.phone,
        address: body.address,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        gender: body.gender
      },
      include: {
        teacherSubjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        classTeacher: {
          include: {
            _count: {
              select: {
                students: true
              }
            }
          }
        },
        performanceReviews: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            reviewPeriod: true,
            overallRating: true,
            status: true,
            createdAt: true
          }
        },
        payrollRecords: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            payPeriod: true,
            netSalary: true,
            status: true,
            paymentDate: true
          }
        }
      }
    })

    // Update subject relationships if provided
    if (body.subjectIds) {
      // Remove existing relationships
      await prisma.teacherSubject.deleteMany({
        where: { teacherId: teacherId }
      })

      // Create new relationships
      if (body.subjectIds.length > 0) {
        await prisma.teacherSubject.createMany({
          data: body.subjectIds.map(subjectId => ({
            teacherId: teacherId,
            subjectId: subjectId
          }))
        })
      }
    }

    // Transform the data
    const transformedTeacher: TeacherData = {
      id: updatedTeacher.id,
      name: updatedTeacher.name || 'Unknown',
      email: updatedTeacher.email,
      qualification: updatedTeacher.qualification || undefined,
      specialization: updatedTeacher.specialization || undefined,
      experience: updatedTeacher.experience || undefined,
      dateOfJoining: updatedTeacher.dateOfJoining?.toISOString() || undefined,
      salary: updatedTeacher.salary ? Number(updatedTeacher.salary) : undefined,
      emergencyContact: updatedTeacher.emergencyContact || undefined,
      bio: updatedTeacher.bio || undefined,
      phone: updatedTeacher.phone || undefined,
      address: updatedTeacher.address || undefined,
      dateOfBirth: updatedTeacher.dateOfBirth?.toISOString() || undefined,
      gender: updatedTeacher.gender || undefined,
      subjects: updatedTeacher.teacherSubjects.map(ts => ({
        id: ts.subject.id,
        name: ts.subject.name,
        code: ts.subject.code
      })),
      classes: updatedTeacher.classTeacher.map(cls => ({
        id: cls.id,
        name: cls.name,
        grade: cls.grade,
        section: cls.section,
        studentsCount: cls._count.students
      })),
      performanceReviews: updatedTeacher.performanceReviews.map(review => ({
        id: review.id,
        reviewPeriod: review.reviewPeriod,
        overallRating: Number(review.overallRating),
        status: review.status,
        createdAt: review.createdAt.toISOString()
      })),
      payrollRecords: updatedTeacher.payrollRecords.map(payroll => ({
        id: payroll.id,
        payPeriod: payroll.payPeriod,
        netSalary: Number(payroll.netSalary),
        status: payroll.status,
        paymentDate: payroll.paymentDate?.toISOString()
      }))
    }

    return NextResponse.json({
      success: true,
      message: 'Teacher updated successfully',
      data: transformedTeacher
    })

  } catch (error) {
    console.error('Error updating teacher:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update teacher' },
      { status: 500 }
    )
  }
}

// DELETE - Delete teacher
export async function DELETE(request: NextRequest): Promise<NextResponse<TeacherResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('id')

    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Teacher ID is required' },
        { status: 400 }
      )
    }

    // Check if teacher exists
    const existingTeacher = await prisma.user.findUnique({
      where: { id: teacherId, role: Role.TEACHER }
    })

    if (!existingTeacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Delete teacher (this will cascade delete related records)
    await prisma.user.delete({
      where: { id: teacherId }
    })

    return NextResponse.json({
      success: true,
      message: 'Teacher deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting teacher:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete teacher' },
      { status: 500 }
    )
  }
}
