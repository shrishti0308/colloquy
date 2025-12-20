import { Router } from 'express';
import * as problemController from '../controllers/problem.controller';
import { authorizeRoles, protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/joi.middleware';
import { UserRole } from '../models/user.model';
import {
  createProblemSchema,
  problemQuerySchema,
  updateProblemSchema,
} from '../validators/problem.validator';

const router = Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /problems/default:
 *   get:
 *     summary: Get the default blank problem
 *     description: Returns the hardcoded default problem for freeform coding
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Default problem fetched successfully
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
 *                   example: "Default problem fetched successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Problem'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/default', problemController.getDefaultProblem);

/**
 * @swagger
 * /problems/my:
 *   get:
 *     summary: Get my created problems
 *     description: Fetches all problems created by the authenticated user
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: Problems fetched successfully
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
 *                   example: "Your problems fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Problem'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/my',
  authorizeRoles(UserRole.INTERVIEWER, UserRole.ADMIN),
  problemController.getMyProblems
);

/**
 * @swagger
 * /problems:
 *   get:
 *     summary: Get all accessible problems
 *     description: Fetches all public problems and user's private problems
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProblemDifficulty'
 *       - $ref: '#/components/parameters/ProblemTags'
 *       - $ref: '#/components/parameters/SearchQuery'
 *     responses:
 *       "200":
 *         description: Problems fetched successfully
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
 *                   example: "Problems fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Problem'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 *   post:
 *     summary: Create a new problem
 *     description: Creates a new problem (Admin = public, Interviewer = private by default)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProblemBody'
 *     responses:
 *       "201":
 *         description: Problem created successfully
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
 *                   example: "Problem created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Problem'
 *       "400":
 *         $ref: '#/components/responses/ValidationError'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 */
router
  .route('/')
  .get(validate(problemQuerySchema, 'query'), problemController.getAllProblems)
  .post(
    authorizeRoles(UserRole.INTERVIEWER, UserRole.ADMIN),
    validate(createProblemSchema),
    problemController.createProblem
  );

/**
 * @swagger
 * /problems/{id}:
 *   get:
 *     summary: Get problem by ID
 *     description: Fetches a specific problem by ID (with access control)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProblemId'
 *     responses:
 *       "200":
 *         description: Problem fetched successfully
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
 *                   example: "Problem fetched successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Problem'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   put:
 *     summary: Update problem by ID
 *     description: Updates a problem (owner or admin only)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProblemId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProblemBody'
 *     responses:
 *       "200":
 *         description: Problem updated successfully
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
 *                   example: "Problem updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Problem'
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
 *     summary: Delete problem by ID
 *     description: Soft-deletes a problem (owner or admin only)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProblemId'
 *     responses:
 *       "200":
 *         description: Problem deleted successfully
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
 *                   example: "Problem deleted successfully"
 *                 data:
 *                   type: object
 *                   nullable: true
 *                   example: null
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router
  .route('/:id')
  .get(problemController.getProblemById)
  .put(
    authorizeRoles(UserRole.INTERVIEWER, UserRole.ADMIN),
    validate(updateProblemSchema),
    problemController.updateProblem
  )
  .delete(
    authorizeRoles(UserRole.INTERVIEWER, UserRole.ADMIN),
    problemController.deleteProblem
  );

/**
 * @swagger
 * /problems/{id}/toggle-visibility:
 *   put:
 *     summary: Toggle problem visibility
 *     description: Toggles between public and private (interviewer only, for their own problems)
 *     tags: [Problems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ProblemId'
 *     responses:
 *       "200":
 *         description: Problem visibility toggled successfully
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
 *                   example: "Problem visibility toggled successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Problem'
 *       "401":
 *         $ref: '#/components/responses/UnauthorizedError'
 *       "403":
 *         $ref: '#/components/responses/ForbiddenError'
 *       "404":
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
  '/:id/toggle-visibility',
  authorizeRoles(UserRole.INTERVIEWER, UserRole.ADMIN),
  problemController.toggleVisibility
);

export default router;
