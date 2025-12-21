import { Request, Response } from 'express';
import { ProblemDifficulty } from '../models/problem.model';
import * as problemService from '../services/problem.service';
import ApiResponse from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * @desc    Create a new problem
 * @route   POST /api/v1/problems
 * @access  Interviewer/Admin
 */
export const createProblem = asyncHandler(
  async (req: Request, res: Response) => {
    const problem = await problemService.createProblem(
      req.body,
      req.user!.id,
      req.user!.email,
      req.user!.name,
      req.user!.role
    );

    res
      .status(201)
      .json(new ApiResponse(201, problem, 'Problem created successfully'));
  }
);

/**
 * @desc    Get all problems
 * @route   GET /api/v1/problems
 * @access  Protected
 */
export const getAllProblems = asyncHandler(
  async (req: Request, res: Response) => {
    const filters = {
      difficulty: req.query.difficulty as ProblemDifficulty | undefined,
      tags: req.query.tags
        ? Array.isArray(req.query.tags)
          ? (req.query.tags as string[])
          : [req.query.tags as string]
        : undefined,
      search: req.query.search as string | undefined,
    };

    const problems = await problemService.getAllProblems(req.user!.id, filters);

    res
      .status(200)
      .json(new ApiResponse(200, problems, 'Problems fetched successfully'));
  }
);

/**
 * @desc    Get default blank problem
 * @route   GET /api/v1/problems/default
 * @access  Protected
 */
export const getDefaultProblem = asyncHandler(
  async (req: Request, res: Response) => {
    const problem = problemService.getDefaultProblem();

    res
      .status(200)
      .json(
        new ApiResponse(200, problem, 'Default problem fetched successfully')
      );
  }
);

/**
 * @desc    Get problem by ID
 * @route   GET /api/v1/problems/:id
 * @access  Protected
 */
export const getProblemById = asyncHandler(
  async (req: Request, res: Response) => {
    const problem = await problemService.getProblemById(
      req.params.id,
      req.user!.id
    );

    res
      .status(200)
      .json(new ApiResponse(200, problem, 'Problem fetched successfully'));
  }
);

/**
 * @desc    Update problem by ID
 * @route   PUT /api/v1/problems/:id
 * @access  Interviewer/Admin
 */
export const updateProblem = asyncHandler(
  async (req: Request, res: Response) => {
    const problem = await problemService.updateProblem(
      req.params.id,
      req.body,
      req.user!.id,
      req.user!.role
    );

    res
      .status(200)
      .json(new ApiResponse(200, problem, 'Problem updated successfully'));
  }
);

/**
 * @desc    Delete problem by ID
 * @route   DELETE /api/v1/problems/:id
 * @access  Interviewer/Admin
 */
export const deleteProblem = asyncHandler(
  async (req: Request, res: Response) => {
    await problemService.deleteProblem(
      req.params.id,
      req.user!.id,
      req.user!.email,
      req.user!.name,
      req.user!.role
    );

    res
      .status(200)
      .json(new ApiResponse(200, null, 'Problem deleted successfully'));
  }
);

/**
 * @desc    Toggle problem visibility
 * @route   PUT /api/v1/problems/:id/toggle-visibility
 * @access  Interviewer/Admin
 */
export const toggleVisibility = asyncHandler(
  async (req: Request, res: Response) => {
    const problem = await problemService.toggleVisibility(
      req.params.id,
      req.user!.id,
      req.user!.role
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, problem, 'Problem visibility toggled successfully')
      );
  }
);

/**
 * @desc    Get my created problems
 * @route   GET /api/v1/problems/my
 * @access  Interviewer/Admin
 */
export const getMyProblems = asyncHandler(
  async (req: Request, res: Response) => {
    const problems = await problemService.getMyProblems(req.user!.id);

    res
      .status(200)
      .json(
        new ApiResponse(200, problems, 'Your problems fetched successfully')
      );
  }
);
