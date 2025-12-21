import { inngest } from '../config/inngest';
import SessionModel, {
  InvitationStatus,
  ISession,
  SessionStatus,
  SessionVisibility,
} from '../models/session.model';
import ApiError from '../utils/apiError';
import logger from '../utils/logger';
import * as problemService from './problem.service';
import * as streamService from './stream.service';
import * as userService from './user.service';

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

  try {
    await streamService.deleteStreamCall(session.streamCallId);
    logger.info(`[Session] Cleaned up Stream call: ${session.streamCallId}`);
  } catch (error) {
    logger.error(`[Session] Failed to delete Stream call: ${error}`);
    // Don't throw - cleanup is best effort
  }

  try {
    await streamService.deleteStreamChannel(session.streamChannelId);
    logger.info(
      `[Session] Cleaned up Stream channel: ${session.streamChannelId}`
    );
  } catch (error) {
    logger.error(`[Session] Failed to delete Stream channel: ${error}`);
    // Don't throw - cleanup is best effort
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

  return sessions.map((session) => {
    const sessionObj = session.toJSON();

    const activeParticipantCount = session.participants.filter(
      (p) => p.joinedAt && !p.leftAt
    ).length;

    return {
      id: sessionObj.id,
      title: sessionObj.title,
      description: sessionObj.description,
      visibility: sessionObj.visibility,
      hostId: sessionObj.hostId,
      status: sessionObj.status,
      maxParticipants: sessionObj.maxParticipants,
      participantCount: activeParticipantCount,
      scheduledFor: sessionObj.scheduledFor,
      hasPasscode: session.visibility === SessionVisibility.PRIVATE,
    } as any;
  });
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
 * Get sessions where user is a participant (with privacy filters)
 * @param userId - ID of the user
 * @returns Array of session objects with filtered participant data
 */
export const getMyParticipatedSessions = async (
  userId: string
): Promise<ISession[]> => {
  const sessions = await SessionModel.find({
    'participants.userId': userId,
  })
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
    .sort({ createdAt: -1 })
    .exec();

  // Filter sensitive participant data
  return sessions.map((session) => {
    const sessionObj = session.toJSON();

    sessionObj.participants = sessionObj.participants.map((p: any) => {
      if (p.userId.id === userId || p.userId === userId) {
        return p;
      } else {
        return {
          userId: p.userId,
          joinedAt: p.joinedAt,
          leftAt: p.leftAt,
          invitedAt: p.invitedAt,
          invitationStatus: p.invitationStatus,
        };
      }
    });

    return sessionObj as any;
  });
};

/**
 * Join a session
 * @param sessionId - ID of the session to join
 * @param userId - ID of the user joining
 * @param passcode - Optional passcode for private sessions
 * @returns The updated session object with the new participant
 */
export const joinSession = async (
  sessionId: string,
  userId: string,
  passcode?: string
): Promise<ISession> => {
  const session = await SessionModel.findOne({ id: sessionId });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Check if session is joinable
  if (
    session.status !== SessionStatus.WAITING &&
    session.status !== SessionStatus.SCHEDULED &&
    session.status !== SessionStatus.ACTIVE // Allow late joiners
  ) {
    throw new ApiError(400, 'This session cannot be joined at this time');
  }

  // Verify passcode for private sessions
  if (session.visibility === SessionVisibility.PRIVATE) {
    if (!passcode) {
      throw new ApiError(401, 'Passcode is required for private sessions');
    }

    const isValidPasscode = await session.verifyPasscode(passcode);
    if (!isValidPasscode) {
      throw new ApiError(401, 'Invalid passcode');
    }
  }

  if (session.hostId === userId) {
    throw new ApiError(400, 'Host cannot join as a participant');
  }

  const existingParticipant = session.participants.find(
    (p) => p.userId === userId
  );

  const activeParticipants = session.participants.filter(
    (p) => p.joinedAt !== null && !p.leftAt
  ).length;

  if (existingParticipant) {
    // User is rejoining or accepting invitation
    if (existingParticipant.invitationStatus === InvitationStatus.PENDING) {
      // Accept invitation - check if session is full
      if (activeParticipants >= session.maxParticipants) {
        throw new ApiError(400, 'Session is full');
      }

      existingParticipant.invitationStatus = InvitationStatus.ACCEPTED;
      existingParticipant.joinedAt = new Date();
    } else if (existingParticipant.leftAt) {
      // Rejoining after leaving - check if session is full
      if (activeParticipants >= session.maxParticipants) {
        throw new ApiError(400, 'Session is full');
      }

      existingParticipant.leftAt = undefined;
      // Keep joinedAt as original join time
    } else {
      // Already in session
      throw new ApiError(400, 'You have already joined this session');
    }
  } else {
    // New participant (self-join) - check if session is full
    if (activeParticipants >= session.maxParticipants) {
      throw new ApiError(400, 'Session is full');
    }

    session.participants.push({
      userId,
      joinedAt: new Date(),
      submittedCode: [],
    });
  }

  // Add to Stream channel
  await streamService.addChannelMember(session.streamChannelId, userId);

  await session.save();

  logger.info(`[Session] User ${userId} joined session ${sessionId}`);

  // Emit event
  try {
    await inngest.send({
      name: 'colloquy/session.participant-joined',
      data: {
        sessionId: session.id,
        userId,
        hostId: session.hostId,
      },
    });
  } catch (error) {
    logger.error(`[Inngest] Failed to send participant-joined event: ${error}`);
  }

  return session;
};

/**
 * Leave a session
 * @param sessionId - ID of the session to leave
 * @param userId - ID of the user leaving
 * @returns Promise that resolves when user has left
 */
export const leaveSession = async (
  sessionId: string,
  userId: string
): Promise<void> => {
  const session = await SessionModel.findOne({ id: sessionId });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (session.hostId === userId) {
    throw new ApiError(
      400,
      'Host cannot leave. Please end the session instead.'
    );
  }

  const participant = session.participants.find((p) => p.userId === userId);

  if (!participant) {
    throw new ApiError(400, 'You are not a participant in this session');
  }

  if (participant.leftAt) {
    throw new ApiError(400, 'You have already left this session');
  }

  // Set leftAt timestamp
  participant.leftAt = new Date();

  // Remove from Stream channel
  await streamService.removeChannelMember(session.streamChannelId, userId);

  await session.save();

  logger.info(`[Session] User ${userId} left session ${sessionId}`);
};

/**
 * Invite participants by email
 * @param sessionId - ID of the session
 * @param hostId - ID of the host user
 * @param emails - Array of email addresses to invite
 * @returns Array of results indicating success/failure for each email
 */
export const inviteParticipants = async (
  sessionId: string,
  hostId: string,
  emails: string[]
): Promise<{ email: string; status: string; userId?: string }[]> => {
  const session = await SessionModel.findOne({ id: sessionId });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (session.hostId !== hostId) {
    throw new ApiError(403, 'Only the host can invite participants');
  }

  if (
    session.status === SessionStatus.COMPLETED ||
    session.status === SessionStatus.CANCELLED
  ) {
    throw new ApiError(400, 'Cannot invite to completed or cancelled sessions');
  }

  const users = await userService.getUsersByEmails(emails);

  const results = emails.map((email) => {
    const user = users.find((u) => u.email === email);

    if (!user) {
      return { email, status: 'user_not_found' };
    }

    if (user.id === hostId) {
      return { email, status: 'cannot_invite_host', userId: user.id };
    }

    const existing = session.participants.find((p) => p.userId === user.id);

    if (existing) {
      if (existing.invitationStatus === InvitationStatus.PENDING) {
        return { email, status: 'already_invited', userId: user.id };
      }
      if (existing.joinedAt && !existing.leftAt) {
        return { email, status: 'already_joined', userId: user.id };
      }
      if (existing.leftAt) {
        return { email, status: 'previously_left', userId: user.id };
      }
    }

    // Add as invited participant
    session.participants.push({
      userId: user.id,
      joinedAt: null,
      invitedAt: new Date(),
      invitationStatus: InvitationStatus.PENDING,
      submittedCode: [],
    });

    // Emit event for email notification (will implement later)
    try {
      inngest.send({
        name: 'colloquy/session.participant-invited',
        data: {
          sessionId: session.id,
          userId: user.id,
          email: user.email,
          hostId,
          sessionTitle: session.title,
          passcode:
            session.visibility === SessionVisibility.PRIVATE
              ? 'required'
              : undefined,
        },
      });
    } catch (error) {
      logger.error(`[Inngest] Failed to send invitation event: ${error}`);
    }

    return { email, status: 'invited', userId: user.id };
  });

  await session.save();

  logger.info(
    `[Session] Invitations sent for session ${sessionId}: ${results.filter((r) => r.status === 'invited').length} successful`
  );

  return results;
};

/**
 * Start a session
 * @param sessionId - ID of the session to start
 * @param hostId - ID of the host user
 * @returns The updated session object with ACTIVE status
 */
export const startSession = async (
  sessionId: string,
  hostId: string
): Promise<ISession> => {
  const session = await SessionModel.findOne({ id: sessionId });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (session.hostId !== hostId) {
    throw new ApiError(403, 'Only the host can start the session');
  }

  if (session.status === SessionStatus.ACTIVE) {
    throw new ApiError(400, 'Session is already active');
  }

  if (
    session.status !== SessionStatus.WAITING &&
    session.status !== SessionStatus.SCHEDULED
  ) {
    throw new ApiError(400, 'Cannot start a completed or cancelled session');
  }

  session.status = SessionStatus.ACTIVE;
  session.startedAt = new Date();

  await session.save();

  logger.info(`[Session] Session ${sessionId} started by ${hostId}`);

  // Emit event
  try {
    await inngest.send({
      name: 'colloquy/session.started',
      data: {
        sessionId: session.id,
        hostId,
        participantIds: session.participants
          .filter((p) => p.joinedAt && !p.leftAt)
          .map((p) => p.userId),
      },
    });
  } catch (error) {
    logger.error(`[Inngest] Failed to send session-started event: ${error}`);
  }

  return session;
};

/**
 * End a session
 * @param sessionId - ID of the session to end
 * @param hostId - ID of the host user
 * @returns The updated session object with COMPLETED status, chat logs, and recording URL
 */
export const endSession = async (
  sessionId: string,
  hostId: string
): Promise<ISession> => {
  const session = await SessionModel.findOne({ id: sessionId });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (session.hostId !== hostId) {
    throw new ApiError(403, 'Only the host can end the session');
  }

  if (session.status !== SessionStatus.ACTIVE) {
    throw new ApiError(400, 'Only active sessions can be ended');
  }

  // Fetch chat logs from Stream
  try {
    const chatLogs = await streamService.getChannelMessages(
      session.streamChannelId
    );
    session.chatLogs = chatLogs;
  } catch (error) {
    logger.error(`[Session] Failed to fetch chat logs: ${error}`);
  }

  // Fetch recording URL if recording was enabled
  if (session.recordingEnabled) {
    try {
      const recordingUrl = await streamService.getCallRecording(
        session.streamCallId
      );
      if (recordingUrl) {
        session.recordingUrl = recordingUrl;
      }
    } catch (error) {
      logger.error(`[Session] Failed to fetch recording: ${error}`);
    }
  }

  // Update status
  session.status = SessionStatus.COMPLETED;
  session.endedAt = new Date();

  await session.save();

  logger.info(`[Session] Session ${sessionId} ended by ${hostId}`);

  try {
    await streamService.deleteStreamCall(session.streamCallId);
    logger.info(`[Session] Cleaned up Stream call: ${session.streamCallId}`);
  } catch (error) {
    logger.error(`[Session] Failed to delete Stream call: ${error}`);
    // Don't throw - cleanup is best effort
  }

  try {
    await streamService.deleteStreamChannel(session.streamChannelId);
    logger.info(
      `[Session] Cleaned up Stream channel: ${session.streamChannelId}`
    );
  } catch (error) {
    logger.error(`[Session] Failed to delete Stream channel: ${error}`);
    // Don't throw - cleanup is best effort
  }

  // Emit event
  try {
    await inngest.send({
      name: 'colloquy/session.ended',
      data: {
        sessionId: session.id,
        hostId,
        participantIds: session.participants.map((p) => p.userId),
        recordingUrl: session.recordingUrl,
      },
    });
  } catch (error) {
    logger.error(`[Inngest] Failed to send session-ended event: ${error}`);
  }

  return session;
};

/**
 * Submit code for a specific problem
 * @param sessionId - ID of the session
 * @param userId - ID of the user submitting code
 * @param codeData - Code submission data including problemId, language, code, and optional notes
 * @returns Promise that resolves when code is submitted
 */
export const submitCode = async (
  sessionId: string,
  userId: string,
  codeData: {
    problemId: string;
    language: string;
    code: string;
    notes?: string;
  }
): Promise<void> => {
  const session = await SessionModel.findOne({ id: sessionId });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (session.status !== SessionStatus.ACTIVE) {
    throw new ApiError(400, 'Can only submit code in active sessions');
  }

  if (!session.problems.includes(codeData.problemId)) {
    throw new ApiError(400, 'Problem is not part of this session');
  }

  const participant = session.participants.find((p) => p.userId === userId);

  if (!participant) {
    throw new ApiError(400, 'You are not a participant in this session');
  }

  if (participant.leftAt) {
    throw new ApiError(400, 'You have left this session');
  }

  const existingIndex = participant.submittedCode.findIndex(
    (sub) => sub.problemId === codeData.problemId
  );

  if (existingIndex !== -1) {
    // Overwrite existing submission
    participant.submittedCode[existingIndex] = {
      problemId: codeData.problemId,
      language: codeData.language,
      code: codeData.code,
      notes: codeData.notes,
      submittedAt: new Date(),
    };
    logger.info(
      `[Session] Code updated by ${userId} for problem ${codeData.problemId} in session ${sessionId}`
    );
  } else {
    // Add new submission
    participant.submittedCode.push({
      problemId: codeData.problemId,
      language: codeData.language,
      code: codeData.code,
      notes: codeData.notes,
      submittedAt: new Date(),
    });
    logger.info(
      `[Session] Code submitted by ${userId} for problem ${codeData.problemId} in session ${sessionId}`
    );
  }

  await session.save();
};

/**
 * Add feedback for a participant
 * @param sessionId - ID of the session
 * @param hostId - ID of the host user
 * @param participantId - ID of the participant receiving feedback
 * @param feedbackData - Feedback data including score, feedback text, strengths, and improvements
 * @returns The updated session object with participant feedback
 */
export const addFeedback = async (
  sessionId: string,
  hostId: string,
  participantId: string,
  feedbackData: {
    score?: number;
    feedback?: string;
    strengths?: string[];
    improvements?: string[];
  }
): Promise<ISession> => {
  const session = await SessionModel.findOne({ id: sessionId });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (session.hostId !== hostId) {
    throw new ApiError(403, 'Only the host can add feedback');
  }

  if (session.status !== SessionStatus.COMPLETED) {
    throw new ApiError(400, 'Can only add feedback to completed sessions');
  }

  const participant = session.participants.find(
    (p) => p.userId === participantId
  );

  if (!participant) {
    throw new ApiError(404, 'Participant not found in this session');
  }

  // Update feedback
  if (feedbackData.score !== undefined) {
    participant.score = feedbackData.score;
  }
  if (feedbackData.feedback !== undefined) {
    participant.feedback = feedbackData.feedback;
  }
  if (feedbackData.strengths !== undefined) {
    participant.strengths = feedbackData.strengths;
  }
  if (feedbackData.improvements !== undefined) {
    participant.improvements = feedbackData.improvements;
  }

  await session.save();

  logger.info(
    `[Session] Feedback added for ${participantId} in session ${sessionId}`
  );

  // Emit event
  try {
    await inngest.send({
      name: 'colloquy/session.feedback-added',
      data: {
        sessionId: session.id,
        participantId,
        hostId,
        score: participant.score,
      },
    });
  } catch (error) {
    logger.error(`[Inngest] Failed to send feedback-added event: ${error}`);
  }

  return session;
};
