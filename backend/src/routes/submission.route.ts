import { Router } from 'express';
import * as submissionController from '../controllers/submission.controller';
import { authorizeRoles, protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/joi.middleware';
import { UserRole } from '../models/user.model';
import {
  createSubmissionSchema,
  submissionQuerySchema,
} from '../validators/submission.validator';

const router = Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /submissions/my:
 *   get:
 *     summary: Get my submissions
 *     description: Fetches all submissions by the authenticated user with optional filters
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: problemId
 *         in: query
 *         description: Filter by problem ID
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/ProblemDifficulty'
 *       - $ref: '#/components/parameters/ProblemTags'
 *       - $ref: '#/components/parameters/SearchQuery'
 *       - name: status
 *         in: query
 *         description: Filter by submission status
 *         schema:
 *           type: string
 *           enum: [pass, partial, fail, error]
 *     responses:
 *       "200":
 *         description: Submissions fetched successfully
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
 *                   example: "Submissions fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Submission'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/my',
  validate(submissionQuerySchema, 'query'),
  submissionController.getMySubmissions
);

/**
 * @swagger
 * /submissions/stats:
 *   get:
 *     summary: Get submission statistics (Admin)
 *     description: Fetches overall submission statistics
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Statistics fetched successfully
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
 *                   example: "Submission statistics fetched successfully"
 *                 data:
 *                   type: object
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/stats',
  authorizeRoles(UserRole.ADMIN),
  submissionController.getSubmissionStats
);

/**
 * @swagger
 * /submissions/user/{userId}:
 *   get:
 *     summary: Get submissions by user (Admin)
 *     description: Fetches all submissions for a specific user
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/SubmissionUserId'
 *     responses:
 *       "200":
 *         description: User submissions fetched successfully
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
 *                   example: "User submissions fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Submission'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/user/:userId',
  authorizeRoles(UserRole.ADMIN),
  submissionController.getSubmissionsByUser
);

/**
 * @swagger
 * /submissions:
 *   get:
 *     summary: Get all submissions (Admin)
 *     description: Fetches all submissions with optional filters
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: problemId
 *         in: query
 *         description: Filter by problem ID
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: Filter by submission status
 *         schema:
 *           type: string
 *           enum: [pass, partial, fail, error]
 *     responses:
 *       "200":
 *         description: All submissions fetched successfully
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
 *                   example: "All submissions fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Submission'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *
 *   post:
 *     summary: Create a new submission
 *     description: Creates a new code submission for a problem
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubmissionBody'
 *     responses:
 *       "201":
 *         description: Submission created successfully
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
 *                   example: "Submission created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Submission'
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
  .route('/')
  .get(authorizeRoles(UserRole.ADMIN), submissionController.getAllSubmissions)
  .post(
    validate(createSubmissionSchema),
    submissionController.createSubmission
  );

/**
 * @swagger
 * /submissions/{id}:
 *   get:
 *     summary: Get submission by ID (Admin)
 *     description: Fetches a specific submission by ID
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: UUID of the submission
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       "200":
 *         description: Submission fetched successfully
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
 *                   example: "Submission fetched successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Submission'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   delete:
 *     summary: Delete submission (Admin)
 *     description: Soft-deletes a submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: UUID of the submission
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       "200":
 *         description: Submission deleted successfully
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
 *                   example: "Submission deleted successfully"
 *                 data:
 *                   type: null
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router
  .route('/:id')
  .get(authorizeRoles(UserRole.ADMIN), submissionController.getSubmissionById)
  .delete(
    authorizeRoles(UserRole.ADMIN),
    submissionController.deleteSubmission
  );

export default router;
