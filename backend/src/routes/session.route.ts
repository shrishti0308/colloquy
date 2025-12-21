import { Router } from 'express';
import * as sessionController from '../controllers/session.controller';
import { authorizeRoles, protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/joi.middleware';
import { UserRole } from '../models/user.model';
import {
  acceptInvitationSchema,
  addFeedbackSchema,
  createSessionSchema,
  inviteParticipantsSchema,
  joinSessionSchema,
  sessionQuerySchema,
  submitCodeSchema,
  updateSessionSchema,
} from '../validators/session.validator';

const router = Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /sessions/active:
 *   get:
 *     summary: Get all active sessions
 *     description: Fetches all public sessions that are waiting or scheduled
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionVisibility'
 *       - $ref: '#/components/parameters/SessionStatus'
 *     responses:
 *       "200":
 *         description: Active sessions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Active sessions fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/active',
  validate(sessionQuerySchema, 'query'),
  sessionController.getActiveSessions
);

/**
 * @swagger
 * /sessions/my/hosted:
 *   get:
 *     summary: Get my hosted sessions
 *     description: Fetches all sessions created by the authenticated user
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionStatus'
 *     responses:
 *       "200":
 *         description: Hosted sessions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Hosted sessions fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/my/hosted',
  validate(sessionQuerySchema, 'query'),
  sessionController.getMyHostedSessions
);

/**
 * @swagger
 * /sessions/my/participated:
 *   get:
 *     summary: Get my participated sessions
 *     description: Fetches all sessions where the user is a participant
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Participated sessions fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Participated sessions fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Session'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/my/participated', sessionController.getMyParticipatedSessions);

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create a new session
 *     description: Creates a new interview session (Interviewer/Admin only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSessionBody'
 *     responses:
 *       "201":
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Session created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Session'
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  '/',
  authorizeRoles(UserRole.INTERVIEWER, UserRole.ADMIN),
  validate(createSessionSchema),
  sessionController.createSession
);

/**
 * @swagger
 * /sessions/{id}/accept-invitation:
 *   post:
 *     summary: Accept invitation to session
 *     description: Accept an invitation to join a session (does not add to session yet)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionId'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               passcode:
 *                 type: string
 *                 example: "secret123"
 *     responses:
 *       "200":
 *         description: Invitation accepted successfully
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "401":
 *         description: Invalid passcode or unauthorized
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:id/accept-invitation',
  validate(acceptInvitationSchema),
  sessionController.acceptInvitation
);

/**
 * @swagger
 * /sessions/{id}/join:
 *   post:
 *     summary: Join a session
 *     description: Join or rejoin a session (with passcode for private sessions)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionId'
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JoinSessionBody'
 *     responses:
 *       "200":
 *         description: Joined session successfully
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "401":
 *         description: Invalid passcode or unauthorized
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:id/join',
  validate(joinSessionSchema),
  sessionController.joinSession
);

/**
 * @swagger
 * /sessions/{id}/leave:
 *   post:
 *     summary: Leave a session
 *     description: Leave an active session (participants only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionId'
 *     responses:
 *       "200":
 *         description: Left session successfully
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/leave', sessionController.leaveSession);

/**
 * @swagger
 * /sessions/{id}/invite:
 *   post:
 *     summary: Invite participants by email
 *     description: Invite users to join the session (host only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InviteParticipantsBody'
 *     responses:
 *       "200":
 *         description: Invitations processed
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:id/invite',
  validate(inviteParticipantsSchema),
  sessionController.inviteParticipants
);

/**
 * @swagger
 * /sessions/{id}/start:
 *   put:
 *     summary: Start a session
 *     description: Start a waiting or scheduled session (host only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionId'
 *     responses:
 *       "200":
 *         description: Session started successfully
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id/start', sessionController.startSession);

/**
 * @swagger
 * /sessions/{id}/end:
 *   put:
 *     summary: End a session
 *     description: End an active session and fetch recordings/chat logs (host only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionId'
 *     responses:
 *       "200":
 *         description: Session ended successfully
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id/end', sessionController.endSession);

/**
 * @swagger
 * /sessions/{id}/submit-code:
 *   post:
 *     summary: Submit code solution
 *     description: Submit code for the current problem (participants only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitCodeBody'
 *     responses:
 *       "200":
 *         description: Code submitted successfully
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:id/submit-code',
  validate(submitCodeSchema),
  sessionController.submitCode
);

/**
 * @swagger
 * /sessions/{id}/feedback/{userId}:
 *   put:
 *     summary: Add feedback for participant
 *     description: Add score, feedback, strengths, and improvements for a participant (host only, completed sessions)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionId'
 *       - $ref: '#/components/parameters/FeedbackUserId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddFeedbackBody'
 *     responses:
 *       "200":
 *         description: Feedback added successfully
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
  '/:id/feedback/:userId',
  validate(addFeedbackSchema),
  sessionController.addFeedback
);

/**
 * @swagger
 * /sessions/{id}:
 *   get:
 *     summary: Get session by ID
 *     description: Fetches a specific session by ID (with access control)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionId'
 *     responses:
 *       "200":
 *         description: Session fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Session fetched successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Session'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   put:
 *     summary: Update session
 *     description: Updates a session (host only, not allowed for active/completed sessions)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSessionBody'
 *     responses:
 *       "200":
 *         description: Session updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Session updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Session'
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   delete:
 *     summary: Delete session
 *     description: Soft-deletes a session (host only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SessionId'
 *     responses:
 *       "200":
 *         description: Session deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Session deleted successfully"
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router
  .route('/:id')
  .get(sessionController.getSessionById)
  .put(validate(updateSessionSchema), sessionController.updateSession)
  .delete(sessionController.deleteSession);

export default router;
