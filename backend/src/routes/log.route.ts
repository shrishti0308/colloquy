import { Router } from 'express';
import { logController } from '../controllers/log.controller';
import { authorizeRoles, protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/joi.middleware';
import { UserRole } from '../models/user.model';
import { logValidator } from '../validators/log.validator';

const router = Router();

/**
 * @swagger
 * /logs/frontend:
 *   post:
 *     summary: Log frontend error/warning/info
 *     tags: [Logs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - level
 *               - message
 *               - timestamp
 *             properties:
 *               level:
 *                 type: string
 *                 enum: [error, warn, info]
 *               message:
 *                 type: string
 *               context:
 *                 type: string
 *               details:
 *                 type: object
 *               stack:
 *                 type: string
 *               userAgent:
 *                 type: string
 *               url:
 *                 type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Log recorded successfully
 */
router.post(
  '/frontend',
  validate(logValidator.logFrontendError),
  logController.logFrontendError
);

/**
 * @swagger
 * /logs/recent:
 *   get:
 *     summary: Get recent frontend logs (Admin only)
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info]
 *         description: Filter by log level
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of logs to retrieve
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 */
router.get(
  '/recent',
  protect,
  authorizeRoles(UserRole.ADMIN),
  logController.getRecentLogs
);

/**
 * @swagger
 * /logs/clear:
 *   post:
 *     summary: Clear old logs (Admin only)
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daysToKeep:
 *                 type: integer
 *                 default: 30
 *     responses:
 *       200:
 *         description: Old logs cleared successfully
 */
router.post(
  '/clear',
  protect,
  authorizeRoles(UserRole.ADMIN),
  logController.clearOldLogs
);

export default router;
