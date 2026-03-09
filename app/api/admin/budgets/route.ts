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

    const budgets = await prisma.budget.findMany({
      orderBy: { fiscalYear: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: budgets
    })
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch budgets" },
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
      department, category, fiscalYear, allocatedAmount,
      description, startDate, endDate
    } = body

    // Validate required fields
    if (!department || !category || !fiscalYear || !allocatedAmount || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create budget
    const budget = await prisma.budget.create({
      data: {
        department,
        category,
        fiscalYear: parseInt(fiscalYear),
        allocatedAmount: parseFloat(allocatedAmount),
        spentAmount: 0,
        remainingAmount: parseFloat(allocatedAmount),
        status: 'DRAFT',
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    })

    return NextResponse.json({
      success: true,
      data: budget,
      message: "Budget created successfully"
    })
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json(
      { success: false, message: "Failed to create budget" },
      { status: 500 }
    )
  }
}
