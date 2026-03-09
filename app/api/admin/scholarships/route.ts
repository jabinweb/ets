import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const scholarships = await prisma.scholarship.findMany({
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: { academicYear: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: scholarships
    })
  } catch (error) {
    console.error('Error fetching scholarships:', error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch scholarships" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      name, description, type, amount, criteria,
      maxRecipients, academicYear, applicationDeadline
    } = body

    // Validate required fields
    if (!name || !type || !amount || !academicYear) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create scholarship
    const scholarship = await prisma.scholarship.create({
      data: {
        name,
        description,
        type,
        amount: parseFloat(amount),
        criteria,
        maxRecipients: maxRecipients ? parseInt(maxRecipients) : null,
        currentRecipients: 0,
        academicYear: parseInt(academicYear),
        status: 'ACTIVE',
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null
      }
    })

    return NextResponse.json({
      success: true,
      data: scholarship,
      message: "Scholarship created successfully"
    })
  } catch (error) {
    console.error('Error creating scholarship:', error)
    return NextResponse.json(
      { success: false, message: "Failed to create scholarship" },
      { status: 500 }
    )
  }
}
