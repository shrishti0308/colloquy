import { inngest } from '../config/inngest';
import ProblemModel, {
  IProblem,
  ProblemDifficulty,
  ProblemVisibility,
  ProgrammingLanguage,
} from '../models/problem.model';
import { UserRole } from '../models/user.model';
import ApiError from '../utils/apiError';
import logger from '../utils/logger';

interface CreateProblemData {
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  languageTemplates: Array<{
    language: ProgrammingLanguage;
    starterCode: string;
  }>;
  testCases: Array<{
    input: string;
    expectedOutput: string;
    explanation?: string;
    isHidden: boolean;
  }>;
  constraints?: string[];
  hints?: string[];
  tags?: string[];
}

interface ProblemFilters {
  difficulty?: ProblemDifficulty;
  tags?: string[];
  search?: string;
}

/**
 * Get the hardcoded default blank problem.
 * @returns The default blank problem object
 */
export const getDefaultProblem = (): IProblem => {
  return {
    id: 'default-blank-problem',
    title: 'Blank Canvas',
    description: `# Freeform Coding Space

Use this space for:
- Quick coding exercises
- Algorithm discussions
- Code review
- Technical assessments
- Any other purpose

**No specific problem requirements - just start coding!**`,
    difficulty: ProblemDifficulty.EASY,
    visibility: ProblemVisibility.PUBLIC,
    createdBy: 'system' as any,
    languageTemplates: [
      {
        language: ProgrammingLanguage.C,
        starterCode: `#include <stdio.h>

int main() {
    // Write your code here
    
    return 0;
}`,
      },
      {
        language: ProgrammingLanguage.CPP,
        starterCode: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    
    return 0;
}`,
      },
      {
        language: ProgrammingLanguage.PYTHON,
        starterCode: `def solution():
    # Write your code here
    pass

if __name__ == "__main__":
    solution()`,
      },
      {
        language: ProgrammingLanguage.JAVA,
        starterCode: `public class Solution {
    public static void main(String[] args) {
        // Write your code here
        
    }
}`,
      },
      {
        language: ProgrammingLanguage.JAVASCRIPT,
        starterCode: `function solution() {
    // Write your code here
}

// Test your solution
solution();`,
      },
      {
        language: ProgrammingLanguage.TYPESCRIPT,
        starterCode: `function solution(): void {
    // Write your code here
}

// Test your solution
solution();`,
      },
      {
        language: ProgrammingLanguage.GO,
        starterCode: `package main

import "fmt"
import { model } from 'mongoose';

func main() {
    // Write your code here
    
}`,
      },
      {
        language: ProgrammingLanguage.RUST,
        starterCode: `fn main() {
    // Write your code here
    
}`,
      },
    ],
    testCases: [],
    constraints: [],
    hints: [],
    tags: [],
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as IProblem;
};

/**
 * Create a new problem.
 * @param problemData - Problem details including title, description, difficulty, templates, and test cases
 * @param userId - ID of the user creating the problem
 * @param userRole - Role of the user creating the problem
 * @returns The created problem object
 */
export const createProblem = async (
  problemData: CreateProblemData,
  userId: string,
  userRole: UserRole
): Promise<IProblem> => {
  // Set visibility based on user role
  const visibility =
    userRole === UserRole.ADMIN
      ? ProblemVisibility.PUBLIC
      : ProblemVisibility.PRIVATE;

  const problem = await ProblemModel.create({
    ...problemData,
    createdBy: userId,
    visibility,
    usageCount: 0,
  });

  // Emit event
  try {
    await inngest.send({
      name: 'colloquy/problem.created',
      data: {
        problemId: problem.id,
        title: problem.title,
        createdBy: userId,
        visibility,
      },
    });
    logger.info(`[Inngest] Event sent for problem creation: ${problem.id}`);
  } catch (error) {
    logger.error(`[Inngest] Failed to send problem creation event: ${error}`);
  }

  return problem;
};

/**
 * Get all problems accessible to user.
 * @param userId - ID of the user requesting problems
 * @param filters - Optional filters for difficulty, tags, and search
 * @returns Array of problems accessible to the user
 */
export const getAllProblems = async (
  userId: string,
  filters: ProblemFilters = {}
): Promise<IProblem[]> => {
  const query: any = {
    $or: [
      { visibility: ProblemVisibility.PUBLIC },
      { visibility: ProblemVisibility.PRIVATE, createdBy: userId },
    ],
  };

  // Apply difficulty filter
  if (filters.difficulty) {
    query.difficulty = filters.difficulty;
  }

  // Apply tags filter
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  // Apply search filter
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const problems = await ProblemModel.find(query)
    .populate({
      model: 'User',
      path: 'createdBy',
      foreignField: 'id',
      select: 'id name email',
    })
    .sort({ usageCount: -1, createdAt: -1 })
    .exec();

  return problems;
};

/**
 * Get problem by ID.
 * @param problemId - ID of the problem to retrieve
 * @param userId - ID of the user requesting the problem
 * @returns The requested problem object
 */
export const getProblemById = async (
  problemId: string,
  userId: string
): Promise<IProblem> => {
  // Handle default problem
  if (problemId === 'default-blank-problem') {
    return getDefaultProblem();
  }

  const problem = await ProblemModel.findOne({ id: problemId })
    .populate({
      model: 'User',
      path: 'createdBy',
      foreignField: 'id',
      select: 'id name email',
    })
    .exec();

  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }

  // Check access permissions
  if (
    problem.visibility === ProblemVisibility.PRIVATE &&
    problem.createdBy !== userId
  ) {
    throw new ApiError(403, 'You do not have access to this problem');
  }

  return problem;
};

/**
 * Update problem by ID.
 * @param problemId - ID of the problem to update
 * @param updateData - Partial problem data to update
 * @param userId - ID of the user updating the problem
 * @param userRole - Role of the user updating the problem
 * @returns The updated problem object
 */
export const updateProblem = async (
  problemId: string,
  updateData: Partial<CreateProblemData>,
  userId: string,
  userRole: UserRole
): Promise<IProblem> => {
  const problem = await ProblemModel.findOne({ id: problemId });

  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }

  // Check ownership
  if (problem.createdBy !== userId && userRole !== UserRole.ADMIN) {
    throw new ApiError(403, 'You can only update your own problems');
  }

  // Apply updates
  Object.assign(problem, updateData);
  await problem.save();

  return problem;
};

/**
 * Delete problem by ID (soft delete).
 * @param problemId - ID of the problem to delete
 * @param userId - ID of the user deleting the problem
 * @param userRole - Role of the user deleting the problem
 * @returns Void
 */
export const deleteProblem = async (
  problemId: string,
  userId: string,
  userRole: UserRole
): Promise<void> => {
  const problem = await ProblemModel.findOne({ id: problemId });

  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }

  // Check ownership
  if (problem.createdBy !== userId && userRole !== UserRole.ADMIN) {
    throw new ApiError(403, 'You can only delete your own problems');
  }

  // Check if problem is used in any active sessions (future check)
  // TODO: Add session check when session model is implemented

  await problem.delete();

  // Emit event
  try {
    await inngest.send({
      name: 'colloquy/problem.deleted',
      data: {
        problemId: problem.id,
        title: problem.title,
        deletedBy: userId,
      },
    });
    logger.info(`[Inngest] Event sent for problem deletion: ${problem.id}`);
  } catch (error) {
    logger.error(`[Inngest] Failed to send problem deletion event: ${error}`);
  }
};

/**
 * Toggle problem visibility (interviewer only).
 * @param problemId - ID of the problem to toggle visibility
 * @param userId - ID of the user toggling visibility
 * @param userRole - Role of the user toggling visibility
 * @returns The updated problem object
 */
export const toggleVisibility = async (
  problemId: string,
  userId: string,
  userRole: UserRole
): Promise<IProblem> => {
  const problem = await ProblemModel.findOne({ id: problemId });

  if (!problem) {
    throw new ApiError(404, 'Problem not found');
  }

  // Check ownership
  if (problem.createdBy !== userId && userRole !== UserRole.ADMIN) {
    throw new ApiError(
      403,
      'You can only toggle visibility of your own problems'
    );
  }

  // Toggle visibility
  problem.visibility =
    problem.visibility === ProblemVisibility.PUBLIC
      ? ProblemVisibility.PRIVATE
      : ProblemVisibility.PUBLIC;

  await problem.save();

  return problem;
};

/**
 * Get problems created by current user.
 * @param userId - ID of the user whose problems to retrieve
 * @returns Array of problems created by the user
 */
export const getMyProblems = async (userId: string): Promise<IProblem[]> => {
  const problems = await ProblemModel.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .exec();

  return problems;
};

/**
 * Increment usage count (called when problem is added to session).
 * @param problemId - ID of the problem to increment usage count
 * @returns Void
 */
export const incrementUsageCount = async (problemId: string): Promise<void> => {
  // Skip for default problem
  if (problemId === 'default-blank-problem') {
    return;
  }

  await ProblemModel.updateOne({ id: problemId }, { $inc: { usageCount: 1 } });
};
