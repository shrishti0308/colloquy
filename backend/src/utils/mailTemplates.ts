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
