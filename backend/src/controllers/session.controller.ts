import { Request, Response } from 'express';
import { SessionStatus, SessionVisibility } from '../models/session.model';
import * as sessionService from '../services/session.service';
import ApiResponse from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import {
  buildPaginationMetadata,
  getPaginationParams,
} from '../utils/pagination';

/**
 * @desc    Create a new session
 * @route   POST /api/v1/sessions
 * @access  Interviewer/Admin
 */
export const createSession = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await sessionService.createSession(
      req.body,
      req.user!.id,
      req.user!.id // Using user ID as Stream user ID
    );

    res
      .status(201)
      .json(new ApiResponse(201, session, 'Session created successfully'));
  }
);

/**
 * @desc    Get session by ID
 * @route   GET /api/v1/sessions/:id
 * @access  Protected
 */
export const getSessionById = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await sessionService.getSessionById(
      req.params.id,
      req.user!.id
    );

    res
      .status(200)
      .json(new ApiResponse(200, session, 'Session fetched successfully'));
  }
);

/**
 * @desc    Get all active sessions
 * @route   GET /api/v1/sessions/active
 * @access  Protected
 */
export const getActiveSessions = asyncHandler(
  async (req: Request, res: Response) => {
    const paginationParams = getPaginationParams(req.query);

    const filters = {
      visibility: req.query.visibility as SessionVisibility | undefined,
      status: req.query.status as SessionStatus | undefined,
    };

    const { sessions, total } = await sessionService.getAllSessions(
      filters,
      paginationParams
    );

    const pagination = buildPaginationMetadata(
      total,
      paginationParams.page,
      paginationParams.limit
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          sessions,
          'Active sessions fetched successfully',
          pagination
        )
      );
  }
);

/**
 * @desc    Get all sessions (admin)
 * @route   GET /api/v1/sessions/admin/all
 * @access  Admin
 */
export const getAllSessionsAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const paginationParams = getPaginationParams(req.query);

    const filters = {
      visibility: req.query.visibility as SessionVisibility | undefined,
      status: req.query.status as SessionStatus | undefined,
      hostId: req.query.hostId as string | undefined,
    };

    const { sessions, total } = await sessionService.getAllSessionsAdmin(
      filters,
      paginationParams
    );

    const pagination = buildPaginationMetadata(
      total,
      paginationParams.page,
      paginationParams.limit
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          sessions,
          'All sessions fetched successfully',
          pagination
        )
      );
  }
);

/**
 * @desc    Get my hosted sessions
 * @route   GET /api/v1/sessions/my/hosted
 * @access  Protected
 */
export const getMyHostedSessions = asyncHandler(
  async (req: Request, res: Response) => {
    const paginationParams = getPaginationParams(req.query);

    const filters = {
      status: req.query.status as SessionStatus | undefined,
    };

    const { sessions, total } = await sessionService.getMyHostedSessions(
      req.user!.id,
      filters,
      paginationParams
    );

    const pagination = buildPaginationMetadata(
      total,
      paginationParams.page,
      paginationParams.limit
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          sessions,
          'Hosted sessions fetched successfully',
          pagination
        )
      );
  }
);

/**
 * @desc    Get my participated sessions
 * @route   GET /api/v1/sessions/my/participated
 * @access  Protected
 */
export const getMyParticipatedSessions = asyncHandler(
  async (req: Request, res: Response) => {
    const paginationParams = getPaginationParams(req.query);

    const { sessions, total } = await sessionService.getMyParticipatedSessions(
      req.user!.id,
      paginationParams
    );

    const pagination = buildPaginationMetadata(
      total,
      paginationParams.page,
      paginationParams.limit
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          sessions,
          'Participated sessions fetched successfully',
          pagination
        )
      );
  }
);

/**
 * @desc    Update session
 * @route   PUT /api/v1/sessions/:id
 * @access  Host only
 */
export const updateSession = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await sessionService.updateSession(
      req.params.id,
      req.user!.id,
      req.body
    );

    res
      .status(200)
      .json(new ApiResponse(200, session, 'Session updated successfully'));
  }
);

/**
 * @desc    Delete session
 * @route   DELETE /api/v1/sessions/:id
 * @access  Host only
 */
export const deleteSession = asyncHandler(
  async (req: Request, res: Response) => {
    await sessionService.deleteSession(req.params.id, req.user!.id);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Session deleted successfully'));
  }
);

/**
 * @desc    Join a session
 * @route   POST /api/v1/sessions/:id/join
 * @access  Protected
 */
export const joinSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await sessionService.joinSession(
    req.params.id,
    req.user!.id,
    req.body.passcode
  );

  res
    .status(200)
    .json(new ApiResponse(200, session, 'Joined session successfully'));
});

/**
 * @desc    Leave a session
 * @route   POST /api/v1/sessions/:id/leave
 * @access  Protected
 */
export const leaveSession = asyncHandler(
  async (req: Request, res: Response) => {
    await sessionService.leaveSession(req.params.id, req.user!.id);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Left session successfully'));
  }
);

/**
 * @desc    Invite participants to session
 * @route   POST /api/v1/sessions/:id/invite
 * @access  Host only
 */
export const inviteParticipants = asyncHandler(
  async (req: Request, res: Response) => {
    const results = await sessionService.inviteParticipants(
      req.params.id,
      req.user!.id,
      req.body.emails
    );

    res
      .status(200)
      .json(new ApiResponse(200, results, 'Invitations processed'));
  }
);

/**
 * @desc    Start a session
 * @route   PUT /api/v1/sessions/:id/start
 * @access  Host only
 */
export const startSession = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await sessionService.startSession(
      req.params.id,
      req.user!.id
    );

    res
      .status(200)
      .json(new ApiResponse(200, session, 'Session started successfully'));
  }
);

/**
 * @desc    End a session
 * @route   PUT /api/v1/sessions/:id/end
 * @access  Host only
 */
export const endSession = asyncHandler(async (req: Request, res: Response) => {
  const session = await sessionService.endSession(req.params.id, req.user!.id);

  res
    .status(200)
    .json(new ApiResponse(200, session, 'Session ended successfully'));
});

/**
 * @desc    Submit code for current problem
 * @route   POST /api/v1/sessions/:id/submit-code
 * @access  Participants only
 */
export const submitCode = asyncHandler(async (req: Request, res: Response) => {
  await sessionService.submitCode(req.params.id, req.user!.id, req.body);

  res
    .status(200)
    .json(new ApiResponse(200, null, 'Code submitted successfully'));
});

/**
 * @desc    Add feedback for participant
 * @route   PUT /api/v1/sessions/:id/feedback/:userId
 * @access  Host only
 */
export const addFeedback = asyncHandler(async (req: Request, res: Response) => {
  const session = await sessionService.addFeedback(
    req.params.id,
    req.user!.id,
    req.params.userId,
    req.body
  );

  res
    .status(200)
    .json(new ApiResponse(200, session, 'Feedback added successfully'));
});

/**
 * @desc    Accept session invitation
 * @route   POST /api/v1/sessions/:id/accept-invitation
 * @access  Protected
 */
export const acceptInvitation = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await sessionService.acceptInvitation(
      req.params.id,
      req.user!.id,
      req.body.passcode
    );

    res
      .status(200)
      .json(new ApiResponse(200, session, 'Invitation accepted successfully'));
  }
);
