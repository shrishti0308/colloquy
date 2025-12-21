import { inngest } from '../config/inngest';
import SessionModel, { SessionStatus } from '../models/session.model';
import UserModel from '../models/user.model';
import logger from '../utils/logger';
import {
  sendDailySessionReminderEmail as sendDailySessionReminderEmailHelper,
  sendFeedbackAddedEmail as sendFeedbackAddedEmailHelper,
  sendLoginAlertEmail as sendLoginAlertEmailHelper,
  sendPasswordResetConfirmationEmail as sendPasswordResetConfirmationEmailHelper,
  sendPasswordResetEmail as sendPasswordResetEmailHelper,
  sendProblemCreatedEmail as sendProblemCreatedEmailHelper,
  sendProblemDeletedEmail as sendProblemDeletedEmailHelper,
  sendSessionEndedEmail as sendSessionEndedEmailHelper,
  sendSessionInvitationEmail as sendSessionInvitationEmailHelper,
  sendSessionStartedEmail as sendSessionStartedEmailHelper,
  sendSessionUpdateEmail as sendSessionUpdateEmailHelper,
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
      const { problemId, title, createdBy, visibility, userEmail, userName } =
        event.data;

      if (!userEmail || !userName) {
        logger.warn(
          `[Inngest] Skipping problem created email - missing user details for problem ${problemId}`
        );
        return;
      }

      logger.info(
        `[Inngest] Sending problem created notification to ${userEmail}`
      );

      await sendProblemCreatedEmailHelper(
        userEmail,
        userName,
        title,
        problemId,
        visibility
      );
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
      const { problemId, title, deletedBy, userEmail, userName } = event.data;

      if (!userEmail || !userName) {
        logger.warn(
          `[Inngest] Skipping problem deleted email - missing user details for problem ${problemId}`
        );
        return;
      }

      logger.info(
        `[Inngest] Sending problem deleted notification to ${userEmail}`
      );

      await sendProblemDeletedEmailHelper(
        userEmail,
        userName,
        title,
        problemId
      );

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
 * Send session invitation email (all data from event)
 */
const handleSessionInvitation = inngest.createFunction(
  {
    id: 'send-session-invitation',
    retries: 3,
  },
  { event: 'colloquy/session.participant-invited' },
  async ({ event }) => {
    try {
      const {
        sessionId,
        sessionTitle,
        scheduledFor,
        userId,
        userEmail,
        userName,
        hostName,
        requiresPasscode,
      } = event.data;

      logger.info(
        `[Inngest] Sending session invitation to ${userEmail} for session ${sessionId}`
      );

      await sendSessionInvitationEmailHelper(
        userEmail,
        userName,
        hostName,
        sessionTitle,
        sessionId,
        scheduledFor,
        requiresPasscode
      );

      logger.info(
        `[Inngest] Session invitation sent successfully to ${userEmail}`
      );
    } catch (error) {
      logger.error(`[Inngest] Error sending session invitation: ${error}`);
      throw error;
    }
  }
);

/**
 * Send session started notification (optimized DB query)
 */
const handleSessionStarted = inngest.createFunction(
  {
    id: 'send-session-started',
    retries: 3,
  },
  { event: 'colloquy/session.started' },
  async ({ event }) => {
    try {
      const { sessionId, sessionTitle, participantIds } = event.data;

      logger.info(
        `[Inngest] Handling session started event for session ${sessionId}`
      );

      if (participantIds.length === 0) {
        logger.info(
          `[Inngest] No participants to notify for session ${sessionId}`
        );
        return;
      }

      // Optimized: Fetch only users, not session + populate
      const users = await UserModel.find({
        id: { $in: participantIds },
      })
        .select('id name email')
        .lean();

      // Send emails to all participants
      const emailPromises = users.map((user) =>
        sendSessionStartedEmailHelper(
          user.email,
          user.name,
          sessionTitle,
          sessionId
        )
      );

      await Promise.all(emailPromises);

      logger.info(
        `[Inngest] Session started notifications sent for session ${sessionId} (${emailPromises.length} emails)`
      );
    } catch (error) {
      logger.error(`[Inngest] Error sending session started emails: ${error}`);
      throw error;
    }
  }
);

/**
 * Send session ended notification (optimized DB query)
 */
const handleSessionEnded = inngest.createFunction(
  {
    id: 'send-session-ended',
    retries: 3,
  },
  { event: 'colloquy/session.ended' },
  async ({ event }) => {
    try {
      const { sessionId, sessionTitle, duration, hostId, participantIds } =
        event.data;

      logger.info(
        `[Inngest] Sending session ended notifications for session ${sessionId}`
      );

      // Optimized: Fetch only users (host + participants)
      const allUserIds = [hostId, ...participantIds];
      const users = await UserModel.find({
        id: { $in: allUserIds },
      })
        .select('id name email')
        .lean();

      const emailPromises = users.map((user) => {
        const isHost = user.id === hostId;
        return sendSessionEndedEmailHelper(
          user.email,
          user.name,
          sessionTitle,
          sessionId,
          duration,
          isHost
        );
      });

      await Promise.all(emailPromises);

      logger.info(
        `[Inngest] Session ended notifications sent for session ${sessionId} (${emailPromises.length} emails)`
      );
    } catch (error) {
      logger.error(`[Inngest] Error sending session ended emails: ${error}`);
      throw error;
    }
  }
);

/**
 * Send feedback added notification (all data from event)
 */
const handleFeedbackAdded = inngest.createFunction(
  {
    id: 'send-feedback-added',
    retries: 3,
  },
  { event: 'colloquy/session.feedback-added' },
  async ({ event }) => {
    try {
      const {
        sessionId,
        sessionTitle,
        participantEmail,
        participantName,
        hostName,
        score,
      } = event.data;

      logger.info(
        `[Inngest] Sending feedback notification to ${participantEmail} for session ${sessionId}`
      );

      await sendFeedbackAddedEmailHelper(
        participantEmail,
        participantName,
        hostName,
        sessionTitle,
        sessionId,
        score
      );

      logger.info(
        `[Inngest] Feedback notification sent successfully to ${participantEmail}`
      );
    } catch (error) {
      logger.error(`[Inngest] Error sending feedback notification: ${error}`);
      throw error;
    }
  }
);

/**
 * Send session cancelled notification
 */
const handleSessionCancelled = inngest.createFunction(
  {
    id: 'send-session-cancelled',
    retries: 3,
  },
  { event: 'colloquy/session.cancelled' },
  async ({ event }) => {
    try {
      const {
        sessionId,
        sessionTitle,
        scheduledFor,
        hostId,
        hostName,
        participantIds,
        reason,
      } = event.data;

      logger.info(
        `[Inngest] Sending session cancelled notifications for session ${sessionId}`
      );

      if (participantIds.length === 0) {
        logger.info(
          `[Inngest] No participants to notify for session ${sessionId}`
        );
        return;
      }

      const users = await UserModel.find({
        id: { $in: participantIds },
      })
        .select('id name email')
        .lean();

      const emailPromises = users.map((user) =>
        sendSessionUpdateEmailHelper(
          user.email,
          user.name,
          hostName,
          sessionTitle,
          'cancelled',
          scheduledFor,
          undefined,
          reason
        )
      );

      await Promise.all(emailPromises);

      logger.info(
        `[Inngest] Session cancelled notifications sent for session ${sessionId} (${emailPromises.length} emails)`
      );
    } catch (error) {
      logger.error(
        `[Inngest] Error sending session cancelled emails: ${error}`
      );
      throw error;
    }
  }
);

/**
 * Send session rescheduled notification
 */
const handleSessionRescheduled = inngest.createFunction(
  {
    id: 'send-session-rescheduled',
    retries: 3,
  },
  { event: 'colloquy/session.rescheduled' },
  async ({ event }) => {
    try {
      const {
        sessionId,
        sessionTitle,
        oldScheduledFor,
        newScheduledFor,
        hostId,
        hostName,
        participantIds,
      } = event.data;

      logger.info(
        `[Inngest] Sending session rescheduled notifications for session ${sessionId}`
      );

      if (participantIds.length === 0) {
        logger.info(
          `[Inngest] No participants to notify for session ${sessionId}`
        );
        return;
      }

      const users = await UserModel.find({
        id: { $in: participantIds },
      })
        .select('id name email')
        .lean();

      const emailPromises = users.map((user) =>
        sendSessionUpdateEmailHelper(
          user.email,
          user.name,
          hostName,
          sessionTitle,
          'rescheduled',
          oldScheduledFor,
          newScheduledFor
        )
      );

      await Promise.all(emailPromises);

      logger.info(
        `[Inngest] Session rescheduled notifications sent for session ${sessionId} (${emailPromises.length} emails)`
      );
    } catch (error) {
      logger.error(
        `[Inngest] Error sending session rescheduled emails: ${error}`
      );
      throw error;
    }
  }
);

/**
 * Send daily session reminders
 */
const sendDailySessionReminders = inngest.createFunction(
  {
    id: 'send-daily-session-reminders',
  },
  { cron: '0 0 * * *' },
  async () => {
    try {
      logger.info('[Inngest] Starting daily session reminder job');

      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Find all sessions scheduled for today
      const sessions = await SessionModel.find({
        scheduledFor: {
          $gte: today,
          $lt: tomorrow,
        },
        status: { $in: [SessionStatus.WAITING, SessionStatus.SCHEDULED] },
      })
        .select('id title scheduledFor hostId participants')
        .populate({
          model: 'User',
          path: 'hostId',
          select: 'id name email',
          foreignField: 'id',
        })
        .populate({
          model: 'User',
          path: 'participants.userId',
          select: 'id name email',
          foreignField: 'id',
        })
        .lean();

      if (sessions.length === 0) {
        logger.info('[Inngest] No sessions scheduled for today');
        return;
      }

      logger.info(
        `[Inngest] Found ${sessions.length} sessions scheduled for today`
      );

      // Group sessions by host
      const hostSessions = new Map<
        string,
        { email: string; name: string; sessions: any[] }
      >();

      sessions.forEach((session: any) => {
        const host = session.hostId;
        if (!hostSessions.has(host.id)) {
          hostSessions.set(host.id, {
            email: host.email,
            name: host.name,
            sessions: [],
          });
        }
        hostSessions.get(host.id)!.sessions.push({
          title: session.title,
          id: session.id,
          scheduledFor: new Date(session.scheduledFor),
          participantCount: session.participants.filter(
            (p: any) =>
              (p.joinedAt || p.invitationStatus === 'accepted') && !p.leftAt
          ).length,
        });
      });

      // Send reminders to hosts
      const hostEmailPromises = Array.from(hostSessions.values()).map(
        (hostData) =>
          sendDailySessionReminderEmailHelper(
            hostData.email,
            hostData.name,
            hostData.sessions,
            true // isHost
          )
      );

      // Group sessions by participant
      const participantSessions = new Map<
        string,
        { email: string; name: string; sessions: any[] }
      >();

      sessions.forEach((session: any) => {
        session.participants
          .filter(
            (p: any) =>
              (p.invitationStatus === 'accepted' || p.joinedAt) && !p.leftAt
          )
          .forEach((p: any) => {
            const user = p.userId;
            if (!participantSessions.has(user.id)) {
              participantSessions.set(user.id, {
                email: user.email,
                name: user.name,
                sessions: [],
              });
            }
            participantSessions.get(user.id)!.sessions.push({
              title: session.title,
              id: session.id,
              scheduledFor: new Date(session.scheduledFor),
              participantCount: 0, // Not shown to participants
            });
          });
      });

      // Send reminders to participants
      const participantEmailPromises = Array.from(
        participantSessions.values()
      ).map((participantData) =>
        sendDailySessionReminderEmailHelper(
          participantData.email,
          participantData.name,
          participantData.sessions,
          false // isHost
        )
      );

      await Promise.all([...hostEmailPromises, ...participantEmailPromises]);

      logger.info(
        `[Inngest] Daily session reminders sent: ${hostEmailPromises.length} hosts, ${participantEmailPromises.length} participants`
      );
    } catch (error) {
      logger.error(`[Inngest] Error sending daily session reminders: ${error}`);
      throw error;
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
  handleSessionInvitation,
  handleSessionStarted,
  handleSessionEnded,
  handleFeedbackAdded,
  handleSessionCancelled,
  handleSessionRescheduled,
  sendDailySessionReminders,
];
