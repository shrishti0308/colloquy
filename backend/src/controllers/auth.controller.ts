import { Request, Response } from 'express';
import { Config } from '../config';
import {
  forgotPasswordService,
  login as loginUserService,
  logout,
  refreshAccessToken,
  register as registerUserService,
  resetPasswordService,
} from '../services/auth.service';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const sendRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: Config.IS_PRODUCTION,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (Same as refresh token expiry)
    sameSite: 'strict',
  });
};

/**
 * @desc   Register a new user
 * @route  POST /api/v1/auth/register
 * @access Public
 */
export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const { user, accessToken, refreshToken } = await registerUserService({
      name,
      email,
      password,
    });

    sendRefreshTokenCookie(res, refreshToken);

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { user, accessToken },
          'User registered successfully'
        )
      );
  }
);

/**
 * @desc   Login user
 * @route  POST /api/v1/auth/login
 * @access Public
 */
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const loginInfo = {
    ip: req.ip || 'Unknown IP',
    userAgent: req.headers['user-agent'] || 'Unknown User-Agent',
  };

  const { user, accessToken, refreshToken } = await loginUserService(
    { email, password },
    loginInfo
  );

  sendRefreshTokenCookie(res, refreshToken);

  res
    .status(200)
    .json(
      new ApiResponse(200, { user, accessToken }, 'User logged in successfully')
    );
});

/**
 * @desc   Refresh Access Token
 * @route  POST /api/v1/auth/refresh
 * @access Public
 */
export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    const accessToken = await refreshAccessToken(incomingRefreshToken);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken },
          'Access token refreshed successfully'
        )
      );
  }
);

/**
 * @desc   Logout user
 * @route  POST /api/v1/auth/logout
 * @access Public
 */
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const incomingRefreshToken = req.cookies.refreshToken;
  await logout(incomingRefreshToken);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: Config.IS_PRODUCTION,
    sameSite: 'strict',
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, 'User logged out successfully'));
});

/**
 * @desc   Forgot Password
 * @route  POST /api/v1/auth/forgot-password
 * @access Public
 */
export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }

    await forgotPasswordService(email);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          'If that email address is in our database, we will send you an email to reset your password'
        )
      );
  }
);

/**
 * @desc   Reset Password
 * @route  POST /api/v1/auth/reset-password
 * @access Public
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ApiError(400, 'Token and new password are required');
    }

    const { user, accessToken, refreshToken } = await resetPasswordService(
      token,
      newPassword
    );

    sendRefreshTokenCookie(res, refreshToken);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user, accessToken },
          'Password has been reset successfully'
        )
      );
  }
);
