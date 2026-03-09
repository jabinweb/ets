/**
 * Automated Fee Generation Service
 * 
 * This service handles:
 * - Automatic monthly fee generation from fee structures
 * - Student assignment based on grade/class/all
 * - Discount application
 * - Late fee calculation
 * - Reminder scheduling
 */

import { prisma } from '@/lib/prisma'
import { addDays, format, startOfMonth } from 'date-fns'
import { Prisma } from '@prisma/client'

type FeeStructureWithClass = Prisma.FeeStructureGetPayload<{
  include: {
    applyToClass: {
      include: {
        students: {
          where: {
            role: 'STUDENT'
          }
        }
      }
    }
  }
}>

interface GenerateFeeOptions {
  month?: Date
  feeStructureIds?: string[]
  dryRun?: boolean
}

interface GenerationResult {
  success: boolean
  feesGenerated: number
  paymentsCreated: number
  studentsAffected: number
  errors: string[]
  details: {
    feeStructureId: string
    feeName: string
    studentsAssigned: number
  }[]
}

export class FeeGenerationService {
  /**
   * Generate fees for a specific month based on active fee structures
   */
  static async generateMonthlyFees(options: GenerateFeeOptions = {}): Promise<GenerationResult> {
    const { 
      month = new Date(), 
      feeStructureIds, 
      dryRun = false 
    } = options

    const result: GenerationResult = {
      success: true,
      feesGenerated: 0,
      paymentsCreated: 0,
      studentsAffected: 0,
      errors: [],
      details: []
    }

    try {
      // Get active fee structures
      const feeStructures = await prisma.feeStructure.findMany({
        where: {
          isActive: true,
          isRecurring: true,
          frequency: 'MONTHLY',
          startDate: { lte: month },
          OR: [
            { endDate: null },
            { endDate: { gte: month } }
          ],
          ...(feeStructureIds && { id: { in: feeStructureIds } })
        },
        include: {
          applyToClass: {
            include: {
              students: {
                where: {
                  role: 'STUDENT'
                }
              }
            }
          }
        }
      })

      console.log(`Found ${feeStructures.length} active fee structures for ${format(month, 'MMMM yyyy')}`)

      for (const structure of feeStructures) {
        try {
          const feeResult = await this.generateFeeFromStructure(structure, month, dryRun)
          result.feesGenerated += feeResult.feesCreated
          result.paymentsCreated += feeResult.paymentsCreated
          result.studentsAffected += feeResult.studentsAffected
          result.details.push({
            feeStructureId: structure.id,
            feeName: structure.name,
            studentsAssigned: feeResult.studentsAffected
          })
        } catch (error) {
          const errorMsg = `Failed to generate fee for structure ${structure.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
          console.error(errorMsg)
          result.errors.push(errorMsg)
          result.success = false
        }
      }

      return result
    } catch (error) {
      console.error('Fee generation failed:', error)
      return {
        ...result,
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
    }
  }

  /**
   * Generate a fee from a fee structure for a specific month
   */
  private static async generateFeeFromStructure(
    structure: FeeStructureWithClass,
    month: Date,
    dryRun: boolean
  ) {
    const monthName = format(month, 'MMMM yyyy')
    const feeTitle = `${structure.name} - ${monthName}`

    // Check if fee already exists for this month
    const existingFee = await prisma.fee.findFirst({
      where: {
        feeStructureId: structure.id,
        generatedFor: monthName
      }
    })

    if (existingFee) {
      console.log(`Fee already exists: ${feeTitle}`)
      return { feesCreated: 0, paymentsCreated: 0, studentsAffected: 0 }
    }

    // Calculate due date
    const generateDate = startOfMonth(month)
    generateDate.setDate(structure.generateOnDay)
    const dueDate = addDays(generateDate, structure.dueDays)

    if (dryRun) {
      const students = await this.getTargetStudents(structure)
      console.log(`[DRY RUN] Would create fee: ${feeTitle} for ${students.length} students`)
      return { feesCreated: 1, paymentsCreated: students.length, studentsAffected: students.length }
    }

    // Create the fee
    const fee = await prisma.fee.create({
      data: {
        title: feeTitle,
        type: structure.type,
        amount: structure.amount,
        description: structure.description,
        dueDate,
        feeStructureId: structure.id,
        generatedFor: monthName,
        academicYear: structure.academicYear,
        isRecurring: true
      }
    })

    // Get target students
    const students = await this.getTargetStudents(structure)

    // Create fee payments for each student
    const payments = await Promise.all(
      students.map(async (student) => {
        // Check for discounts
        const discount = await this.calculateDiscount(student.id, structure)

        const originalAmount = Number(structure.amount)
        const discountAmount = discount.amount

        return prisma.feePayment.create({
          data: {
            feeId: fee.id,
            studentId: student.id,
            amountPaid: 0,
            status: 'PENDING',
            originalAmount: originalAmount,
            discountApplied: discountAmount > 0,
            discountAmount: discountAmount
          }
        })
      })
    )

    console.log(`Created fee ${feeTitle} with ${payments.length} payment records`)

    return {
      feesCreated: 1,
      paymentsCreated: payments.length,
      studentsAffected: students.length
    }
  }

  /**
   * Get target students for a fee structure
   */
  private static async getTargetStudents(structure: FeeStructureWithClass) {
    if (structure.applyToAll) {
      return prisma.user.findMany({
        where: { role: 'STUDENT' }
      })
    }

    if (structure.applyToClassId) {
      return prisma.user.findMany({
        where: {
          role: 'STUDENT',
          classId: structure.applyToClassId
        }
      })
    }

    if (structure.applyToGrade) {
      return prisma.user.findMany({
        where: {
          role: 'STUDENT',
          class: {
            grade: structure.applyToGrade
          }
        }
      })
    }

    return []
  }

  /**
   * Calculate discount for a student
   */
  private static async calculateDiscount(studentId: string, structure: FeeStructureWithClass) {
    if (!structure.allowDiscount) {
      return { amount: 0, reason: null }
    }

    // This would be extended to check for:
    // - Active scholarships
    // - Sibling discounts
    // - Merit-based discounts
    // - Early payment discounts
    
    return { amount: 0, reason: null }
  }

  /**
   * Process overdue fees and apply late charges
   */
  static async processOverdueFees() {
    const today = new Date()

    // Find all pending/overdue payments past their due date
    const overduePayments = await prisma.feePayment.findMany({
      where: {
        status: { in: ['PENDING', 'OVERDUE'] },
        fee: {
          dueDate: { lt: today }
        },
        lateFeeApplied: false
      },
      include: {
        fee: {
          select: {
            dueDate: true,
            feeStructureId: true
          }
        }
      }
    })

    console.log(`Processing ${overduePayments.length} overdue payments`)

    for (const payment of overduePayments) {
      // Get fee structure to check late fee settings
      if (payment.fee.feeStructureId) {
        const structure = await prisma.feeStructure.findUnique({
          where: { id: payment.fee.feeStructureId }
        })

        if (structure) {
          const daysPastDue = Math.floor(
            (today.getTime() - payment.fee.dueDate.getTime()) / (1000 * 60 * 60 * 24)
          )

          if (daysPastDue >= structure.lateFeeDays) {
            let lateFee = 0

            if (structure.lateFeeAmount) {
              lateFee = Number(structure.lateFeeAmount)
            } else if (structure.lateFeePercent) {
              const originalAmount = Number(payment.originalAmount || 0)
              lateFee = originalAmount * (Number(structure.lateFeePercent) / 100)
            }

            if (lateFee > 0) {
              await prisma.feePayment.update({
                where: { id: payment.id },
                data: {
                  status: 'OVERDUE',
                  lateFeeApplied: true,
                  lateFeeAmount: lateFee
                }
              })

              console.log(`Applied late fee of ${lateFee} to payment ${payment.id}`)
            }
          }
        }
      }

      // Update status to OVERDUE if not already
      if (payment.status === 'PENDING') {
        await prisma.feePayment.update({
          where: { id: payment.id },
          data: { status: 'OVERDUE' }
        })
      }
    }
  }

  /**
   * Send payment reminders
   */
  static async sendPaymentReminders() {
    const today = new Date()
    const threeDaysFromNow = addDays(today, 3)
    const sevenDaysFromNow = addDays(today, 7)

    // Due soon reminders (3-7 days before due date)
    const dueSoonPayments = await prisma.feePayment.findMany({
      where: {
        status: 'PENDING',
        fee: {
          dueDate: {
            gte: threeDaysFromNow,
            lte: sevenDaysFromNow
          }
        }
      },
      include: {
        fee: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            parentEmail: true
          }
        }
      }
    })

    for (const payment of dueSoonPayments) {
      // Check if reminder already sent
      const existingReminder = await prisma.feeReminder.findFirst({
        where: {
          feePaymentId: payment.id,
          reminderType: 'DUE_SOON'
        }
      })

      if (!existingReminder) {
        await prisma.feeReminder.create({
          data: {
            feePaymentId: payment.id,
            studentId: payment.studentId,
            reminderType: 'DUE_SOON',
            method: 'email',
            message: `Reminder: ${payment.fee.title} payment of ${payment.originalAmount} is due on ${format(payment.fee.dueDate, 'MMM dd, yyyy')}`
          }
        })

        // TODO: Send actual email/notification here
        console.log(`Sent due soon reminder for payment ${payment.id}`)
      }
    }

    // Overdue reminders
    const overduePayments = await prisma.feePayment.findMany({
      where: {
        status: 'OVERDUE',
        fee: {
          dueDate: { lt: today }
        }
      },
      include: {
        fee: true,
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            parentEmail: true
          }
        }
      }
    })

    for (const payment of overduePayments) {
      const lastReminder = await prisma.feeReminder.findFirst({
        where: {
          feePaymentId: payment.id,
          reminderType: 'OVERDUE'
        },
        orderBy: { sentAt: 'desc' }
      })

      // Send reminder if no reminder sent in last 3 days
      const shouldSendReminder = !lastReminder || 
        (today.getTime() - lastReminder.sentAt.getTime()) > (3 * 24 * 60 * 60 * 1000)

      if (shouldSendReminder) {
        await prisma.feeReminder.create({
          data: {
            feePaymentId: payment.id,
            studentId: payment.studentId,
            reminderType: 'OVERDUE',
            method: 'email',
            message: `OVERDUE: ${payment.fee.title} payment was due on ${format(payment.fee.dueDate, 'MMM dd, yyyy')}. Please pay immediately to avoid additional penalties.`
          }
        })

        console.log(`Sent overdue reminder for payment ${payment.id}`)
      }
    }
  }
}
