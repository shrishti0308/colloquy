import { Request, Response } from 'express';
import { logService } from '../services/log.service';
import { FrontendLogData } from '../types/log.types';
import ApiResponse from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const logController = {
  /**
   * @desc    Log frontend error
   * @route   POST /api/v1/logs/frontend
   * @access  Public
   */
  logFrontendError: asyncHandler(async (req: Request, res: Response) => {
    const logData: FrontendLogData = req.body;

    await logService.logFrontendError(logData);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Log recorded successfully'));
  }),

  /**
   * @desc    Get recent logs
   * @route   GET /api/v1/logs
   * @access  Admin
   */
  getRecentLogs: asyncHandler(async (req: Request, res: Response) => {
    const { level, limit } = req.query;

    const parsedLimit = limit ? parseInt(limit as string, 10) : 100;
    if (limit && isNaN(parsedLimit)) {
      res
        .status(400)
        .json(new ApiResponse(400, null, 'Invalid limit parameter'));
      return;
    }
    const logs = await logService.getRecentLogs(level as string, parsedLimit);
    res
      .status(200)
      .json(new ApiResponse(200, logs, 'Logs retrieved successfully'));
  }),

  /**
   * @desc    Clear old logs
   * @route   DELETE /api/v1/logs/clear
   * @access  Admin
   */
  clearOldLogs: asyncHandler(async (req: Request, res: Response) => {
    const { daysToKeep } = req.body;
    const days = daysToKeep || 30;
    if (typeof days !== 'number' || days < 0) {
      res
        .status(400)
        .json(new ApiResponse(400, null, 'Invalid daysToKeep parameter'));
      return;
    }
    await logService.clearOldLogs(days);
    res
      .status(200)
      .json(new ApiResponse(200, null, 'Old logs cleared successfully'));
  }),
};
