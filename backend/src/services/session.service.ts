import { inngest } from '../config/inngest';
import SessionModel, {
  ISession,
  SessionStatus,
  SessionVisibility,
} from '../models/session.model';
import ApiError from '../utils/apiError';
import logger from '../utils/logger';
import * as problemService from './problem.service';
import * as streamService from './stream.service';

interface CreateSessionData {
  title: string;
  description?: string;
  visibility: SessionVisibility;
  passcode?: string;
  maxParticipants: number;
  problems: string[];
  recordingEnabled: boolean;
  scheduledFor?: Date;
}

interface UpdateSessionData {
  title?: string;
  description?: string;
  visibility?: SessionVisibility;
  passcode?: string;
  maxParticipants?: number;
  problems?: string[];
  recordingEnabled?: boolean;
  scheduledFor?: Date;
}

/**
 * Create a new session.
 * @param sessionData - Session details including title, description, visibility, passcode, maxParticipants, problems, recordingEnabled, and scheduledFor
 * @param hostId - ID of the host user
 * @param hostStreamUserId - Stream user ID of the host
 * @returns The created session object
 */
export const createSession = async (
  sessionData: CreateSessionData,
  hostId: string,
  hostStreamUserId: string
): Promise<ISession> => {
  // Generate unique IDs for Stream
  const timestamp = Date.now();
  const randomId = crypto.randomUUID().slice(0, 8);
  const streamCallId = `session_${timestamp}_${randomId}`;
  const streamChannelId = streamCallId;

  // Validate and prepare problems array
  const problems = ['default-blank-problem', ...sessionData.problems];

  // Validate that all problems exist and user has access
  for (const problemId of sessionData.problems) {
    try {
      await problemService.getProblemById(problemId, hostId);
    } catch (error) {
      throw new ApiError(400, `Invalid problem ID: ${problemId}`);
    }
  }

  // Increment usage count for all problems (except default)
  for (const problemId of sessionData.problems) {
    await problemService.incrementUsageCount(problemId);
  }

  // Determine initial status
  const status =
    sessionData.scheduledFor && new Date(sessionData.scheduledFor) > new Date()
      ? SessionStatus.SCHEDULED
      : SessionStatus.WAITING;

  // Create Stream call
  await streamService.createStreamCall(streamCallId, hostStreamUserId, {
    sessionId: '', // Will be set after session is created
    title: sessionData.title,
    recordingEnabled: sessionData.recordingEnabled,
  });

  // Create Stream channel
  await streamService.createStreamChannel(
    streamChannelId,
    sessionData.title,
    hostStreamUserId,
    [hostStreamUserId]
  );

  // Create session
  const session = await SessionModel.create({
    title: sessionData.title,
    description: sessionData.description,
    visibility: sessionData.visibility,
    passcode: sessionData.passcode,
    hostId,
    maxParticipants: sessionData.maxParticipants,
    problems,
    currentProblemIndex: 0,
    streamCallId,
    streamChannelId,
    recordingEnabled: sessionData.recordingEnabled,
    status,
    scheduledFor: sessionData.scheduledFor,
    participants: [],
    chatLogs: [],
  });

  // Emit event
  try {
    await inngest.send({
      name: 'colloquy/session.created',
      data: {
        sessionId: session.id,
        title: session.title,
        hostId,
        visibility: session.visibility,
        status: session.status,
      },
    });
    logger.info(`[Inngest] Event sent for session creation: ${session.id}`);
  } catch (error) {
    logger.error(`[Inngest] Failed to send session creation event: ${error}`);
  }

  return session;
};

/**
 * Get session by ID.
 * @param sessionId - ID of the session
 * @param userId - ID of the user
 * @returns The session object
 */
export const getSessionById = async (
  sessionId: string,
  userId: string
): Promise<ISession> => {
  const session = await SessionModel.findOne({ id: sessionId })
    .populate({
      model: 'User',
      path: 'hostId',
      foreignField: 'id',
      select: 'id name email',
    })
    .populate({
      model: 'User',
      path: 'participants.userId',
      foreignField: 'id',
      select: 'id name email',
    })
    .exec();

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Check access permissions
  const isHost =
    session.hostId === userId || (session.hostId as any).id === userId;
  const isParticipant = session.participants.some(
    (p) => p.userId === userId || (p.userId as any).id === userId
  );

  if (!isHost && !isParticipant) {
    // If user is neither host nor participant
    if (session.visibility === SessionVisibility.PRIVATE) {
      throw new ApiError(404, 'Session not found');
    }
    // For public sessions, return limited data
    return {
      id: session.id,
      title: session.title,
      description: session.description,
      visibility: session.visibility,
      hostId: session.hostId,
      status: session.status,
      maxParticipants: session.maxParticipants,
      participants: session.participants.map((p) => ({
        userId: p.userId,
        joinedAt: p.joinedAt,
      })) as any,
      scheduledFor: session.scheduledFor,
    } as ISession;
  }

  return session;
};

/**
 * Update session.
 * @param sessionId - ID of the session to update
 * @param hostId - ID of the host user
 * @param updateData - Updated session details including title, description, visibility, passcode, maxParticipants, problems, recordingEnabled, and scheduledFor
 * @returns The updated session object
 */
export const updateSession = async (
  sessionId: string,
  hostId: string,
  updateData: UpdateSessionData
): Promise<ISession> => {
  const session = await SessionModel.findOne({ id: sessionId });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Verify ownership
  if (session.hostId !== hostId) {
    throw new ApiError(403, 'Only the host can update the session');
  }

  // Verify session is not active or completed
  if (
    session.status === SessionStatus.ACTIVE ||
    session.status === SessionStatus.COMPLETED
  ) {
    throw new ApiError(400, 'Cannot update an active or completed session');
  }

  // Validate maxParticipants if updated
  if (
    updateData.maxParticipants &&
    updateData.maxParticipants < session.participants.length
  ) {
    throw new ApiError(
      400,
      `Cannot reduce max participants below current participant count (${session.participants.length})`
    );
  }

  // If updating problems, validate them
  if (updateData.problems) {
    const problems = ['default-blank-problem', ...updateData.problems];

    for (const problemId of updateData.problems) {
      try {
        await problemService.getProblemById(problemId, hostId);
      } catch (error) {
        throw new ApiError(400, `Invalid problem ID: ${problemId}`);
      }
    }

    // Increment usage count for new problems
    for (const problemId of updateData.problems) {
      if (!session.problems.includes(problemId)) {
        await problemService.incrementUsageCount(problemId);
      }
    }

    updateData.problems = problems;
  }

  // Apply updates
  Object.assign(session, updateData);
  await session.save();

  return session;
};

/**
 * Delete session (soft delete).
 * @param sessionId - ID of the session to delete
 * @param hostId - ID of the host user
 * @returns void
 */
export const deleteSession = async (
  sessionId: string,
  hostId: string
): Promise<void> => {
  const session = await SessionModel.findOne({ id: sessionId });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Verify ownership
  if (session.hostId !== hostId) {
    throw new ApiError(403, 'Only the host can delete the session');
  }

  // Cannot delete active sessions
  if (session.status === SessionStatus.ACTIVE) {
    throw new ApiError(
      400,
      'Cannot delete an active session. Please end it first.'
    );
  }

  // Soft delete
  await session.delete();

  logger.info(
    `[Session] Deleted: ${session.title} (${session.id}) by ${hostId}`
  );
};

/**
 * Get all sessions (with filters).
 * @param filters - Filter options including visibility and status
 * @returns Array of session objects
 */
export const getAllSessions = async (filters: {
  visibility?: SessionVisibility;
  status?: SessionStatus;
}): Promise<ISession[]> => {
  const query: any = {
    visibility: SessionVisibility.PUBLIC,
    status: { $in: [SessionStatus.WAITING, SessionStatus.SCHEDULED] },
  };

  if (filters.visibility) {
    query.visibility = filters.visibility;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  const sessions = await SessionModel.find(query)
    .populate({
      model: 'User',
      path: 'hostId',
      foreignField: 'id',
      select: 'id name email',
    })
    .sort({ scheduledFor: 1, createdAt: -1 })
    .limit(50)
    .exec();

  return sessions;
};

/**
 * Get sessions hosted by user.
 * @param hostId - ID of the host user
 * @param filters - Filter options including status
 * @returns Array of session objects
 */
export const getMyHostedSessions = async (
  hostId: string,
  filters: { status?: SessionStatus }
): Promise<ISession[]> => {
  const query: any = { hostId };

  if (filters.status) {
    query.status = filters.status;
  }

  const sessions = await SessionModel.find(query)
    .populate({
      model: 'User',
      path: 'participants.userId',
      select: 'id name email',
      foreignField: 'id',
    })
    .sort({ createdAt: -1 })
    .exec();

  return sessions;
};

/**
 * Get sessions where user is a participant.
 * @param userId - ID of the user
 * @returns Array of session objects
 */
export const getMyParticipatedSessions = async (
  userId: string
): Promise<ISession[]> => {
  const sessions = await SessionModel.find({
    'participants.userId': userId,
  })
    .populate('hostId', 'id name email')
    .sort({ createdAt: -1 })
    .exec();

  return sessions;
};
