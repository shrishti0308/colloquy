import { inngest } from '../config/inngest';
import UserModel, { IUser } from '../models/user.model';
import ApiError from '../utils/apiError';
import logger from '../utils/logger';
import { PaginationParams } from '../utils/pagination';

/**
 * Get all users.
 * @param paginationParams - Pagination parameters
 * @returns List of all users and total count
 */
export const getAllUsers = async (
  paginationParams?: PaginationParams
): Promise<{ users: IUser[]; total: number }> => {
  let query = UserModel.find();

  if (paginationParams) {
    const { page, limit } = paginationParams;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const [users, total] = await Promise.all([
    query.exec(),
    UserModel.countDocuments(),
  ]);

  return { users, total };
};

/**
 * Get user by ID.
 * @param id - ID of the user to retrieve
 * @returns The user with the specified ID
 */
export const getUserById = async (id: string): Promise<IUser> => {
  const user = await UserModel.findOne({ id });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

/**
 * Update user by ID.
 * @param id - ID of the user to update
 * @param updateBody - Fields to update (name, email, role)
 * @returns The updated user
 */
export const updateUser = async (
  id: string,
  updateBody: Partial<Pick<IUser, 'name' | 'email' | 'role'>>
): Promise<IUser> => {
  const user = await getUserById(id);

  if (
    updateBody.email &&
    updateBody.email !== user.email &&
    (await UserModel.findOne({ email: updateBody.email }))
  ) {
    throw new ApiError(409, 'Email already in use');
  }

  Object.assign(user, updateBody);
  await user.save();

  return user;
};

/**
 * Delete user by ID (Soft Deletion).
 * @param id - ID of the user to delete
 */
export const deleteUser = async (id: string): Promise<void> => {
  const user = await getUserById(id);

  await user.delete();

  try {
    await inngest.send({
      name: 'colloquy/user.deleted',
      data: {
        userId: user.id,
        name: user.name,
      },
    });
    logger.info(`[Inngest] Event sent for user deletion: ${user.id}`);
  } catch (error) {
    logger.error(`[Inngest] Failed to send user deletion event: ${error}`);
    // Don't throw - soft deletion should succeed even if event fails
  }
};

/**
 * Restore a soft-deleted user by ID.
 * @param id - ID of the user to restore
 * @returns The restored user
 */
export const restoreUser = async (id: string): Promise<IUser> => {
  const user = await UserModel.findOneDeleted({ id });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  await user.restore();

  // Re-sync to Stream after restoration
  try {
    await inngest.send({
      name: 'colloquy/user.restored',
      data: {
        userId: user.id,
        name: user.name,
        role: user.role,
      },
    });
    logger.info(`[Inngest] Event sent for user restoration: ${user.id}`);
  } catch (error) {
    logger.error(`[Inngest] Failed to send user restoration event: ${error}`);
  }

  return user;
};

/**
 * Get all soft-deleted users with pagination.
 * @param paginationParams - Pagination parameters
 * @returns List of all soft-deleted users and total count
 */
export const getDeletedUsers = async (
  paginationParams?: PaginationParams
): Promise<{ users: IUser[]; total: number }> => {
  let query = UserModel.findDeleted();

  if (paginationParams) {
    const { page, limit } = paginationParams;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
  }

  const [users, total] = await Promise.all([
    query.exec(),
    UserModel.countDocumentsDeleted(),
  ]);

  return { users, total };
};

/**
 * Update the profile of the currently authenticated user.
 * @param userId - ID of the user to update
 * @param updateBody - Fields to update (name)
 * @returns The updated user
 */
export const updateMyProfile = async (
  userId: string,
  updateBody: Partial<Pick<IUser, 'name'>>
): Promise<IUser> => {
  const user = await UserModel.findOne({ id: userId });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (updateBody.name) {
    user.name = updateBody.name;
  }

  await user.save();

  // Update Stream user if name changed
  if (updateBody.name) {
    try {
      await inngest.send({
        name: 'colloquy/user.updated',
        data: {
          userId: user.id,
          name: user.name,
          role: user.role,
        },
      });
      logger.info(`[Inngest] Event sent for user update: ${user.id}`);
    } catch (error) {
      logger.error(`[Inngest] Failed to send user update event: ${error}`);
    }
  }

  return user;
};

/**
 * Change the password of the currently authenticated user.
 * @param userId - ID of the user changing the password
 * @param oldPassword - Current password of the user
 * @param newPassword - New password to set
 */
export const changeMyPassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> => {
  const user = await UserModel.findOne({ id: userId }).select('+password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new ApiError(401, 'Old password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  // -- Emit Inngest event for password change confirmation email --
  try {
    await inngest.send({
      name: 'colloquy/email.password_reset_confirmation',
      data: {
        email: user.email,
      },
    });

    logger.info(
      `[Inngest] Event sent for password change confirmation email: ${user.id}`
    );
  } catch (error) {
    logger.error(
      `[Inngest] Failed to send password change confirmation email event: ${error}`
    );
    // Don't throw - password change should succeed even if event fails
  }
};

/**
 * Get users by email addresses
 * @param emails - Array of email addresses
 * @returns Array of users
 */
export const getUsersByEmails = async (emails: string[]): Promise<IUser[]> => {
  const users = await UserModel.find({
    email: { $in: emails },
  }).select('id name email');

  return users;
};
