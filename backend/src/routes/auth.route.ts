import { Router } from 'express';
import {
  forgotPassword,
  loginUser,
  logoutUser,
  refreshToken,
  registerUser,
  resetPassword,
} from '../controllers/auth.controller';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();
router.use(authLimiter);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     desription: Register a new user with the provided details, sends a welccome email, returns User, Access Token, and Refresh Token Cookie.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/RegisterBody"
 *     responses:
 *       "201":
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             type: object
 *             properties:
 *               success: {type: boolean, example: true}
 *               message: {type: string, example: "User registered successfully"}
 *               data:
 *                 type: object
 *                 properties:
 *                   user:
 *                     $ref: "#/components/schemas/User"
 *                   accessToken: {type: string, example: "eyJhbGciOi..."}
 *       "400":
 *         $ref: "#/components/responses/BadRequestError"
 *       "409":
 *         description: User with this email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiError"
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     description: Login a user with the provided email and password, sends a security email, returns User, Access Token, and Refresh Token Cookie.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LoginBody"
 *     responses:
 *       "200":
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             type: object
 *             properties:
 *               success: {type: boolean, example: true}
 *               message: {type: string, example: "User logged in successfully"}
 *               data:
 *                 type: object
 *                 properties:
 *                   user:
 *                     $ref: "#/components/schemas/User"
 *                   accessToken: {type: string, example: "eyJhbGciOi..."}
 *       "400":
 *         $ref: "#/components/responses/BadRequestError"
 *       "401":
 *         description: Unauthorized - Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiError"
 */
router.post('/login', loginUser);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     description: Logout a user by invalidating the access token and refresh token.
 *     tags: [Auth]
 *     responses:
 *       "200":
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             type: object
 *             properties:
 *               success: {type: boolean, example: true}
 *               message: {type: string, example: "Logged out successfully"}
 *               data: {type: object, nullable: true, example: null}
 */
router.post('/logout', logoutUser);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Refresh the access token using the provided refresh token (sent via httpOnly cookie).
 *     tags: [Auth]
 *     responses:
 *       "200":
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             type: object
 *             properties:
 *               success: {type: boolean, example: true}
 *               message: {type: string, example: "Access token refreshed successfully"}
 *               data:
 *                 type: object
 *                 properties:
 *                   accessToken: {type: string, example: "eyJhbGciOi..."}
 *       "401":
 *         description: Unauthorized - No refresh token provided or invalid/expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiError"
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     description: Request a password reset link (along with reset token) to be sent to the user's email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ForgotPasswordBody"
 *     responses:
 *       "200":
 *         description: Password reset link sent successfully (if the email exists)
 *         content:
 *           application/json:
 *             type: object
 *             properties:
 *               success: {type: boolean, example: true}
 *               message: {type: string, example: "Password reset link sent successfully if the email exists"}
 *               data: {type: object, nullable: true, example: null}
 *       "400":
 *         $ref: "#/components/responses/BadRequestError"
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset a user's password
 *     description: Takes a valid (non-expired) reset token and new password to reset the user's password, returns User, Access Token, and Refresh Token Cookie.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/ResetPasswordBody"
 *     responses:
 *       "200":
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             type: object
 *             properties:
 *               success: {type: boolean, example: true}
 *               message: {type: string, example: "Password has been reset successfully"}
 *               data:
 *                 type: object
 *                 properties:
 *                   user:
 *                     $ref: "#/components/schemas/User"
 *                   accessToken: {type: string, example: "eyJhbGciOi..."}
 *       "400":
 *         description: Bad Request - Token and new password are required / Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ApiError"
 */
router.post('/reset-password', resetPassword);

export default router;
