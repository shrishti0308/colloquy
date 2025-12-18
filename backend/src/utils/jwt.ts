import jwt from 'jsonwebtoken';
import { Config } from '../config';
import ApiError from './apiError';

export interface IJwtPayload {
  id: string;
  role: string;
}

export const signAccessToken = (payload: IJwtPayload): string => {
  if (!Config.JWT_ACCESS_SECRET) {
    throw new ApiError(
      500,
      'JWT_ACCESS_SECRET is not defined in environment variables'
    );
  }

  return jwt.sign(payload, Config.JWT_ACCESS_SECRET, {
    expiresIn: Config.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const signRefreshToken = (payload: IJwtPayload): string => {
  if (!Config.JWT_REFRESH_SECRET) {
    throw new ApiError(
      500,
      'JWT_REFRESH_SECRET is not defined in environment variables'
    );
  }

  return jwt.sign(payload, Config.JWT_REFRESH_SECRET, {
    expiresIn: Config.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyAccessToken = (token: string): IJwtPayload => {
  if (!Config.JWT_ACCESS_SECRET) {
    throw new ApiError(
      500,
      'JWT_ACCESS_SECRET is not defined in environment variables'
    );
  }

  try {
    const decoded = jwt.verify(token, Config.JWT_ACCESS_SECRET) as IJwtPayload;
    return decoded;
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired access token');
  }
};

export const verifyRefreshToken = (token: string): IJwtPayload => {
  if (!Config.JWT_REFRESH_SECRET) {
    throw new ApiError(
      500,
      'JWT_REFRESH_SECRET is not defined in environment variables'
    );
  }

  try {
    const decoded = jwt.verify(token, Config.JWT_REFRESH_SECRET) as IJwtPayload;
    return decoded;
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
};
