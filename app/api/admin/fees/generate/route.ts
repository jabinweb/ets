import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { FeeGenerationService } from '@/lib/services/fee-generation.service'

/**
 * POST /api/admin/fees/generate
 * Generate fees for the current or specified month
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
    const { month, feeStructureIds, dryRun = false } = body

    const monthDate = month ? new Date(month) : new Date()

    const result = await FeeGenerationService.generateMonthlyFees({
      month: monthDate,
      feeStructureIds,
      dryRun
    })

    return NextResponse.json({
      success: result.success,
      data: result,
      message: dryRun 
        ? `Dry run complete: Would generate ${result.feesGenerated} fees for ${result.studentsAffected} students`
        : `Successfully generated ${result.feesGenerated} fees for ${result.studentsAffected} students`
    })
  } catch (error) {
    console.error('Error generating fees:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate fees',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
