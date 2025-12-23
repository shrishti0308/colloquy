import { Request, Response } from 'express';
import { ProblemDifficulty } from '../models/problem.model';
import { SubmissionStatus } from '../models/submission.model';
import * as submissionService from '../services/submission.service';
import ApiResponse from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import {
  buildPaginationMetadata,
  getPaginationParams,
} from '../utils/pagination';

/**
 * @desc    Create a new submission
 * @route   POST /api/v1/submissions
 * @access  Protected
 */
export const createSubmission = asyncHandler(
  async (req: Request, res: Response) => {
    const submission = await submissionService.createSubmission(
      req.body,
      req.user!.id
    );

    res
      .status(201)
      .json(
        new ApiResponse(201, submission, 'Submission created successfully')
      );
  }
);

/**
 * @desc    Get my submissions
 * @route   GET /api/v1/submissions/my
 * @access  Protected
 */
export const getMySubmissions = asyncHandler(
  async (req: Request, res: Response) => {
    const paginationParams = getPaginationParams(req.query);

    const filters = {
      problemId: req.query.problemId as string | undefined,
      difficulty: req.query.difficulty as ProblemDifficulty | undefined,
      tags: req.query.tags
        ? Array.isArray(req.query.tags)
          ? (req.query.tags as string[])
          : [req.query.tags as string]
        : undefined,
      search: req.query.search as string | undefined,
      status: req.query.status as SubmissionStatus | undefined,
    };

    const { submissions, total } = await submissionService.getMySubmissions(
      req.user!.id,
      filters,
      paginationParams
    );

    const pagination = buildPaginationMetadata(
      total,
      paginationParams.page,
      paginationParams.limit
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          submissions,
          'Submissions fetched successfully',
          pagination
        )
      );
  }
);

/**
 * @desc    Get all submissions (admin)
 * @route   GET /api/v1/submissions
 * @access  Admin
 */
export const getAllSubmissions = asyncHandler(
  async (req: Request, res: Response) => {
    const paginationParams = getPaginationParams(req.query);

    const filters = {
      problemId: req.query.problemId as string | undefined,
      status: req.query.status as SubmissionStatus | undefined,
    };

    const { submissions, total } = await submissionService.getAllSubmissions(
      filters,
      paginationParams
    );

    const pagination = buildPaginationMetadata(
      total,
      paginationParams.page,
      paginationParams.limit
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          submissions,
          'All submissions fetched successfully',
          pagination
        )
      );
  }
);

/**
 * @desc    Get submission by ID (admin)
 * @route   GET /api/v1/submissions/:id
 * @access  Admin
 */
export const getSubmissionById = asyncHandler(
  async (req: Request, res: Response) => {
    const submission = await submissionService.getSubmissionById(req.params.id);

    res
      .status(200)
      .json(
        new ApiResponse(200, submission, 'Submission fetched successfully')
      );
  }
);

/**
 * @desc    Get submissions by user (admin)
 * @route   GET /api/v1/submissions/user/:userId
 * @access  Admin
 */
export const getSubmissionsByUser = asyncHandler(
  async (req: Request, res: Response) => {
    const paginationParams = getPaginationParams(req.query);

    const { submissions, total } = await submissionService.getSubmissionsByUser(
      req.params.userId,
      paginationParams
    );

    const pagination = buildPaginationMetadata(
      total,
      paginationParams.page,
      paginationParams.limit
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          submissions,
          'User submissions fetched successfully',
          pagination
        )
      );
  }
);

/**
 * @desc    Delete submission (admin)
 * @route   DELETE /api/v1/submissions/:id
 * @access  Admin
 */
export const deleteSubmission = asyncHandler(
  async (req: Request, res: Response) => {
    await submissionService.deleteSubmission(req.params.id);

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Submission deleted successfully'));
  }
);

/**
 * @desc    Get submission statistics (admin)
 * @route   GET /api/v1/submissions/stats
 * @access  Admin
 */
export const getSubmissionStats = asyncHandler(
  async (req: Request, res: Response) => {
    const stats = await submissionService.getSubmissionStats();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          stats,
          'Submission statistics fetched successfully'
        )
      );
  }
);
