import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Debug: Log environment variables
console.log('Email Config:', {
  host: process.env.BREVO_SMTP_HOST,
  port: process.env.BREVO_SMTP_PORT,
  user: process.env.BREVO_SMTP_USER,
  hasPass: !!process.env.BREVO_SMTP_PASS,
  from: process.env.BREVO_FROM_EMAIL,
});

// Create transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.BREVO_FROM_NAME}" <${process.env.BREVO_FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

export function generateVerificationEmail(name: string, verificationUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #662506 0%, #993404 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; }
        .button { display: inline-block; background: #ec7014; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Jakarta Beauty School!</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>Thank you for signing up with Jakarta Beauty School! We're excited to have you join our community of beauty professionals.</p>
          <p>To complete your registration and start booking classes, please verify your email address by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">${verificationUrl}</p>
          <p><strong>This link will expire in 24 hours.</strong></p>
          <p>If you didn't create an account with us, you can safely ignore this email.</p>
          <p>Best regards,<br>Jakarta Beauty School Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Jakarta Beauty School. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateResetPasswordEmail(name: string, resetUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #662506 0%, #993404 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; }
        .button { display: inline-block; background: #ec7014; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .warning { background: #fff7ed; border-left: 4px solid #f97316; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hi ${name},</p>
          <p>We received a request to reset your password for your Jakarta Beauty School account.</p>
          <p>Click the button below to reset your password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">${resetUrl}</p>
          <div class="warning">
            <p style="margin: 0;"><strong>⚠️ Important:</strong></p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request a password reset, please ignore this email</li>
              <li>Your password will remain unchanged until you create a new one</li>
            </ul>
          </div>
          <p>If you have any questions, please contact our support team.</p>
          <p>Best regards,<br>Jakarta Beauty School Team</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Jakarta Beauty School. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
