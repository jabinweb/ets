import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      )
    }

    // Update application
    const application = await prisma.scholarshipApplication.update({
      where: { id },
      data: {
        status,
        reviewedDate: new Date()
      },
      include: {
        scholarship: true
      }
    })

    // If approved, increment scholarship recipient count
    if (status === 'APPROVED') {
      await prisma.scholarship.update({
        where: { id: application.scholarshipId },
        data: {
          currentRecipients: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: application,
      message: `Application ${status.toLowerCase()} successfully`
    })
  } catch (error) {
    console.error('Error updating scholarship application:', error)
    return NextResponse.json(
      { success: false, message: "Failed to update application" },
      { status: 500 }
    )
  }
}
