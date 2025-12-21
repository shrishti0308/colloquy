import nodemailer from 'nodemailer';
import { Config } from '../config';
import logger from '../utils/logger';
import {
  getDailySessionReminderEmailHtml,
  getFeedbackAddedEmailHtml,
  getLoginAlertEmailHtml,
  getPasswordChangedEmailHtml,
  getPasswordResetEmailHtml,
  getProblemCreatedEmailHtml,
  getProblemDeletedEmailHtml,
  getSessionEndedEmailHtml,
  getSessionInvitationEmailHtml,
  getSessionStartedEmailHtml,
  getSessionUpdateEmailHtml,
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

/**
 * Send a problem created notification email
 * @param email - Recipient email address
 * @param userName - User's name
 * @param problemTitle - Problem title
 * @param problemId - Problem ID
 * @param visibility - Problem visibility
 */
export const sendProblemCreatedEmail = (
  email: string,
  userName: string,
  problemTitle: string,
  problemId: string,
  visibility: string
) => {
  const subject = 'New problem created';
  const html = getProblemCreatedEmailHtml(
    userName,
    problemTitle,
    problemId,
    visibility
  );

  return sendEmail({
    to: email,
    subject: subject,
    html: html,
  });
};

/**
 * Send a problem deleted notification email
 * @param email - Recipient email address
 * @param userName - User's name
 * @param problemTitle - Problem title
 * @param problemId - Problem ID
 */
export const sendProblemDeletedEmail = (
  email: string,
  userName: string,
  problemTitle: string,
  problemId: string
) => {
  const subject = 'Problem deleted';
  const html = getProblemDeletedEmailHtml(userName, problemTitle, problemId);

  return sendEmail({
    to: email,
    subject: subject,
    html: html,
  });
};

/**
 * Send a session invitation email
 * @param email - Recipient email address
 * @param participantName - Participant's name
 * @param hostName - Host's name
 * @param sessionTitle - Session title
 * @param sessionId - Session ID
 * @param scheduledFor - Optional scheduled date
 * @param requiresPasscode - Whether passcode is required
 */
export const sendSessionInvitationEmail = (
  email: string,
  participantName: string,
  hostName: string,
  sessionTitle: string,
  sessionId: string,
  scheduledFor?: Date,
  requiresPasscode: boolean = false
) => {
  const subject = `You've been invited to join "${sessionTitle}"`;
  const html = getSessionInvitationEmailHtml(
    participantName,
    hostName,
    sessionTitle,
    sessionId,
    scheduledFor,
    requiresPasscode
  );

  return sendEmail({
    to: email,
    subject: subject,
    html: html,
  });
};

/**
 * Send a session started notification email
 * @param email - Recipient email address
 * @param participantName - Participant's name
 * @param sessionTitle - Session title
 * @param sessionId - Session ID
 */
export const sendSessionStartedEmail = (
  email: string,
  participantName: string,
  sessionTitle: string,
  sessionId: string
) => {
  const subject = `Session started: "${sessionTitle}"`;
  const html = getSessionStartedEmailHtml(
    participantName,
    sessionTitle,
    sessionId
  );

  return sendEmail({
    to: email,
    subject: subject,
    html: html,
  });
};

/**
 * Send a session ended notification email
 * @param email - Recipient email address
 * @param userName - User's name
 * @param sessionTitle - Session title
 * @param sessionId - Session ID
 * @param duration - Session duration in minutes
 * @param isHost - Whether the recipient is the host
 */
export const sendSessionEndedEmail = (
  email: string,
  userName: string,
  sessionTitle: string,
  sessionId: string,
  duration: number,
  isHost: boolean
) => {
  const subject = `Session ended: "${sessionTitle}"`;
  const html = getSessionEndedEmailHtml(
    userName,
    sessionTitle,
    sessionId,
    duration,
    isHost
  );

  return sendEmail({
    to: email,
    subject: subject,
    html: html,
  });
};

/**
 * Send a feedback added notification email
 * @param email - Recipient email address
 * @param participantName - Participant's name
 * @param hostName - Host's name
 * @param sessionTitle - Session title
 * @param sessionId - Session ID
 * @param score - Optional score
 */
export const sendFeedbackAddedEmail = (
  email: string,
  participantName: string,
  hostName: string,
  sessionTitle: string,
  sessionId: string,
  score?: number
) => {
  const subject = `You received feedback for "${sessionTitle}"`;
  const html = getFeedbackAddedEmailHtml(
    participantName,
    hostName,
    sessionTitle,
    sessionId,
    score
  );

  return sendEmail({
    to: email,
    subject: subject,
    html: html,
  });
};

/**
 * Send a session update notification email (cancellation or rescheduling)
 * @param email - Recipient email address
 * @param userName - User's name
 * @param hostName - Host's name
 * @param sessionTitle - Session title
 * @param updateType - Type of update: 'cancelled' or 'rescheduled'
 * @param oldScheduledFor - Original scheduled date (for rescheduling)
 * @param newScheduledFor - New scheduled date (for rescheduling)
 * @param reason - Optional cancellation reason
 */
export const sendSessionUpdateEmail = (
  email: string,
  userName: string,
  hostName: string,
  sessionTitle: string,
  updateType: 'cancelled' | 'rescheduled',
  oldScheduledFor?: Date,
  newScheduledFor?: Date,
  reason?: string
) => {
  const subject =
    updateType === 'cancelled'
      ? `Session cancelled: "${sessionTitle}"`
      : `Session rescheduled: "${sessionTitle}"`;
  const html = getSessionUpdateEmailHtml(
    userName,
    hostName,
    sessionTitle,
    updateType,
    oldScheduledFor,
    newScheduledFor,
    reason
  );

  return sendEmail({
    to: email,
    subject: subject,
    html: html,
  });
};
/**
 * Send a daily session reminder email
 * @param email - Recipient email address
 * @param userName - User's name
 * @param sessions - Array of sessions scheduled today
 * @param isHost - Whether the recipient is the host
 */
export const sendDailySessionReminderEmail = (
  email: string,
  userName: string,
  sessions: Array<{
    title: string;
    id: string;
    scheduledFor: Date;
    participantCount: number;
  }>,
  isHost: boolean
) => {
  const subject = `You have ${sessions.length} session${sessions.length > 1 ? 's' : ''} scheduled today`;
  const html = getDailySessionReminderEmailHtml(userName, sessions, isHost);

  return sendEmail({
    to: email,
    subject: subject,
    html: html,
  });
};
