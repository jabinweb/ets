/**
 * Automated Cron Job Service using node-cron
 * 
 * This service runs scheduled tasks for:
 * - Monthly fee generation (1st of each month at midnight)
 * - Overdue fee processing (daily at 2 AM)
 * - Payment reminder sending (daily at 9 AM)
 */

import cron, { ScheduledTask } from 'node-cron'
import { FeeGenerationService } from './fee-generation.service'

export class CronJobService {
  private static jobs: ScheduledTask[] = []

  /**
   * Initialize all cron jobs
   */
  static initialize() {
    console.log('🕐 Initializing cron jobs...')

    // Monthly fee generation - Runs at midnight on the 1st of every month
    const monthlyFeeJob = cron.schedule('0 0 1 * *', async () => {
      console.log('🔄 Running monthly fee generation...')
      try {
        const result = await FeeGenerationService.generateMonthlyFees()
        console.log('✅ Monthly fee generation completed:', {
          feesGenerated: result.feesGenerated,
          studentsAffected: result.studentsAffected,
          success: result.success
        })
      } catch (error) {
        console.error('❌ Monthly fee generation failed:', error)
      }
    }, {
      timezone: 'America/New_York' // Adjust to your timezone
    })

    // Overdue fee processing - Runs daily at 2 AM
    const overdueProcessJob = cron.schedule('0 2 * * *', async () => {
      console.log('🔄 Running overdue fee processing...')
      try {
        await FeeGenerationService.processOverdueFees()
        console.log('✅ Overdue fee processing completed')
      } catch (error) {
        console.error('❌ Overdue fee processing failed:', error)
      }
    }, {
      timezone: 'America/New_York'
    })

    // Payment reminders - Runs daily at 9 AM
    const reminderJob = cron.schedule('0 9 * * *', async () => {
      console.log('🔄 Sending payment reminders...')
      try {
        await FeeGenerationService.sendPaymentReminders()
        console.log('✅ Payment reminders sent')
      } catch (error) {
        console.error('❌ Payment reminder sending failed:', error)
      }
    }, {
      timezone: 'America/New_York'
    })

    this.jobs.push(monthlyFeeJob, overdueProcessJob, reminderJob)

    console.log('✅ All cron jobs initialized successfully')
    console.log('📋 Active jobs:', this.jobs.length)
  }

  /**
   * Stop all cron jobs
   */
  static stopAll() {
    console.log('🛑 Stopping all cron jobs...')
    this.jobs.forEach(job => job.stop())
    this.jobs = []
    console.log('✅ All cron jobs stopped')
  }

  /**
   * Get status of all cron jobs
   */
  static getStatus() {
    return {
      totalJobs: this.jobs.length,
      jobs: [
        { name: 'Monthly Fee Generation', schedule: '0 0 1 * *', description: 'Runs at midnight on 1st of month' },
        { name: 'Overdue Processing', schedule: '0 2 * * *', description: 'Runs daily at 2 AM' },
        { name: 'Payment Reminders', schedule: '0 9 * * *', description: 'Runs daily at 9 AM' }
      ]
    }
  }

  /**
   * Manually trigger monthly fee generation
   */
  static async triggerMonthlyGeneration() {
    console.log('🔄 Manually triggering monthly fee generation...')
    return await FeeGenerationService.generateMonthlyFees()
  }

  /**
   * Manually trigger overdue processing
   */
  static async triggerOverdueProcessing() {
    console.log('🔄 Manually triggering overdue processing...')
    await FeeGenerationService.processOverdueFees()
  }

  /**
   * Manually trigger payment reminders
   */
  static async triggerReminders() {
    console.log('🔄 Manually triggering payment reminders...')
    await FeeGenerationService.sendPaymentReminders()
  }
}
