import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { CronJobService } from '@/lib/services/cron-job.service'

/**
 * GET /api/admin/cron/status
 * Get status of all cron jobs
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

    const status = CronJobService.getStatus()

    return NextResponse.json({
      success: true,
      data: status
    })
  } catch (error) {
    console.error('Error getting cron status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get cron status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/cron/trigger
 * Manually trigger a specific cron job
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

    const { job } = await request.json()

    let result

    switch (job) {
      case 'monthly-generation':
        result = await CronJobService.triggerMonthlyGeneration()
        return NextResponse.json({
          success: result.success,
          data: result,
          message: `Generated ${result.feesGenerated} fees for ${result.studentsAffected} students`
        })

      case 'overdue-processing':
        await CronJobService.triggerOverdueProcessing()
        return NextResponse.json({
          success: true,
          message: 'Overdue fees processed successfully'
        })

      case 'send-reminders':
        await CronJobService.triggerReminders()
        return NextResponse.json({
          success: true,
          message: 'Payment reminders sent successfully'
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid job name' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error triggering cron job:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to trigger cron job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
