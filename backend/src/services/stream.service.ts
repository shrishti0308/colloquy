import { StreamChat } from 'stream-chat';
import { Config } from '../config';
import logger from '../utils/logger';

const streamClient = StreamChat.getInstance(
  Config.STREAM_API_KEY!,
  Config.STREAM_API_SECRET
);

interface StreamUser {
  id: string;
  name: string;
  role?: string;
}

/**
 * Create or update a user in Stream
 * @param userData - The user data to upsert
 * @returns Promise that resolves when the user is upserted
 */
export const upsertStreamUser = async (userData: StreamUser): Promise<void> => {
  try {
    await streamClient.upsertUser({
      id: userData.id,
      name: userData.name,
      role: userData.role || 'user',
    });

    logger.info(`[Stream] User ${userData.id} upserted successfully`);
  } catch (error) {
    logger.error(`[Stream] Error upserting user: ${error}`);
    throw error;
  }
};

/**
 * Delete a user from Stream
 * @param userId - ID of the user to delete
 * @returns Promise that resolves when the user is deleted
 */
export const deleteStreamUser = async (userId: string): Promise<void> => {
  try {
    await streamClient.deleteUser(userId, {
      mark_messages_deleted: true,
      hard_delete: true,
    });

    logger.info(`[Stream] User ${userId} deleted successfully`);
  } catch (error) {
    logger.error(`[Stream] Error deleting user: ${error}`);
    throw error;
  }
};

/**
 * Generate Stream user token for client-side usage
 * @param userId - ID of the user to generate token for
 * @returns The generated Stream token
 */
export const generateStreamToken = (userId: string): string => {
  return streamClient.createToken(userId);
};

/**
 * Verify Stream connection on startup
 * @returns Promise that resolves when connection is verified
 */
export const verifyStreamConnection = async (): Promise<void> => {
  try {
    await streamClient.getAppSettings();
    logger.info('[Stream] Connection verified successfully');
  } catch (error) {
    logger.error(`[Stream] Connection failed: ${error}`);
    throw error;
  }
};
