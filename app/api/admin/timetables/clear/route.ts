import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    if (!classId) {
      return NextResponse.json(
        { success: false, message: "Class ID is required" },
        { status: 400 }
      )
    }

    // Verify class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId }
    })
    
    if (!classExists) {
      return NextResponse.json(
        { success: false, message: "Class not found" },
        { status: 404 }
      )
    }

    // Delete all timetable entries for this class
    const result = await prisma.timetableEntry.deleteMany({
      where: { classId }
    })

    return NextResponse.json({
      success: true,
      message: `Cleared ${result.count} timetable entries successfully`,
      deletedCount: result.count
    })
  } catch (error) {
    console.error('Error clearing timetable:', error)
    return NextResponse.json(
      { success: false, message: "Failed to clear timetable" },
      { status: 500 }
    )
  }
}
