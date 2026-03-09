import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { FeeType } from '@prisma/client'

// GET - Fetch all fees
export async function GET() {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const fees = await prisma.fee.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        payments: {
          select: {
            id: true,
            status: true,
            amountPaid: true
          }
        }
      }
    })

    // Calculate statistics for each fee
    const feesWithStats = fees.map(fee => {
      const totalPayments = fee.payments.length
      const paidPayments = fee.payments.filter(p => p.status === 'PAID').length
      const totalCollected = fee.payments
        .filter(p => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.amountPaid), 0)

      return {
        ...fee,
        totalPayments,
        paidPayments,
        totalCollected
      }
    })

    return NextResponse.json({
      success: true,
      data: feesWithStats
    })

  } catch (error) {
    console.error('Error fetching fees:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new fee
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, type, amount, description, dueDate } = body

    // Validation
    if (!title || !type || !amount || !dueDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!Object.values(FeeType).includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid fee type' },
        { status: 400 }
      )
    }

    const fee = await prisma.fee.create({
      data: {
        title,
        type,
        amount,
        description,
        dueDate: new Date(dueDate)
      }
    })

    return NextResponse.json({
      success: true,
      data: fee
    })

  } catch (error) {
    console.error('Error creating fee:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
