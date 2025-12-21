import { inngest } from '../config/inngest';
import UserModel from '../models/user.model';
import logger from '../utils/logger';
import {
  sendLoginAlertEmail as sendLoginAlertEmailHelper,
  sendPasswordResetConfirmationEmail as sendPasswordResetConfirmationEmailHelper,
  sendPasswordResetEmail as sendPasswordResetEmailHelper,
  sendWelcomeEmail as sendWelcomeEmailHelper,
} from './mail.service';
import { deleteStreamUser, upsertStreamUser } from './stream.service';

/**
 * Sync user to Stream when created
 */
const syncUserToStream = inngest.createFunction(
  { id: 'sync-user-to-stream' },
  { event: 'colloquy/user.created' },
  async ({ event }) => {
    try {
      const { userId, name, role } = event.data;

      logger.info(`[Inngest] Syncing user ${userId} to Stream`);

      await upsertStreamUser({
        id: userId,
        name: name,
      });

      logger.info(`[Inngest] User ${userId} synced to Stream successfully`);
    } catch (error) {
      logger.error(`[Inngest] Error syncing user to Stream: ${error}`);
      throw error; // Inngest will retry
    }
  }
);

/**
 * Remove user from Stream when soft-deleted
 */
const removeUserFromStream = inngest.createFunction(
  { id: 'remove-user-from-stream' },
  { event: 'colloquy/user.deleted' },
  async ({ event }) => {
    try {
      const { userId, name } = event.data;

      logger.info(
        `[Inngest] Removing user ${userId} from Stream (soft delete)`
      );

      await deleteStreamUser(userId);

      logger.info(`[Inngest] User ${userId} removed from Stream successfully`);
    } catch (error) {
      logger.error(`[Inngest] Error removing user from Stream: ${error}`);
      throw error; // Inngest will retry
    }
  }
);

/**
 * Restore user to Stream when restored
 */
const restoreUserToStream = inngest.createFunction(
  { id: 'restore-user-to-stream' },
  { event: 'colloquy/user.restored' },
  async ({ event }) => {
    try {
      const { userId, name, role } = event.data;

      logger.info(`[Inngest] Restoring user ${userId} to Stream`);

      await upsertStreamUser({
        id: userId,
        name: name,
      });

      logger.info(`[Inngest] User ${userId} restored to Stream successfully`);
    } catch (error) {
      logger.error(`[Inngest] Error restoring user to Stream: ${error}`);
      throw error; // Inngest will retry
    }
  }
);

/**
 * Update user in Stream when profile is updated
 */
const updateUserInStream = inngest.createFunction(
  { id: 'update-user-in-stream' },
  { event: 'colloquy/user.updated' },
  async ({ event }) => {
    try {
      const { userId, name, role } = event.data;

      logger.info(`[Inngest] Updating user ${userId} in Stream`);

      await upsertStreamUser({
        id: userId,
        name: name,
      });

      logger.info(`[Inngest] User ${userId} updated in Stream successfully`);
    } catch (error) {
      logger.error(`[Inngest] Error updating user in Stream: ${error}`);
      throw error; // Inngest will retry
    }
  }
);

/**
 * Send welcome email when user registers
 */
const sendWelcomeEmail = inngest.createFunction(
  {
    id: 'send-welcome-email',
    retries: 3, // Retry up to 3 times on failure
  },
  { event: 'colloquy/email.welcome' },
  async ({ event }) => {
    try {
      const { email, name } = event.data;

      logger.info(`[Inngest] Sending welcome email to ${email}`);

      await sendWelcomeEmailHelper(email, name);

      logger.info(`[Inngest] Welcome email sent successfully to ${email}`);
    } catch (error) {
      logger.error(`[Inngest] Error sending welcome email: ${error}`);
      throw error; // Inngest will retry
    }
  }
);

/**
 * Send login alert email
 */
const sendLoginAlertEmail = inngest.createFunction(
  {
    id: 'send-login-alert',
    retries: 3,
  },
  { event: 'colloquy/email.login_alert' },
  async ({ event }) => {
    try {
      const { email, ip, userAgent } = event.data;

      logger.info(`[Inngest] Sending login alert to ${email}`);

      await sendLoginAlertEmailHelper(email, ip, userAgent);

      logger.info(`[Inngest] Login alert sent successfully to ${email}`);
    } catch (error) {
      logger.error(`[Inngest] Error sending login alert: ${error}`);
      throw error; // Inngest will retry
    }
  }
);

/**
 * Send password reset email
 */
const sendPasswordResetEmail = inngest.createFunction(
  {
    id: 'send-password-reset',
    retries: 3,
  },
  { event: 'colloquy/email.password_reset' },
  async ({ event }) => {
    try {
      const { email, token } = event.data;

      logger.info(`[Inngest] Sending password reset email to ${email}`);

      await sendPasswordResetEmailHelper(email, token);

      logger.info(
        `[Inngest] Password reset email sent successfully to ${email}`
      );
    } catch (error) {
      logger.error(`[Inngest] Error sending password reset email: ${error}`);
      throw error; // Inngest will retry
    }
  }
);

/**
 * Send password reset confirmation email
 */
const sendPasswordResetConfirmationEmail = inngest.createFunction(
  {
    id: 'send-password-reset-confirmation',
    retries: 3,
  },
  { event: 'colloquy/email.password_reset_confirmation' },
  async ({ event }) => {
    try {
      const { email } = event.data;

      logger.info(
        `[Inngest] Sending password reset confirmation email to ${email}`
      );

      await sendPasswordResetConfirmationEmailHelper(email);

      logger.info(
        `[Inngest] Password reset confirmation email sent successfully to ${email}`
      );
    } catch (error) {
      logger.error(
        `[Inngest] Error sending password reset confirmation email: ${error}`
      );
      throw error; // Inngest will retry
    }
  }
);

/**
 * Handle problem creation event
 */
const handleProblemCreated = inngest.createFunction(
  {
    id: 'handle-problem-created',
    retries: 3,
  },
  { event: 'colloquy/problem.created' },
  async ({ event }) => {
    try {
      const { problemId, title, createdBy, visibility } = event.data;

      logger.info(`[Inngest] Handling problem creation: ${problemId}`);

      // TODO: Implement problem creation handling logic

      logger.info(
        `[Inngest] Problem ${problemId} creation handled successfully`
      );
    } catch (error) {
      logger.error(`[Inngest] Error handling problem creation: ${error}`);
      throw error; // Inngest will retry
    }
  }
);

/**
 * Handle problem deletion event
 */
const handleProblemDeleted = inngest.createFunction(
  {
    id: 'handle-problem-deleted',
    retries: 3,
  },
  { event: 'colloquy/problem.deleted' },
  async ({ event }) => {
    try {
      const { problemId, title, deletedBy } = event.data;

      logger.info(`[Inngest] Handling problem deletion: ${problemId}`);

      // TODO: Implement problem deletion handling logic

      logger.info(
        `[Inngest] Problem ${problemId} deletion handled successfully`
      );
    } catch (error) {
      logger.error(`[Inngest] Error handling problem deletion: ${error}`);
      throw error; // Inngest will retry
    }
  }
);

/**
 * Clean up expired password reset tokens (runs daily)
 */
const cleanupExpiredTokens = inngest.createFunction(
  {
    id: 'cleanup-expired-tokens',
  },
  { cron: '0 0 * * *' }, // Run every day at midnight
  async () => {
    try {
      logger.info(
        '[Inngest] Starting cleanup of expired password reset tokens'
      );

      const result = await UserModel.updateMany(
        {
          passwordResetExpires: { $lt: new Date() },
          passwordResetToken: { $exists: true },
        },
        {
          $unset: {
            passwordResetToken: 1,
            passwordResetExpires: 1,
          },
        }
      );

      logger.info(
        `[Inngest] Cleaned up ${result.modifiedCount} expired password reset tokens`
      );
    } catch (error) {
      logger.error(`[Inngest] Error cleaning up expired tokens: ${error}`);
      throw error;
    }
  }
);

export const inngestFunctions = [
  syncUserToStream,
  removeUserFromStream,
  restoreUserToStream,
  updateUserInStream,
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendPasswordResetEmail,
  sendPasswordResetConfirmationEmail,
  handleProblemCreated,
  handleProblemDeleted,
  cleanupExpiredTokens,
];
