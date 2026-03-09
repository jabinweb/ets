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

    const scholarship = await prisma.scholarship.update({
      where: { id },
      data: {
        ...body,
        amount: body.amount ? parseFloat(body.amount) : undefined,
        academicYear: body.academicYear ? parseInt(body.academicYear) : undefined,
        maxRecipients: body.maxRecipients ? parseInt(body.maxRecipients) : undefined,
        applicationDeadline: body.applicationDeadline ? new Date(body.applicationDeadline) : undefined
      }
    })

    return NextResponse.json({
      success: true,
      data: scholarship,
      message: "Scholarship updated successfully"
    })
  } catch (error) {
    console.error('Error updating scholarship:', error)
    return NextResponse.json(
      { success: false, message: "Failed to update scholarship" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await prisma.scholarship.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: "Scholarship deleted successfully"
    })
  } catch (error) {
    console.error('Error deleting scholarship:', error)
    return NextResponse.json(
      { success: false, message: "Failed to delete scholarship" },
      { status: 500 }
    )
  }
}
