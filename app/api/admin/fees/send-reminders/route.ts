import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { FeeGenerationService } from '@/lib/services/fee-generation.service'

/**
 * POST /api/admin/fees/send-reminders
 * Send payment reminders to students
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

    await FeeGenerationService.sendPaymentReminders()

    return NextResponse.json({
      success: true,
      message: 'Payment reminders sent successfully'
    })
  } catch (error) {
    console.error('Error sending reminders:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send reminders'
      },
      { status: 500 }
    )
  }
}
