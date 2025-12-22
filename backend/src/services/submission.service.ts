import ProblemModel, {
  ProblemDifficulty,
  ProblemVisibility,
} from '../models/problem.model';
import SubmissionModel, {
  ISubmission,
  SubmissionStatus,
} from '../models/submission.model';
import ApiError from '../utils/apiError';

interface CreateSubmissionData {
  problemId: string;
  code: string;
  language: string;
  totalTestCases: number;
  passedTestCases: number;
  failedTestCases: number;
  status: SubmissionStatus;
}

interface SubmissionFilters {
  problemId?: string;
  difficulty?: ProblemDifficulty;
  tags?: string[];
  search?: string;
  status?: SubmissionStatus;
}

const DEFAULT_BLANK_PROBLEM_ID = 'default-blank-problem';

/**
 * Create a new submission.
 * @param submissionData - Submission details including problemId, code, language, and results
 * @param userId - ID of the user creating the submission
 * @returns The created submission object
 */
export const createSubmission = async (
  submissionData: CreateSubmissionData,
  userId: string
): Promise<ISubmission> => {
  const {
    problemId,
    code,
    language,
    totalTestCases,
    passedTestCases,
    failedTestCases,
    status,
  } = submissionData;

  // Check if problem exists and user has access (skip for default problem)
  if (problemId !== DEFAULT_BLANK_PROBLEM_ID) {
    const problem = await ProblemModel.findOne({ id: problemId });

    if (!problem) {
      throw new ApiError(404, 'Problem not found');
    }

    if (
      problem.visibility === ProblemVisibility.PRIVATE &&
      problem.createdBy !== userId
    ) {
      throw new ApiError(403, 'You do not have access to this problem');
    }
  }

  // Create submission
  const submission = await SubmissionModel.create({
    userId,
    problemId,
    code,
    language,
    totalTestCases,
    passedTestCases,
    failedTestCases,
    status,
  });

  // Increment problem attempt count
  await ProblemModel.updateOne({ id: problemId }, { $inc: { usageCount: 1 } });

  return submission;
};

/**
 * Get all submissions for current user with filters.
 * @param userId - ID of the user whose submissions to retrieve
 * @param filters - Optional filters for problemId, difficulty, tags, search, and status
 * @returns Array of submissions
 */
export const getMySubmissions = async (
  userId: string,
  filters: SubmissionFilters = {}
): Promise<ISubmission[]> => {
  const { problemId, difficulty, tags, search, status } = filters;

  const problemFilter: any = {};

  if (difficulty) {
    problemFilter.difficulty = difficulty;
  }

  if (tags && tags.length > 0) {
    problemFilter.tags = { $in: tags };
  }

  if (search) {
    problemFilter.title = { $regex: search, $options: 'i' };
  }

  let problemIds: string[] | undefined;
  if (Object.keys(problemFilter).length > 0) {
    const problems = await ProblemModel.find(problemFilter).select('id');
    problemIds = problems.map((p) => p.id);

    if (problemIds.length === 0) {
      return [];
    }
  }

  const submissionFilter: any = { userId };

  if (problemId) {
    submissionFilter.problemId = problemId;
  } else if (problemIds) {
    submissionFilter.problemId = { $in: problemIds };
  }

  if (status) {
    submissionFilter.status = status;
  }

  const submissions = await SubmissionModel.find(submissionFilter)
    .populate({
      model: 'Problem',
      path: 'problemId',
      foreignField: 'id',
      select: 'id title tags difficulty',
    })
    .sort({
      createdAt: -1,
    });

  return submissions;
};

/**
 * Get all submissions (admin only).
 * @param filters - Optional filters
 * @returns Array of submissions
 */
export const getAllSubmissions = async (
  filters: SubmissionFilters = {}
): Promise<ISubmission[]> => {
  const { problemId, status } = filters;

  const filter: any = {};

  if (problemId) {
    filter.problemId = problemId;
  }

  if (status) {
    filter.status = status;
  }

  const submissions = await SubmissionModel.find(filter)
    .populate({
      model: 'User',
      path: 'userId',
      foreignField: 'id',
      select: 'id name email',
    })
    .populate({
      model: 'Problem',
      path: 'problemId',
      foreignField: 'id',
      select: 'id title tags difficulty',
    })
    .sort({
      createdAt: -1,
    });

  return submissions;
};

/**
 * Get submission by ID (admin only).
 * @param submissionId - ID of the submission
 * @returns The submission object
 */
export const getSubmissionById = async (
  submissionId: string
): Promise<ISubmission> => {
  const submission = await SubmissionModel.findOne({ id: submissionId });

  if (!submission) {
    throw new ApiError(404, 'Submission not found');
  }

  return submission;
};

/**
 * Get all submissions for a user (admin only).
 * @param userId - ID of the user
 * @returns Array of submissions
 */
export const getSubmissionsByUser = async (
  userId: string
): Promise<ISubmission[]> => {
  const submissions = await SubmissionModel.find({ userId })
    .populate({
      model: 'User',
      path: 'userId',
      foreignField: 'id',
      select: 'id name email',
    })
    .populate({
      model: 'Problem',
      path: 'problemId',
      foreignField: 'id',
      select: 'id title tags difficulty',
    })
    .sort({
      createdAt: -1,
    });

  return submissions;
};

/**
 * Delete submission by ID (admin only).
 * @param submissionId - ID of the submission to delete
 * @returns Void
 */
export const deleteSubmission = async (submissionId: string): Promise<void> => {
  const submission = await SubmissionModel.findOne({ id: submissionId });

  if (!submission) {
    throw new ApiError(404, 'Submission not found');
  }

  await submission.delete();
};

/**
 * Get submission statistics (admin only).
 * @returns Statistics object
 */
export const getSubmissionStats = async () => {
  const totalSubmissions = await SubmissionModel.countDocuments();

  const statusCounts = await SubmissionModel.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const topProblems = await SubmissionModel.aggregate([
    {
      $group: {
        _id: '$problemId',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const languageCounts = await SubmissionModel.aggregate([
    {
      $group: {
        _id: '$language',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return {
    totalSubmissions,
    statusCounts,
    topProblems,
    languageCounts,
  };
};
