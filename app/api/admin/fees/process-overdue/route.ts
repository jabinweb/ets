import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { FeeGenerationService } from '@/lib/services/fee-generation.service'

/**
 * POST /api/admin/fees/process-overdue
 * Process overdue fees and apply late charges
 */
export async function POST() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await FeeGenerationService.processOverdueFees()

    return NextResponse.json({
      success: true,
      message: 'Overdue fees processed successfully'
    })
  } catch (error) {
    console.error('Error processing overdue fees:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process overdue fees'
      },
      { status: 500 }
    )
  }
}
