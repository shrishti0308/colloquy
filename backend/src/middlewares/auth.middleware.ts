import { NextFunction, Request, Response } from 'express';
import UserModel, { UserRole } from '../models/user.model';
import ApiError from '../utils/apiError';
import { asyncHandler } from '../utils/asyncHandler';
import { IJwtPayload, verifyAccessToken } from '../utils/jwt';

export const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized, No token provided');
    }

    const decoded = verifyAccessToken(token) as IJwtPayload;

    const user = await UserModel.findOne({ id: decoded.id });

    if (!user) {
      throw new ApiError(
        401,
        'Not authorized, User belonging to this token no longer exists'
      );
    }

    req.user = user;

    next();
  }
);

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Forbidden, Your role ${req.user.role} is not allowed to access this resource`
      );
    }

    next();
  };
};
