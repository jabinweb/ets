import nodemailer from 'nodemailer';
import { getSchoolSettings } from './settings';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });
};

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using nodemailer
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const transporter = createTransporter();
    const settings = await getSchoolSettings();
    const from = process.env.EMAIL_FROM || settings.adminEmail || settings.schoolEmail || 'noreply@school.edu';

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send admission application received email
 */
export async function sendApplicationReceivedEmail(
  email: string,
  studentName: string,
  applicationId: string
) {
  const settings = await getSchoolSettings();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jabin.org';
  const trackingUrl = `${baseUrl}/track-application?applicationId=${applicationId}`;
  const subject = `Application Received - ${settings.schoolName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #22c55e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #22c55e; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .info-box { background-color: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${settings.schoolName}</h1>
          </div>
          <div class="content">
            <h2>Application Received Successfully</h2>
            <p>Dear ${studentName},</p>
            <p>Thank you for your interest in ${settings.schoolName}. We have successfully received your admission application.</p>
            
            <div class="info-box">
              <p><strong>Application ID:</strong> ${applicationId}</p>
              <p><strong>Status:</strong> Pending Review</p>
            </div>

            <p>You can track the progress of your application at any time using our online tracking portal:</p>
            
            <div style="text-align: center;">
              <a href="${trackingUrl}" class="button">Track My Application</a>
            </div>

            <p style="margin-top: 20px;">Our admissions team will review your application and get back to you within 3-5 business days.</p>
            <p>What happens next:</p>
            <ul>
              <li>Application review by our admissions team</li>
              <li>Document verification</li>
              <li>Interview scheduling (if applicable)</li>
              <li>Final admission decision</li>
            </ul>
            <p>If you have any questions, please contact us at:</p>
            <p>Email: ${settings.schoolEmail || settings.adminEmail}<br>
            Phone: ${settings.schoolPhone}</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${settings.schoolName}. All rights reserved.</p>
            <p>${settings.schoolAddress}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Application Received Successfully
    
    Dear ${studentName},
    
    Thank you for your interest in ${settings.schoolName}. We have successfully received your admission application.
    
    Application ID: ${applicationId}
    Track your application: ${trackingUrl}
    
    Our admissions team will review your application and get back to you within 3-5 business days.
    
    If you have any questions, please contact us at ${settings.schoolEmail || settings.adminEmail}
  `;

  return sendEmail({ to: email, subject, html, text });
}

/**
 * Send notification to administrator about new application
 */
export async function sendAdminApplicationNotificationEmail(
  studentName: string,
  applicationId: string,
  program: string
) {
  const settings = await getSchoolSettings();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jabin.org';
  const adminUrl = `${baseUrl}/admin/admissions`; // Adjust based on your admin route
  const adminEmail = settings.adminEmail || settings.schoolEmail || 'admin@jabin.org';
  const subject = `New Admission Application: ${studentName} - ${settings.schoolName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1e293b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f1f5f9; }
          .info-box { background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin: 15px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white !important; text-decoration: none; border-radius: 5px; margin-top: 15px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Application Received</h2>
          </div>
          <div class="content">
            <p>Hello Administrator,</p>
            <p>A new admission application has been submitted through the portal.</p>
            
            <div class="info-box">
              <p><strong>Applicant Name:</strong> ${studentName}</p>
              <p><strong>Program:</strong> ${program}</p>
              <p><strong>Application ID:</strong> ${applicationId}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <div style="text-align: center;">
              <a href="${adminUrl}" class="button">View in Admin Panel</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated notification from ${settings.schoolName} Admissions System.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: adminEmail, subject, html });
}

/**
 * Send application under review email
 */
export async function sendApplicationUnderReviewEmail(
  email: string,
  studentName: string,
  applicationId: string
) {
  const settings = await getSchoolSettings();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jabin.org';
  const trackingUrl = `${baseUrl}/track-application?applicationId=${applicationId}`;
  const subject = `Application Under Review - ${settings.schoolName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white !important; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${settings.schoolName}</h1>
          </div>
          <div class="content">
            <h2>Application Under Review</h2>
            <p>Dear ${studentName},</p>
            <p>Your admission application (Application ID: ${applicationId}) is currently under review by our admissions committee.</p>
            <p>We are carefully evaluating all submitted documents and information. You can check the current status anytime:</p>
            
            <div style="text-align: center;">
              <a href="${trackingUrl}" class="button">Track Application Status</a>
            </div>

            <p style="margin-top: 20px;">For any queries, please contact: ${settings.schoolEmail || settings.adminEmail}</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${settings.schoolName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send interview scheduled email
 */
export async function sendInterviewScheduledEmail(
  email: string,
  studentName: string,
  applicationId: string,
  interviewDate: Date,
  interviewTime: string,
  location: string
) {
  const settings = await getSchoolSettings();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jabin.org';
  const trackingUrl = `${baseUrl}/track-application?applicationId=${applicationId}`;
  const subject = `Interview Scheduled - ${settings.schoolName}`;

  const formattedDate = interviewDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #8b5cf6; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .highlight { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; }
          .button { display: inline-block; padding: 10px 20px; background-color: #8b5cf6; color: white !important; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${settings.schoolName}</h1>
          </div>
          <div class="content">
            <h2>Interview Scheduled</h2>
            <p>Dear ${studentName},</p>
            <p>We are pleased to inform you that an interview has been scheduled for your application.</p>
            <div class="highlight">
              <p><strong>Interview Details:</strong></p>
              <p><strong>Date:</strong> ${formattedDate}<br>
              <strong>Time:</strong> ${interviewTime}<br>
              <strong>Location:</strong> ${location}<br>
              <strong>Application ID:</strong> ${applicationId}</p>
            </div>

            <p>You can view full details and any updates here:</p>
            <div style="text-align: center;">
              <a href="${trackingUrl}" class="button">View Application Details</a>
            </div>

            <p style="margin-top: 20px;"><strong>Important Instructions:</strong></p>
            <ul>
              <li>Please arrive 10 minutes before the scheduled time</li>
              <li>Bring original documents for verification</li>
              <li>Carry a valid ID proof</li>
              <li>The interview will take approximately 30-45 minutes</li>
            </ul>
            <p>If you need to reschedule, please contact us at least 24 hours in advance:</p>
            <p>Email: ${settings.schoolEmail || settings.adminEmail}<br>
            Phone: ${settings.schoolPhone}</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${settings.schoolName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send application accepted email
 */
export async function sendApplicationAcceptedEmail(
  email: string,
  studentName: string,
  applicationId: string,
  grade: string
) {
  const settings = await getSchoolSettings();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jabin.org';
  const trackingUrl = `${baseUrl}/track-application?applicationId=${applicationId}`;
  const subject = `Congratulations! Application Accepted - ${settings.schoolName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #22c55e; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .success-box { background-color: #dcfce7; padding: 15px; border-left: 4px solid #22c55e; margin: 15px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #22c55e; color: white !important; text-decoration: none; border-radius: 5px; margin-top: 15px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Congratulations! 🎉</h1>
            <h2>${settings.schoolName}</h2>
          </div>
          <div class="content">
            <div class="success-box">
              <h2>Application Accepted!</h2>
              <p>We are delighted to inform you that you have been accepted for admission to our program.</p>
            </div>
            <p>Dear ${studentName},</p>
            <p>Your application (ID: ${applicationId}) has been approved by our admissions committee. We look forward to welcoming you to our community!</p>
            
            <div style="text-align: center;">
              <a href="${trackingUrl}" class="button">View Admission Letter & Next Steps</a>
            </div>

            <p style="margin-top: 20px;"><strong>What to do next:</strong></p>
            <ol>
              <li>Log in to the portal to view your official admission letter</li>
              <li>Complete the enrollment formalities within 7 days</li>
              <li>Submit any remaining required documents</li>
              <li>Pay the enrollment fee to secure your seat</li>
            </ol>
            <p>Please visit our admissions office or contact us to complete the process:</p>
            <p>Email: ${settings.schoolEmail || settings.adminEmail}<br>
            Phone: ${settings.schoolPhone}</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${settings.schoolName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send application rejected email
 */
export async function sendApplicationRejectedEmail(
  email: string,
  studentName: string,
  applicationId: string
) {
  const settings = await getSchoolSettings();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jabin.org';
  const trackingUrl = `${baseUrl}/track-application?applicationId=${applicationId}`;
  const subject = `Application Status Update - ${settings.schoolName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #64748b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 10px 20px; background-color: #64748b; color: white !important; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${settings.schoolName}</h1>
          </div>
          <div class="content">
            <h2>Application Status Update</h2>
            <p>Dear ${studentName},</p>
            <p>Thank you for your interest in ${settings.schoolName} and for submitting your application.</p>
            <p>After careful consideration, we regret to inform you that we are unable to offer admission at this time (Application ID: ${applicationId}).</p>
            
            <p>You can view full details here:</p>
            <div style="text-align: center;">
              <a href="${trackingUrl}" class="button">View Application Status</a>
            </div>

            <p style="margin-top: 20px;">Due to limited seats and high competition, we had to make difficult decisions. This decision does not reflect on your abilities or potential.</p>
            <p>If you have any questions, please feel free to contact us:</p>
            <p>Email: ${settings.schoolEmail || settings.adminEmail}<br>
            Phone: ${settings.schoolPhone}</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${settings.schoolName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}

/**
 * Send application waitlisted email
 */
export async function sendApplicationWaitlistedEmail(
  email: string,
  studentName: string,
  applicationId: string
) {
  const settings = await getSchoolSettings();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://jabin.org';
  const trackingUrl = `${baseUrl}/track-application?applicationId=${applicationId}`;
  const subject = `Application Waitlisted - ${settings.schoolName}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .info-box { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; }
          .button { display: inline-block; padding: 10px 20px; background-color: #f59e0b; color: white !important; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${settings.schoolName}</h1>
          </div>
          <div class="content">
            <h2>Application Waitlisted</h2>
            <p>Dear ${studentName},</p>
            <p>Thank you for applying for admission to ${settings.schoolName}.</p>
            <div class="info-box">
              <p>Your application (ID: ${applicationId}) has been placed on the waitlist. This means you have met our admission criteria, but we currently do not have available seats.</p>
            </div>
            
            <p>You can see your position and updates here:</p>
            <div style="text-align: center;">
              <a href="${trackingUrl}" class="button">Track Application Status</a>
            </div>

            <p style="margin-top: 20px;"><strong>What this means:</strong></p>
            <ul>
              <li>Your application remains active for the current academic year</li>
              <li>You will be contacted if a seat becomes available</li>
              <li>Waitlist offers are made on a rolling basis</li>
            </ul>
            <p>For any questions, please contact:</p>
            <p>Email: ${settings.schoolEmail || settings.adminEmail}<br>
            Phone: ${settings.schoolPhone}</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${settings.schoolName}. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
}
