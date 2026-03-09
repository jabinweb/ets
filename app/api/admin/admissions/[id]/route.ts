import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ApplicationStatus } from '@prisma/client'
import {
  sendApplicationUnderReviewEmail,
  sendInterviewScheduledEmail,
  sendApplicationAcceptedEmail,
  sendApplicationRejectedEmail,
  sendApplicationWaitlistedEmail
} from '@/lib/email'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH - Update application status
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const resolvedParams = await params

  try {
    const session = await auth()

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Validation
    if (!status) {
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      )
    }

    if (!Object.values(ApplicationStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Update application
    const application = await prisma.admissionApplication.update({
      where: { id: resolvedParams.id },
      data: { status }
    })

    // Add timeline entry
    await prisma.applicationTimeline.create({
      data: {
        applicationId: resolvedParams.id,
        status: `Status changed to ${status.replace('_', ' ')}`,
        description: `Application status updated by ${session.user.name || session.user.email}`,
        completed: true
      }
    })

    // Send notification email
    try {
      if (!application.email) {
        console.warn('No email found for application:', application.id)
        return
      }

      const studentName = `${application.studentFirstName} ${application.studentLastName}`

      if (status === 'UNDER_REVIEW') {
        await sendApplicationUnderReviewEmail(
          application.email,
          studentName,
          application.applicationId
        )
      } else if (status === 'INTERVIEW_SCHEDULED') {
        const interviewDate = new Date()
        interviewDate.setDate(interviewDate.getDate() + 7)

        await sendInterviewScheduledEmail(
          application.email,
          studentName,
          application.applicationId,
          interviewDate,
          '10:00 AM',
          'Online / Jabin Seminary Campus'
        )
      } else if (status === 'ACCEPTED') {
        await sendApplicationAcceptedEmail(
          application.email,
          studentName,
          application.applicationId,
          application.studentGrade
        )
      } else if (status === 'REJECTED') {
        await sendApplicationRejectedEmail(
          application.email,
          studentName,
          application.applicationId
        )
      } else if (status === 'WAITLISTED') {
        await sendApplicationWaitlistedEmail(
          application.email,
          studentName,
          application.applicationId
        )
      }
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError)
    }

    return NextResponse.json({
      success: true,
      data: application
    })

  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
