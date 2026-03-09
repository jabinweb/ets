import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

// Type definitions for the API
interface StudentRequestBody {
  name: string
  email: string
  studentNumber: string
  dateOfBirth?: string
  gender?: string
  phone?: string
  address?: string
  parentName?: string
  parentEmail?: string
  parentPhone?: string
  emergencyContact?: string
  medicalInfo?: string
  previousSchool?: string
  grade: string
  classId?: string
}

interface BulkStudentRequestBody {
  students: StudentRequestBody[]
}

interface StudentData {
  id: string
  name: string
  email: string
  studentNumber: string
  class?: {
    name: string
    grade: number
  } | null
}

interface BulkImportResults {
  summary: {
    total: number
    processed: number
    created: number
    errors: number
    skipped: number
  }
  results: {
    created: Array<{
      id: string
      name: string
      email: string
      studentNumber: string
    }>
    errors: string[]
    skipped: string[]
  }
}

interface StudentListData {
  students: StudentData[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface StudentResponse {
  success: boolean
  message?: string
  data?: StudentData | BulkImportResults | StudentListData
  error?: string
}

// GET - Fetch all students with pagination and filters
export async function GET(request: NextRequest): Promise<NextResponse<StudentResponse>> {
  try {
    const session = await auth()
    
    // Fix: allow both ADMIN and TEACHER (not just one)
    if (
      !session ||
      (session.user?.role !== 'ADMIN' && session.user?.role !== 'TEACHER')
    ) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const classId = searchParams.get('classId') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: {
      role: Role;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        email?: { contains: string; mode: 'insensitive' };
        studentNumber?: { contains: string; mode: 'insensitive' };
      }>;
      classId?: string;
    } = {
      role: Role.STUDENT
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { studentNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (classId) {
      where.classId = classId
    }

    const students = await prisma.user.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            grade: true,
            section: true
          }
        }
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit
    })

    const total = await prisma.user.count({ where })

    // Transform the data to match our interface
    const transformedStudents: StudentData[] = students.map(student => ({
      id: student.id,
      name: student.name || 'Unknown',
      email: student.email,
      studentNumber: student.studentNumber || 'N/A',
      class: student.class ? {
        name: student.class.name,
        grade: student.class.grade
      } : null
    }))

    return NextResponse.json({
      success: true,
      data: {
        students: transformedStudents,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create single student or bulk import
export async function POST(request: NextRequest): Promise<NextResponse<StudentResponse>> {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Check if it's bulk import or single student
    if ('students' in body) {
      return await handleBulkImport(body as BulkStudentRequestBody)
    } else {
      return await handleSingleStudent(body as StudentRequestBody)
    }

  } catch (error) {
    console.error('Error creating student(s):', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create student(s)' },
      { status: 500 }
    )
  }
}

// Handle single student creation
async function handleSingleStudent(studentData: StudentRequestBody): Promise<NextResponse<StudentResponse>> {
  try {
    // Validate required fields
    const requiredFields = ['name', 'email', 'studentNumber', 'grade']
    
    for (const field of requiredFields) {
      if (!studentData[field as keyof StudentRequestBody]) {
        return NextResponse.json(
          { success: false, error: `${field} is required` },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(studentData.email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email or student number already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: studentData.email },
          { studentNumber: studentData.studentNumber }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email or student number already exists' },
        { status: 409 }
      )
    }

    // Create the student
    const student = await prisma.user.create({
      data: {
        name: studentData.name,
        email: studentData.email,
        studentNumber: studentData.studentNumber,
        role: Role.STUDENT,
        classId: studentData.classId || null,
        // Set a default password for admin-created students
        password: 'student123',
        emailVerified: new Date() // Mark as verified since admin created
      },
      include: {
        class: {
          select: {
            name: true,
            grade: true
          }
        }
      }
    })

    // Transform the response data
    const responseData: StudentData = {
      id: student.id,
      name: student.name || 'Unknown',
      email: student.email,
      studentNumber: student.studentNumber || 'N/A',
      class: student.class
    }

    return NextResponse.json({
      success: true,
      message: 'Student created successfully',
      data: responseData
    })

  } catch (error) {
    console.error('Error creating student:', error)
    throw error
  }
}

// Handle bulk student import
async function handleBulkImport(bulkData: BulkStudentRequestBody): Promise<NextResponse<StudentResponse>> {
  try {
    const { students } = bulkData
    
    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No students data provided' },
        { status: 400 }
      )
    }

    const results = {
      created: [] as Array<{
        id: string;
        name: string;
        email: string;
        studentNumber: string;
      }>,
      errors: [] as string[],
      skipped: [] as string[]
    }

    // Process each student
    for (let i = 0; i < students.length; i++) {
      const studentData = students[i]
      
      try {
        // Validate required fields
        if (!studentData.name || !studentData.email || !studentData.studentNumber || !studentData.grade) {
          results.errors.push(`Row ${i + 1}: Missing required fields`)
          continue
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(studentData.email)) {
          results.errors.push(`Row ${i + 1}: Invalid email format`)
          continue
        }

        // Check if email or student number already exists
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: studentData.email },
              { studentNumber: studentData.studentNumber }
            ]
          }
        })

        if (existingUser) {
          results.skipped.push(`Row ${i + 1}: Email or student number already exists (${studentData.email})`)
          continue
        }

        // Create the student
        const student = await prisma.user.create({
          data: {
            name: studentData.name,
            email: studentData.email,
            studentNumber: studentData.studentNumber,
            role: Role.STUDENT,
            classId: studentData.classId || null,
            password: 'student123', // Default password
            emailVerified: new Date()
          },
          select: {
            id: true,
            name: true,
            email: true,
            studentNumber: true
          }
        })

        results.created.push({
          id: student.id,
          name: student.name || 'Unknown',
          email: student.email,
          studentNumber: student.studentNumber || 'N/A'
        })

      } catch (error) {
        console.error(`Error creating student at row ${i + 1}:`, error)
        results.errors.push(`Row ${i + 1}: Failed to create student - ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    const totalProcessed = results.created.length + results.errors.length + results.skipped.length

    const bulkResults: BulkImportResults = {
      summary: {
        total: students.length,
        processed: totalProcessed,
        created: results.created.length,
        errors: results.errors.length,
        skipped: results.skipped.length
      },
      results: {
        created: results.created,
        errors: results.errors,
        skipped: results.skipped
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk import completed. ${results.created.length} students created successfully.`,
      data: bulkResults
    })

  } catch (error) {
    console.error('Error in bulk import:', error)
    throw error
  }
}
