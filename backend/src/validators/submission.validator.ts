import Joi from 'joi';
import {
  ProblemDifficulty,
  ProgrammingLanguage,
} from '../models/problem.model';
import { SubmissionStatus } from '../models/submission.model';
import { paginationSchema } from './common.validator';

export const createSubmissionSchema = Joi.object({
  problemId: Joi.string().required(),
  code: Joi.string().required().min(1),
  language: Joi.string()
    .valid(...Object.values(ProgrammingLanguage))
    .required(),
  totalTestCases: Joi.number().integer().min(0).required(),
  passedTestCases: Joi.number().integer().min(0).required(),
  failedTestCases: Joi.number().integer().min(0).required(),
  status: Joi.string()
    .valid(...Object.values(SubmissionStatus))
    .required(),
});

export const submissionQuerySchema = Joi.object({
  problemId: Joi.string().optional(),
  difficulty: Joi.string()
    .valid(...Object.values(ProblemDifficulty))
    .optional(),
  tags: Joi.alternatives()
    .try(Joi.string(), Joi.array().items(Joi.string()))
    .optional(),
  search: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(SubmissionStatus))
    .optional(),
}).concat(paginationSchema);

export const adminSubmissionQuerySchema = Joi.object({
  problemId: Joi.string().optional(),
  status: Joi.string()
    .valid(...Object.values(SubmissionStatus))
    .optional(),
}).concat(paginationSchema);
