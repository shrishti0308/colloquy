import { inngest } from '../config/inngest';
import { deleteStreamUser, upsertStreamUser } from './stream.service';
import logger from '../utils/logger';

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
        role: role,
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
        role: role,
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
        role: role,
      });

      logger.info(`[Inngest] User ${userId} updated in Stream successfully`);
    } catch (error) {
      logger.error(`[Inngest] Error updating user in Stream: ${error}`);
      throw error; // Inngest will retry
    }
  }
);

export const inngestFunctions = [
  syncUserToStream,
  removeUserFromStream,
  restoreUserToStream,
  updateUserInStream,
];
