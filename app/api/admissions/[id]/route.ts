import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';
import {
  sendApplicationUnderReviewEmail,
  sendInterviewScheduledEmail,
  sendApplicationAcceptedEmail,
  sendApplicationRejectedEmail,
  sendApplicationWaitlistedEmail,
} from '@/lib/email';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Find the application
    const application = await prisma.admissionApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const { status, interviewDate, interviewTime, location } = body;

    // Validate status
    if (status && !Object.values(ApplicationStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update application status
    const updatedApplication = await prisma.admissionApplication.update({
      where: { id },
      data: {
        status: status || application.status,
      },
    });

    // Create timeline entry
    const timelineDescription = getStatusDescription(status || application.status);
    await prisma.applicationTimeline.create({
      data: {
        applicationId: application.id,
        status: status || application.status,
        description: timelineDescription,
        completed: true,
      },
    });

    // Send appropriate email based on status
    const studentName = `${application.studentFirstName} ${application.studentLastName}`;
    const parentEmail = application.parentEmail || `${application.studentFirstName.toLowerCase()}.${application.studentLastName.toLowerCase()}@example.com`;
    const applicationId = application.applicationId;

    try {
      switch (status) {
        case ApplicationStatus.UNDER_REVIEW:
          if (application.parentEmail) {
            await sendApplicationUnderReviewEmail(
              parentEmail,
              studentName,
              applicationId
            );
          }
          break;

        case ApplicationStatus.INTERVIEW_SCHEDULED:
          if (!interviewDate || !interviewTime || !location) {
            return NextResponse.json(
              { error: 'Interview details (date, time, location) are required' },
              { status: 400 }
            );
          }
          if (application.parentEmail) {
            await sendInterviewScheduledEmail(
              parentEmail,
              studentName,
              applicationId,
              new Date(interviewDate),
              interviewTime,
              location
            );
          }
          break;

        case ApplicationStatus.ACCEPTED:
          if (application.parentEmail) {
            await sendApplicationAcceptedEmail(
              parentEmail,
              studentName,
              applicationId,
              application.studentGrade
            );
          }
          break;

        case ApplicationStatus.REJECTED:
          if (application.parentEmail) {
            await sendApplicationRejectedEmail(
              parentEmail,
              studentName,
              applicationId
            );
          }
          break;

        case ApplicationStatus.WAITLISTED:
          if (application.parentEmail) {
            await sendApplicationWaitlistedEmail(
              parentEmail,
              studentName,
              applicationId
            );
          }
          break;

        default:
          break;
      }

      if (application.parentEmail) {
        console.log(`Status update email sent to ${parentEmail} for status: ${status}`);
      }
    } catch (emailError) {
      // Log email error but don't fail the status update
      console.error('Failed to send status update email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}

function getStatusDescription(status: ApplicationStatus): string {
  switch (status) {
    case ApplicationStatus.PENDING:
      return 'Application submitted and awaiting review';
    case ApplicationStatus.UNDER_REVIEW:
      return 'Application is under review by admissions committee';
    case ApplicationStatus.INTERVIEW_SCHEDULED:
      return 'Interview has been scheduled with the applicant';
    case ApplicationStatus.ACCEPTED:
      return 'Application has been accepted';
    case ApplicationStatus.REJECTED:
      return 'Application has been rejected';
    case ApplicationStatus.WAITLISTED:
      return 'Application has been placed on waitlist';
    default:
      return 'Status updated';
  }
}
