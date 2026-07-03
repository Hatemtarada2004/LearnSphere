import nodemailer from 'nodemailer';
import { env } from '../config/env';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>LearnSphere</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f6f9; color: #1a1a2e; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 32px; text-align: center; }
    .header img { height: 40px; margin-bottom: 12px; }
    .header h1 { color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.85); font-size: 15px; margin-top: 6px; }
    .body { padding: 40px 32px; }
    .body h2 { font-size: 22px; font-weight: 600; margin-bottom: 16px; color: #1a1a2e; }
    .body p { font-size: 15px; line-height: 1.7; color: #4a4a6a; margin-bottom: 16px; }
    .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 600; margin: 16px 0; }
    .divider { height: 1px; background: #e8eaed; margin: 24px 0; }
    .note { font-size: 13px; color: #8a8aaa; }
    .footer { background: #f8f9fd; padding: 24px 32px; text-align: center; }
    .footer p { font-size: 13px; color: #8a8aaa; line-height: 1.6; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>LearnSphere</h1>
      <p>Your gateway to knowledge</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} LearnSphere. All rights reserved.</p>
      <p><a href="${env.CLIENT_URL}">Visit our website</a></p>
    </div>
  </div>
</body>
</html>
`;

export const sendWelcomeEmail = async (
  to: string,
  firstName: string,
  verificationUrl: string
): Promise<void> => {
  const html = baseTemplate(`
    <h2>Welcome to LearnSphere, ${firstName}! 🎉</h2>
    <p>We're thrilled to have you on board. You're just one step away from accessing thousands of courses taught by industry experts.</p>
    <p>Please verify your email address to get started:</p>
    <a href="${verificationUrl}" class="button">Verify Email Address</a>
    <div class="divider"></div>
    <p class="note">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
  `);

  await sendEmail({ to, subject: 'Welcome to LearnSphere — Verify Your Email', html });
};

export const sendEmailVerificationEmail = async (
  to: string,
  firstName: string,
  verificationUrl: string
): Promise<void> => {
  const html = baseTemplate(`
    <h2>Verify Your Email Address</h2>
    <p>Hi ${firstName},</p>
    <p>Click the button below to verify your email address and activate your LearnSphere account.</p>
    <a href="${verificationUrl}" class="button">Verify Email</a>
    <div class="divider"></div>
    <p class="note">This link will expire in 24 hours. If you didn't request this, you can safely ignore this email.</p>
  `);

  await sendEmail({ to, subject: 'Verify Your LearnSphere Account', html });
};

export const sendPasswordResetEmail = async (
  to: string,
  firstName: string,
  resetUrl: string
): Promise<void> => {
  const html = baseTemplate(`
    <h2>Reset Your Password</h2>
    <p>Hi ${firstName},</p>
    <p>We received a request to reset your LearnSphere password. Click the button below to create a new password:</p>
    <a href="${resetUrl}" class="button">Reset Password</a>
    <div class="divider"></div>
    <p class="note">This link will expire in <strong>10 minutes</strong>. If you didn't request a password reset, please ignore this email — your password will remain unchanged.</p>
  `);

  await sendEmail({ to, subject: 'LearnSphere Password Reset Request', html });
};

export const sendEnrollmentConfirmationEmail = async (
  to: string,
  firstName: string,
  courseTitle: string,
  courseUrl: string
): Promise<void> => {
  const html = baseTemplate(`
    <h2>You're enrolled! 🚀</h2>
    <p>Hi ${firstName},</p>
    <p>Congratulations! You have successfully enrolled in:</p>
    <p><strong style="font-size: 18px; color: #667eea;">${courseTitle}</strong></p>
    <p>You can start learning right away. Click the button below to access your course:</p>
    <a href="${courseUrl}" class="button">Start Learning</a>
    <div class="divider"></div>
    <p class="note">Happy learning! If you have any questions, feel free to contact our support team.</p>
  `);

  await sendEmail({
    to,
    subject: `You're enrolled in ${courseTitle}!`,
    html,
  });
};
