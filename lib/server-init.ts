/**
 * Server initialization script
 * This file should be imported in your app layout or server entry point
 */

import { CronJobService } from '@/lib/services/cron-job.service'

let isInitialized = false

export function initializeServer() {
  if (isInitialized) {
    return
  }

  // Initialize cron jobs
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
    CronJobService.initialize()
    console.log('✅ Server initialized with cron jobs')
  } else {
    console.log('ℹ️ Cron jobs disabled in development mode')
    console.log('ℹ️ Set ENABLE_CRON=true in .env to enable')
  }

  isInitialized = true
}

// Cleanup on process exit
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing cron jobs')
  CronJobService.stopAll()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing cron jobs')
  CronJobService.stopAll()
  process.exit(0)
})
