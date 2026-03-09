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

    const applications = await prisma.scholarshipApplication.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentNumber: true,
            class: {
              select: {
                name: true,
                grade: true
              }
            }
          }
        },
        scholarship: {
          select: {
            id: true,
            name: true,
            amount: true
          }
        }
      },
      orderBy: { applicationDate: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: applications
    })
  } catch (error) {
    console.error('Error fetching scholarship applications:', error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch applications" },
      { status: 500 }
    )
  }
}
