import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.http(`[Request] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);

  res.on('finish', () => {
    logger.http(
      `[Response] ${res.statusCode} ${res.statusMessage} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`
    );
  });

  next();
};
