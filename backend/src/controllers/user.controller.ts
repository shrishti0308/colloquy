import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import ApiError from '../utils/apiError';
import ApiResponse from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Admin
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res
    .status(200)
    .json(new ApiResponse(200, users, 'Users fetched successfully'));
});

/**
 * @desc    Get a single user by ID
 * @route   GET /api/v1/users/:id
 * @access  Admin
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, user, 'User fetched successfully'));
});

/**
 * @desc    Update a user
 * @route   PUT /api/v1/users/:id
 * @access  Admin
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, user, 'User updated successfully'));
});

/**
 * @desc    Delete a user (soft delete)
 * @route   DELETE /api/v1/users/:id
 * @access  Admin
 */
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'));
});

/**
 * @desc    Restore a soft-deleted user
 * @route   PUT /api/v1/users/:id/restore
 * @access  Admin
 */
export const restoreUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.restoreUser(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, user, 'User restored successfully'));
});

/**
 * @desc    Get all soft-deleted users
 * @route   GET /api/v1/users/deleted
 * @access  Admin
 */
export const getDeletedUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const users = await userService.getDeletedUsers();
    res
      .status(200)
      .json(new ApiResponse(200, users, 'Deleted users fetched successfully'));
  }
);

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/me
 * @access  Protected
 */
export const getMe = (req: Request, res: Response) => {
  res.status(200).json(new ApiResponse(200, req.user, 'Profile fetched'));
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/v1/users/me
 * @access  Protected
 */
export const updateMyProfile = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    const { name } = req.body;

    const user = await userService.updateMyProfile(req.user.id, { name });

    res
      .status(200)
      .json(new ApiResponse(200, user, 'Profile updated successfully'));
  }
);

/**
 * @desc    Change current user password
 * @route   PUT /api/v1/users/me/password
 * @access  Protected
 */
export const changeMyPassword = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new ApiError(400, 'Old password and new password are required');
    }

    await userService.changeMyPassword(req.user.id, oldPassword, newPassword);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Password changed successfully'));
  }
);

/**
 * @desc    Delete current user account (soft delete)
 * @route   DELETE /api/v1/users/me
 * @access  Protected
 */
export const deleteMyAccount = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    await userService.deleteUser(req.user.id);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Account deleted successfully'));
  }
);
