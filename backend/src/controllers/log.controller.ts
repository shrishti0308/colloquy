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

    const logs = await logService.getRecentLogs(
      level as string,
      limit ? parseInt(limit as string) : 100
    );

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

    await logService.clearOldLogs(daysToKeep || 30);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Old logs cleared successfully'));
  }),
};
