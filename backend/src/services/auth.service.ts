import crypto from 'crypto';
import UserModel, { IUser } from '../models/user.model';
import ApiError from '../utils/apiError';
import {
  IJwtPayload,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import {
  sendLoginAlertEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} from './mail.service';

interface IAuthResponse {
  user: Omit<IUser, 'comparePassword'>;
  accessToken: string;
  refreshToken: string;
}

const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateAndSaveTokens = async (user: IUser): Promise<IAuthResponse> => {
  const payload: IJwtPayload = {
    id: user.id,
    role: user.role,
  };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshToken = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });

  return {
    user: user,
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

/**
 * Registers a new user.
 * @param userData - Name, Email and Password of the user to be registered
 * @returns The new user and JWT tokens
 */
export const register = async (
  userData: Pick<IUser, 'name' | 'email' | 'password'>
): Promise<IAuthResponse> => {
  const { name, email, password } = userData;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const newUser = new UserModel({
    name,
    email,
    password,
  });

  await newUser.save();

  // -- Send welcome email --
  sendWelcomeEmail(newUser.email, newUser.name);

  return generateAndSaveTokens(newUser);
};

/**
 * Logs in a user.
 * @param credentials - Email and Password of the user
 * @param loginInfo - IP address and User-Agent of the login request
 * @returns The user and JWT tokens
 */
export const login = async (
  credentials: Pick<IUser, 'email' | 'password'>,
  loginInfo: { ip: string; userAgent: string }
): Promise<IAuthResponse> => {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await UserModel.findOne({ email }).select(
    '+password +refreshToken'
  );

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // -- Send login alert email --
  sendLoginAlertEmail(user.email, loginInfo.ip, loginInfo.userAgent);

  return generateAndSaveTokens(user);
};

/**
 * Refreshes the access token using a valid refresh token.
 * @param incomingRefreshToken - The refresh token provided by the client
 * @returns A new access token
 */
export const refreshAccessToken = async (
  incomingRefreshToken: string
): Promise<string> => {
  if (!incomingRefreshToken) {
    throw new ApiError(400, 'No refresh token provided');
  }

  const payload = verifyRefreshToken(incomingRefreshToken);

  const hashedToken = hashToken(incomingRefreshToken);

  const user = await UserModel.findOne({
    id: payload.id,
    refreshToken: hashedToken,
  });

  if (!user) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const newAccessToken = signAccessToken({
    id: user.id,
    role: user.role,
  });

  return newAccessToken;
};

export const logout = async (incomingRefreshToken: string): Promise<void> => {
  if (!incomingRefreshToken) {
    return;
  }

  const hashedToken = hashToken(incomingRefreshToken);

  await UserModel.findOneAndUpdate(
    {
      refreshToken: hashedToken,
    },
    {
      $unset: { refreshToken: 1 },
    }
  );
};

/**
 * Sends a password reset email to the user.
 * @param email - Email of the user requesting password reset
 */
export const forgotPasswordService = async (email: string): Promise<void> => {
  const user = await UserModel.findOne({
    email,
  });

  if (!user) {
    return;
  }

  const plainToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(plainToken);

  const validityDuration = 10 * 60 * 1000; // 10 minutes

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = new Date(Date.now() + validityDuration);

  try {
    await user.save();

    sendPasswordResetEmail(user.email, plainToken);
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    throw new ApiError(500, 'Error sending password reset email');
  }
};

/** Resets the user's password using a valid reset token.
 * @param token - Password reset token
 * @param newPassword - New password to be set
 * @returns The user and JWT tokens
 */
export const resetPasswordService = async (
  token: string,
  newPassword: string
): Promise<IAuthResponse> => {
  const hashedToken = hashToken(token);

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() }, // Token is not expired
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired password reset token');
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  return generateAndSaveTokens(user);
};
