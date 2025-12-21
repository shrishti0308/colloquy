import { Config } from '../config';

/**
 * A wrapper for all emails
 * @param content - The specific HTML content for the email body.
 */
const htmlTemplate = (subject: string, content: string): string => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${subject}</title>
    </head>
    <body style="
      margin: 0;
      padding: 0;
      background-color: #F5F7FA;
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      color: #1E2A38;
    ">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center" style="padding: 32px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="
              max-width: 560px;
              background-color: #FFFFFF;
              border: 1px solid #E5E7EB;
            ">
              <tr>
                <td style="padding: 32px;">

                  <!-- Header -->
                  <h1 style="
                    margin: 0 0 16px 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: #1E2A38;
                  ">
                    ${subject}
                  </h1>

                  <!-- Body -->
                  <div style="
                    font-size: 14px;
                    line-height: 1.6;
                    color: #1E2A38;
                  ">
                    ${content}
                  </div>

                  <!-- Signature -->
                  <p style="
                    margin-top: 32px;
                    font-size: 14px;
                    color: #1E2A38;
                  ">
                    — The ${Config.MAIL_FROM || 'Colloquy'} Team
                  </p>

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="
                  padding: 16px 32px;
                  border-top: 1px solid #E5E7EB;
                  font-size: 12px;
                  color: #6B7280;
                ">
                  <p style="margin: 0;">
                    This email was sent because this address was used on Colloquy.
                  </p>
                  <p style="margin: 4px 0 0 0;">
                    © ${new Date().getFullYear()} Colloquy
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
};

/**
 * Generates the HTML for a welcome email.
 * @param name - The user's name.
 */
export const getWelcomeEmailHtml = (name: string): string => {
  const subject = 'Welcome to Colloquy';

  const content = `
    <p>Hello ${name},</p>

    <p>
      Your account has been successfully created.
      You can now conduct and participate in structured technical interviews on Colloquy.
    </p>

    <p>
      If you have questions or run into issues, reply to this email - we read every message.
    </p>
  `;

  return htmlTemplate(subject, content);
};

/**
 * Generates the HTML for a security login alert.
 * @param ip - The IP address of the login.
 * @param device - The User-Agent string (simple device info).
 */
export const getLoginAlertEmailHtml = (ip: string, device: string): string => {
  const subject = 'New login to your Colloquy account';

  const content = `
    <p>
      We detected a new login to your Colloquy account.
    </p>

    <table cellpadding="0" cellspacing="0" role="presentation" style="
      margin: 16px 0;
      font-size: 14px;
    ">
      <tr>
        <td style="padding-right: 8px; color: #6B7280;">IP address</td>
        <td>${ip}</td>
      </tr>
      <tr>
        <td style="padding-right: 8px; color: #6B7280;">Device</td>
        <td>${device}</td>
      </tr>
      <tr>
        <td style="padding-right: 8px; color: #6B7280;">Time</td>
        <td>${new Date().toUTCString()}</td>
      </tr>
    </table>

    <p>
      If this was you, no action is required.
    </p>

    <p style="color: #C62828; font-weight: 500;">
      If this wasn't you, reset your password immediately and contact support.
    </p>
  `;

  return htmlTemplate(subject, content);
};

/**
 * Generates the HTML for a password reset email.
 * @param token - The plain-text reset token.
 */
export const getPasswordResetEmailHtml = (token: string): string => {
  const subject = 'Reset your Colloquy password';
  const resetUrl = `${Config.FRONTEND_URL}/reset-password?token=${token}`;

  const content = `
    <p>
      We received a request to reset your password.
      This reset token is valid for <strong>10 minutes</strong>.
    </p>

    <p style="
      margin: 24px 0;
      font-size: 24px;
      font-weight: 600;
      letter-spacing: 3px;
      text-align: center;
      color: #1E2A38;
    ">
      ${token}
    </p>

    <p style="text-align: center; margin: 24px 0;">
      <a href="${resetUrl}" style="
        display: inline-block;
        padding: 12px 20px;
        background-color: #2F80ED;
        color: #FFFFFF;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 500;
      ">
        Reset password
      </a>
    </p>

    <p>
      If you didn't request this, you can safely ignore this email.
    </p>
  `;

  return htmlTemplate(subject, content);
};

/**
 * Generates the HTML for a changed password email.
 */
export const getPasswordChangedEmailHtml = (): string => {
  const subject = 'Your Colloquy password has been changed';

  const content = `
    <p style="
      font-size: 14px;
      line-height: 1.6;
      color: #1E2A38;
    ">
      This is a confirmation that your password has been successfully changed.
    </p>

    <p style="color: #C62828; font-weight: 500;">
      If you did not make this change, please reset your password immediately and contact support.
    </p>
  `;

  return htmlTemplate(subject, content);
};

/**
 * Generates the HTML for a problem created notification email (for admins).
 * @param userName - The user's name.
 * @param problemTitle - The problem title.
 * @param problemId - The problem ID.
 * @param visibility - Problem visibility.
 */
export const getProblemCreatedEmailHtml = (
  userName: string,
  problemTitle: string,
  problemId: string,
  visibility: string
): string => {
  const subject = 'New problem created';
  const viewUrl = `${Config.FRONTEND_URL}/problems/${problemId}`;

  const visibilityBadge =
    visibility === 'public'
      ? `<span style="
           display: inline-block;
           padding: 4px 8px;
           background-color: #D4EDDA;
           color: #155724;
           border-radius: 4px;
           font-size: 12px;
           font-weight: 500;
         ">
           PUBLIC
         </span>`
      : `<span style="
           display: inline-block;
           padding: 4px 8px;
           background-color: #FFF3CD;
           color: #856404;
           border-radius: 4px;
           font-size: 12px;
           font-weight: 500;
         ">
           PRIVATE
         </span>`;

  const content = `
    <p>Hello ${userName},</p>

    <p>
      Your problem has been successfully created on Colloquy.
    </p>

    <p style="margin: 16px 0;">
      <strong>Problem:</strong> ${problemTitle}
    </p>

    <p style="margin: 16px 0;">
      <strong>Visibility:</strong> ${visibilityBadge}
    </p>

    <p style="text-align: center; margin: 24px 0;">
      <a href="${viewUrl}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #2F80ED;
        color: #FFFFFF;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 500;
      ">
        View Problem
      </a>
    </p>

    <p style="
      font-size: 12px;
      color: #6B7280;
      margin-top: 24px;
    ">
      Or copy this link: ${viewUrl}
    </p>
  `;

  return htmlTemplate(subject, content);
};

/**
 * Generates the HTML for a problem deleted notification email.
 * @param userName - The user's name.
 * @param problemTitle - The problem title.
 * @param problemId - The problem ID.
 */
export const getProblemDeletedEmailHtml = (
  userName: string,
  problemTitle: string,
  problemId: string
): string => {
  const subject = 'Problem deleted';

  const content = `
    <p>Hello ${userName},</p>

    <p>
      Your problem <strong>"${problemTitle}" {${problemId}}</strong> has been successfully deleted from Colloquy.
    </p>

    <p style="
      margin: 16px 0;
      padding: 12px;
      background-color: #F5F5F5;
      border-left: 4px solid #6B7280;
    ">
      This action cannot be undone. The problem is no longer accessible.
    </p>
  `;

  return htmlTemplate(subject, content);
};

/**
 * Generates the HTML for a session invitation email.
 * @param participantName - The invited participant's name.
 * @param hostName - The host's name.
 * @param sessionTitle - The session title.
 * @param sessionId - The session ID.
 * @param scheduledFor - Optional scheduled date/time.
 * @param requiresPasscode - Whether the session requires a passcode.
 */
export const getSessionInvitationEmailHtml = (
  participantName: string,
  hostName: string,
  sessionTitle: string,
  sessionId: string,
  scheduledFor?: Date,
  requiresPasscode: boolean = false
): string => {
  const subject = `You've been invited to join "${sessionTitle}"`;
  const acceptUrl = `${Config.FRONTEND_URL}/sessions/${sessionId}/accept`;

  const scheduledText = scheduledFor
    ? `<p style="margin: 16px 0;">
         <strong>Scheduled for:</strong> ${scheduledFor.toLocaleString(
           'en-US',
           {
             weekday: 'long',
             year: 'numeric',
             month: 'long',
             day: 'numeric',
             hour: 'numeric',
             minute: '2-digit',
             timeZoneName: 'short',
           }
         )}
       </p>`
    : '';

  const passcodeText = requiresPasscode
    ? `<p style="
         margin: 16px 0;
         padding: 12px;
         background-color: #FFF3CD;
         border-left: 4px solid #FFC107;
         color: #856404;
       ">
         <strong>Note:</strong> This is a private session. You'll need a passcode to join.
       </p>`
    : '';

  const content = `
    <p>Hello ${participantName},</p>

    <p>
      <strong>${hostName}</strong> has invited you to join a technical interview session on Colloquy.
    </p>

    <p style="margin: 16px 0;">
      <strong>Session:</strong> ${sessionTitle}
    </p>

    ${scheduledText}

    ${passcodeText}

    <p style="text-align: center; margin: 24px 0;">
      <a href="${acceptUrl}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #2F80ED;
        color: #FFFFFF;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 500;
      ">
        Accept Invitation
      </a>
    </p>

    <p style="
      font-size: 12px;
      color: #6B7280;
      margin-top: 24px;
    ">
      Or copy this link: ${acceptUrl}
    </p>
  `;

  return htmlTemplate(subject, content);
};

/**
 * Generates the HTML for a session started notification email.
 * @param participantName - The participant's name.
 * @param sessionTitle - The session title.
 * @param sessionId - The session ID.
 */
export const getSessionStartedEmailHtml = (
  participantName: string,
  sessionTitle: string,
  sessionId: string
): string => {
  const subject = `Session started: "${sessionTitle}"`;
  const joinUrl = `${Config.FRONTEND_URL}/sessions/${sessionId}`;

  const content = `
    <p>Hello ${participantName},</p>

    <p>
      The session <strong>"${sessionTitle}"</strong> has started.
    </p>

    <p style="text-align: center; margin: 24px 0;">
      <a href="${joinUrl}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #27AE60;
        color: #FFFFFF;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 500;
      ">
        Join Now
      </a>
    </p>

    <p style="
      font-size: 12px;
      color: #6B7280;
      margin-top: 24px;
    ">
      Or copy this link: ${joinUrl}
    </p>
  `;

  return htmlTemplate(subject, content);
};

/**
 * Generates the HTML for a session ended notification email.
 * @param userName - The user's name.
 * @param sessionTitle - The session title.
 * @param sessionId - The session ID.
 * @param duration - Session duration in minutes.
 * @param isHost - Whether the recipient is the host.
 */
export const getSessionEndedEmailHtml = (
  userName: string,
  sessionTitle: string,
  sessionId: string,
  duration: number,
  isHost: boolean
): string => {
  const subject = `Session ended: "${sessionTitle}"`;
  const viewUrl = `${Config.FRONTEND_URL}/sessions/${sessionId}`;

  const hostMessage = isHost
    ? `<p>
         You can now review participant submissions and provide feedback.
       </p>`
    : `<p>
         Thank you for participating. Please wait for the interviewer's feedback.
       </p>`;

  const content = `
    <p>Hello ${userName},</p>

    <p>
      The session <strong>"${sessionTitle}"</strong> has ended.
    </p>

    <p style="margin: 16px 0;">
      <strong>Duration:</strong> ${duration} minutes
    </p>

    ${hostMessage}

    <p style="text-align: center; margin: 24px 0;">
      <a href="${viewUrl}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #2F80ED;
        color: #FFFFFF;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 500;
      ">
        View Session Details
      </a>
    </p>

    <p style="
      font-size: 12px;
      color: #6B7280;
      margin-top: 24px;
    ">
      Or copy this link: ${viewUrl}
    </p>
  `;

  return htmlTemplate(subject, content);
};

/**
 * Generates the HTML for a feedback added notification email.
 * @param participantName - The participant's name.
 * @param hostName - The host's name.
 * @param sessionTitle - The session title.
 * @param sessionId - The session ID.
 * @param score - Optional score.
 */
export const getFeedbackAddedEmailHtml = (
  participantName: string,
  hostName: string,
  sessionTitle: string,
  sessionId: string,
  score?: number
): string => {
  const subject = `You received feedback for "${sessionTitle}"`;
  const viewUrl = `${Config.FRONTEND_URL}/sessions/${sessionId}`;

  const scoreText =
    score !== undefined
      ? `<p style="margin: 16px 0;">
         <strong>Score:</strong> ${score}/100
       </p>`
      : '';

  const content = `
    <p>Hello ${participantName},</p>

    <p>
      <strong>${hostName}</strong> has provided feedback for your performance in <strong>"${sessionTitle}"</strong>.
    </p>

    ${scoreText}

    <p style="text-align: center; margin: 24px 0;">
      <a href="${viewUrl}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #2F80ED;
        color: #FFFFFF;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 500;
      ">
        View Feedback
      </a>
    </p>

    <p style="
      font-size: 12px;
      color: #6B7280;
      margin-top: 24px;
    ">
      Or copy this link: ${viewUrl}
    </p>
  `;

  return htmlTemplate(subject, content);
};

/**
 * Generates the HTML for a session update notification email (cancellation or rescheduling).
 * @param userName - The user's name.
 * @param hostName - The host's name.
 * @param sessionTitle - The session title.
 * @param updateType - Type of update: 'cancelled' or 'rescheduled'.
 * @param oldScheduledFor - Original scheduled date/time (for rescheduling).
 * @param newScheduledFor - New scheduled date/time (for rescheduling).
 * @param reason - Optional cancellation reason.
 */
export const getSessionUpdateEmailHtml = (
  userName: string,
  hostName: string,
  sessionTitle: string,
  updateType: 'cancelled' | 'rescheduled',
  oldScheduledFor?: Date,
  newScheduledFor?: Date,
  reason?: string
): string => {
  const isCancellation = updateType === 'cancelled';
  const subject = isCancellation
    ? `Session cancelled: "${sessionTitle}"`
    : `Session rescheduled: "${sessionTitle}"`;

  const formatDate = (date: Date) =>
    date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });

  let scheduleInfo = '';
  if (isCancellation && oldScheduledFor) {
    scheduleInfo = `<p style="margin: 16px 0;">
         <strong>Was scheduled for:</strong> ${formatDate(oldScheduledFor)}
       </p>`;
  } else if (!isCancellation && oldScheduledFor && newScheduledFor) {
    scheduleInfo = `
      <div style="margin: 16px 0;">
        <p style="margin: 8px 0;">
          <strong>Previous time:</strong>
          <span style="text-decoration: line-through; color: #DC2626;">
            ${formatDate(oldScheduledFor)}
          </span>
        </p>
        <p style="margin: 8px 0;">
          <strong>New time:</strong>
          <span style="color: #16A34A; font-weight: 600;">
            ${formatDate(newScheduledFor)}
          </span>
        </p>
      </div>
    `;
  }

  const reasonText =
    reason && isCancellation
      ? `<p style="
         margin: 16px 0;
         padding: 12px;
         background-color: #F5F5F5;
         border-left: 4px solid #6B7280;
       ">
         <strong>Reason:</strong> ${reason}
       </p>`
      : '';

  const message = isCancellation
    ? `The session <strong>"${sessionTitle}"</strong> has been cancelled by <strong>${hostName}</strong>.`
    : `The session <strong>"${sessionTitle}"</strong> has been rescheduled by <strong>${hostName}</strong>.`;

  const closingMessage = isCancellation
    ? `<p>We're sorry for the inconvenience.</p>`
    : `<p>Please make a note of the new time. We apologize for any inconvenience.</p>`;

  const content = `
    <p>Hello ${userName},</p>

    <p>${message}</p>

    ${scheduleInfo}

    ${reasonText}

    ${closingMessage}
  `;

  return htmlTemplate(subject, content);
};

/**
 * Generates the HTML for a daily session reminder email.
 * @param userName - The user's name.
 * @param sessions - Array of sessions scheduled today.
 * @param isHost - Whether the recipient is the host.
 */
export const getDailySessionReminderEmailHtml = (
  userName: string,
  sessions: Array<{
    title: string;
    id: string;
    scheduledFor: Date;
    participantCount: number;
  }>,
  isHost: boolean
): string => {
  const subject = `You have ${sessions.length} session${sessions.length > 1 ? 's' : ''} scheduled today`;

  const sessionsList = sessions
    .map(
      (session) => `
    <div style="
      margin: 16px 0;
      padding: 16px;
      background-color: #F5F7FA;
      border-left: 4px solid #2F80ED;
    ">
      <p style="margin: 0 0 8px 0; font-weight: 600;">
        ${session.title}
      </p>
      <p style="margin: 0; font-size: 13px; color: #6B7280;">
        ${session.scheduledFor.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        })}
        ${isHost ? ` • ${session.participantCount} participant${session.participantCount !== 1 ? 's' : ''}` : ''}
      </p>
      <p style="margin: 8px 0 0 0;">
        <a href="${Config.FRONTEND_URL}/sessions/${session.id}" style="
          color: #2F80ED;
          text-decoration: none;
          font-size: 13px;
        ">
          View Session →
        </a>
      </p>
    </div>
  `
    )
    .join('');

  const roleMessage = isHost
    ? `<p>Here are the sessions you're hosting today:</p>`
    : `<p>Here are the sessions you're participating in today:</p>`;

  const content = `
    <p>Hello ${userName},</p>

    ${roleMessage}

    ${sessionsList}

    <p style="margin-top: 24px;">
      Good luck!
    </p>
  `;

  return htmlTemplate(subject, content);
};
