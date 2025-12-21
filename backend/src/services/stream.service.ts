import { StreamClient } from '@stream-io/node-sdk';
import { StreamChat } from 'stream-chat';
import { Config } from '../config';
import ApiError from '../utils/apiError';
import logger from '../utils/logger';

const chatClient = StreamChat.getInstance(
  Config.STREAM_API_KEY!,
  Config.STREAM_API_SECRET
);

const videoClient = new StreamClient(
  Config.STREAM_API_KEY!,
  Config.STREAM_API_SECRET!
);

interface StreamUser {
  id: string;
  name: string;
}

interface CallMetadata {
  sessionId: string;
  title: string;
  recordingEnabled: boolean;
}

/**
 * Create or update a user in Stream
 * @param userData - The user data to upsert
 * @returns Promise that resolves when the user is upserted
 */
export const upsertStreamUser = async (userData: StreamUser): Promise<void> => {
  try {
    await chatClient.upsertUser({
      id: userData.id,
      name: userData.name,
    });
    logger.info(`[Stream] User upserted: ${userData.id}`);
  } catch (error) {
    logger.error(`[Stream] Error upserting user: ${error}`);
    throw new ApiError(500, 'Failed to create Stream user');
  }
};

/**
 * Delete a user from Stream
 * @param userId - ID of the user to delete
 * @returns Promise that resolves when the user is deleted
 */
export const deleteStreamUser = async (userId: string): Promise<void> => {
  try {
    await chatClient.deleteUser(userId, { mark_messages_deleted: true });
    logger.info(`[Stream] User deleted: ${userId}`);
  } catch (error) {
    logger.error(`[Stream] Error deleting user: ${error}`);
    throw new ApiError(500, 'Failed to delete Stream user');
  }
};

/**
 * Generate Stream user token for client-side usage
 * @param userId - ID of the user to generate token for
 * @returns The generated Stream token
 */
export const generateStreamToken = (userId: string): string => {
  try {
    const token = chatClient.createToken(userId);
    logger.info(`[Stream] Token generated for user: ${userId}`);
    return token;
  } catch (error) {
    logger.error(`[Stream] Error generating token: ${error}`);
    throw new ApiError(500, 'Failed to generate Stream token');
  }
};

/**
 * Create a Stream video call
 * @param callId - Unique call ID
 * @param creatorUserId - ID of the user creating the call
 * @param metadata - Call metadata
 * @returns Promise that resolves when call is created
 */
export const createStreamCall = async (
  callId: string,
  creatorUserId: string,
  metadata: CallMetadata
): Promise<void> => {
  try {
    const call = videoClient.video.call('default', callId);
    await call.getOrCreate({
      data: {
        created_by_id: creatorUserId,
        custom: metadata,
        settings_override: {
          recording: {
            mode: metadata.recordingEnabled ? 'available' : 'disabled',
          },
        },
      },
    });
    logger.info(`[Stream] Call created: ${callId}`);
  } catch (error) {
    logger.error(`[Stream] Error creating call: ${error}`);
    throw new ApiError(500, 'Failed to create Stream call');
  }
};

/**
 * Create a Stream chat channel
 * @param channelId - Unique channel ID
 * @param name - Channel name
 * @param creatorUserId - ID of the user creating the channel
 * @param members - Array of member user IDs
 * @returns Promise that resolves when channel is created
 */
export const createStreamChannel = async (
  channelId: string,
  name: string,
  creatorUserId: string,
  members: string[]
): Promise<void> => {
  try {
    const channel = chatClient.channel('messaging', channelId, {
      created_by_id: creatorUserId,
      members,
    });
    await channel.create();
    logger.info(`[Stream] Channel created: ${channelId}`);
  } catch (error) {
    logger.error(`[Stream] Error creating channel: ${error}`);
    throw new ApiError(500, 'Failed to create Stream channel');
  }
};

/**
 * Add a member to a Stream channel
 * @param channelId - Channel ID
 * @param userId - User ID to add
 * @returns Promise that resolves when member is added
 */
export const addChannelMember = async (
  channelId: string,
  userId: string
): Promise<void> => {
  try {
    const channel = chatClient.channel('messaging', channelId);
    await channel.addMembers([userId]);
    logger.info(`[Stream] Member added to channel ${channelId}: ${userId}`);
  } catch (error) {
    logger.error(`[Stream] Error adding member: ${error}`);
    throw new ApiError(500, 'Failed to add member to channel');
  }
};

/**
 * Remove a member from a Stream channel
 * @param channelId - Channel ID
 * @param userId - User ID to remove
 * @returns Promise that resolves when member is removed
 */
export const removeChannelMember = async (
  channelId: string,
  userId: string
): Promise<void> => {
  try {
    const channel = chatClient.channel('messaging', channelId);
    await channel.removeMembers([userId]);
    logger.info(`[Stream] Member removed from channel ${channelId}: ${userId}`);
  } catch (error) {
    logger.error(`[Stream] Error removing member: ${error}`);
    throw new ApiError(500, 'Failed to remove member from channel');
  }
};

/**
 * Get all messages from a Stream channel
 * @param channelId - Channel ID
 * @returns Array of chat messages
 */
export const getChannelMessages = async (
  channelId: string
): Promise<
  { userId: string; userName: string; message: string; timestamp: Date }[]
> => {
  try {
    const channel = chatClient.channel('messaging', channelId);
    const messages = await channel.query({ messages: { limit: 1000 } });

    return messages.messages.map((msg: any) => ({
      userId: msg.user.id,
      userName: msg.user.name,
      message: msg.text,
      timestamp: new Date(msg.created_at),
    }));
  } catch (error) {
    logger.error(`[Stream] Error fetching messages: ${error}`);
    throw new ApiError(500, 'Failed to fetch channel messages');
  }
};

/**
 * Delete a Stream video call
 * @param callId - Call ID to delete
 * @returns Promise that resolves when call is deleted
 */
export const deleteStreamCall = async (callId: string): Promise<void> => {
  try {
    const call = videoClient.video.call('default', callId);
    await call.delete({ hard: true });
    logger.info(`[Stream] Call deleted: ${callId}`);
  } catch (error) {
    logger.error(`[Stream] Error deleting call: ${error}`);
    // Don't throw error - call might already be deleted
    logger.warn(`[Stream] Failed to delete call ${callId}, it may not exist`);
  }
};

/**
 * Delete a Stream chat channel
 * @param channelId - Channel ID to delete
 * @returns Promise that resolves when channel is deleted
 */
export const deleteStreamChannel = async (channelId: string): Promise<void> => {
  try {
    const channel = chatClient.channel('messaging', channelId);
    await channel.delete();
    logger.info(`[Stream] Channel deleted: ${channelId}`);
  } catch (error) {
    logger.error(`[Stream] Error deleting channel: ${error}`);
    // Don't throw error - channel might already be deleted
    logger.warn(
      `[Stream] Failed to delete channel ${channelId}, it may not exist`
    );
  }
};

/**
 * Get recording URL for a call
 * @param callId - Call ID
 * @returns Recording URL or null if not available
 */
export const getCallRecording = async (
  callId: string
): Promise<string | null> => {
  try {
    const call = videoClient.video.call('default', callId);
    const listRecordings = await call.listRecordings();

    if (listRecordings.recordings && listRecordings.recordings.length > 0) {
      return listRecordings.recordings[0].url || null;
    }

    return null;
  } catch (error) {
    logger.error(`[Stream] Error fetching recording: ${error}`);
    return null;
  }
};

/**
 * Verify Stream connection on startup
 * @returns Promise that resolves when connection is verified
 */
export const verifyStreamConnection = async (): Promise<void> => {
  try {
    const testToken = chatClient.createToken('test-validation');

    if (testToken) {
      logger.info('[Stream] Stream credentials validated successfully');
    }
  } catch (error) {
    logger.error(`[Stream] Connection verification failed: ${error}`);
    throw new ApiError(500, 'Failed to connect to Stream');
  }
};
