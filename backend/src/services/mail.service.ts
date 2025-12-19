import nodemailer from 'nodemailer';
import { Config } from '../config';
import logger from '../utils/logger';
import {
  getLoginAlertEmailHtml,
  getPasswordChangedEmailHtml,
  getPasswordResetEmailHtml,
  getWelcomeEmailHtml,
} from '../utils/mailTemplates';

const transport = nodemailer.createTransport({
  host: Config.MAIL_HOST,
  port: Config.MAIL_PORT,
  secure: true,
  auth: {
    user: Config.MAIL_USER,
    pass: Config.MAIL_PASS,
  },
});

export const verifyMailConnection = async () => {
  try {
    await transport.verify();
    logger.info('[Mail] Mail server connection verified successfully');
  } catch (error) {
    logger.error('[Mail] Mail server connection verification failed', error);
    process.exit(1);
  }
};

export interface IMailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Send an email (Fire-And-Forget function).
 * @param options - The mail options (to, subject, html, from)
 */
export const sendEmail = async (options: IMailOptions): Promise<void> => {
  const mailOptions = {
    from: options.from || Config.MAIL_FROM,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transport.sendMail(mailOptions);
    logger.info(`[Mail] Email sent: ${info.messageId} to ${options.to}`);
  } catch (error) {
    logger.error(
      `[Mail] Error sending email to ${options.to}: ${error instanceof Error ? error.message : error}`
    );
    throw error; // Re-throw to let caller handle
  }
};

/**
 * Send a welcome email to a new user.
 * @param email - Recipient email address
 * @param name - Recipient name
 */
export const sendWelcomeEmail = (email: string, name: string) => {
  const subject = 'Welcome to Our Service!';
  const html = getWelcomeEmailHtml(name);

  return sendEmail({
    to: email,
    subject: subject,
    html: html,
  });
};

/**
 * Send a security login alert
 * @param email - Recipient email address
 * @param ip - IP address of the login
 * @param device - Device used for the login
 */
export const sendLoginAlertEmail = (
  email: string,
  ip: string,
  device: string
) => {
  const subject = 'Security Alert: New Login to Your Account';
  const html = getLoginAlertEmailHtml(ip, device);

  return sendEmail({
    to: email,
    subject: subject,
    html: html,
  });
};

/**
 * Send a password reset email
 * @param email - Recipient email address
 * @param token - Password reset token
 */
export const sendPasswordResetEmail = (email: string, token: string) => {
  const subject = 'Password Reset Request';
  const html = getPasswordResetEmailHtml(token);

  return sendEmail({
    to: email,
    subject: subject,
    html: html,
  });
};

/**
 * Send a password reset confirmation email
 * @param email - Recipient email address
 */
export const sendPasswordResetConfirmationEmail = (email: string) => {
  const subject = 'Your Password Has Been Reset';
  const html = getPasswordChangedEmailHtml();

  return sendEmail({
    to: email,
    subject: subject,
    html: html,
  });
};
