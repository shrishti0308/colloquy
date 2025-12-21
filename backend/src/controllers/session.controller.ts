import { Request, Response } from 'express';
import { SessionStatus, SessionVisibility } from '../models/session.model';
import * as sessionService from '../services/session.service';
import ApiResponse from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

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
    const filters = {
      visibility: req.query.visibility as SessionVisibility | undefined,
      status: req.query.status as SessionStatus | undefined,
    };

    const sessions = await sessionService.getAllSessions(filters);

    res
      .status(200)
      .json(
        new ApiResponse(200, sessions, 'Active sessions fetched successfully')
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
    const filters = {
      status: req.query.status as SessionStatus | undefined,
    };

    const sessions = await sessionService.getMyHostedSessions(
      req.user!.id,
      filters
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, sessions, 'Hosted sessions fetched successfully')
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
    const sessions = await sessionService.getMyParticipatedSessions(
      req.user!.id
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          sessions,
          'Participated sessions fetched successfully'
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
