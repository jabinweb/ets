import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/fee-structures
 * Get all fee structures
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const feeStructures = await prisma.feeStructure.findMany({
      include: {
        applyToClass: {
          select: {
            id: true,
            name: true,
            section: true,
            grade: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: feeStructures
    })
  } catch (error) {
    console.error('Error fetching fee structures:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch fee structures' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/fee-structures
 * Create a new fee structure
 */
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const feeStructure = await prisma.feeStructure.create({
      data: {
        ...body,
        createdBy: session.user.id
      },
      include: {
        applyToClass: {
          select: {
            id: true,
            name: true,
            section: true,
            grade: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: feeStructure,
      message: 'Fee structure created successfully'
    })
  } catch (error) {
    console.error('Error creating fee structure:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create fee structure',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
