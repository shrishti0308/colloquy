import Joi from 'joi';
import {
  ProblemDifficulty,
  ProgrammingLanguage,
} from '../models/problem.model';

export const createProblemSchema = Joi.object({
  title: Joi.string().required().min(3).max(200).trim(),
  description: Joi.string().required().min(10),
  difficulty: Joi.string()
    .valid(...Object.values(ProblemDifficulty))
    .required(),
  languageTemplates: Joi.array()
    .items(
      Joi.object({
        language: Joi.string()
          .valid(...Object.values(ProgrammingLanguage))
          .required(),
        starterCode: Joi.string().required(),
      })
    )
    .min(1)
    .required(),
  testCases: Joi.array()
    .items(
      Joi.object({
        input: Joi.string().required(),
        expectedOutput: Joi.string().required(),
        explanation: Joi.string().optional().allow(''),
        isHidden: Joi.boolean().required(),
      })
    )
    .min(1)
    .required(),
  constraints: Joi.array().items(Joi.string()).optional(),
  hints: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
});

export const updateProblemSchema = Joi.object({
  title: Joi.string().min(3).max(200).trim().optional(),
  description: Joi.string().min(10).optional(),
  difficulty: Joi.string()
    .valid(...Object.values(ProblemDifficulty))
    .optional(),
  languageTemplates: Joi.array()
    .items(
      Joi.object({
        language: Joi.string()
          .valid(...Object.values(ProgrammingLanguage))
          .required(),
        starterCode: Joi.string().required(),
      })
    )
    .min(1)
    .optional(),
  testCases: Joi.array()
    .items(
      Joi.object({
        input: Joi.string().required(),
        expectedOutput: Joi.string().required(),
        explanation: Joi.string().optional().allow(''),
        isHidden: Joi.boolean().required(),
      })
    )
    .min(1)
    .optional(),
  constraints: Joi.array().items(Joi.string()).optional(),
  hints: Joi.array().items(Joi.string()).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
}).min(1);

export const problemQuerySchema = Joi.object({
  difficulty: Joi.string()
    .valid(...Object.values(ProblemDifficulty))
    .optional(),
  tags: Joi.alternatives()
    .try(Joi.string(), Joi.array().items(Joi.string()))
    .optional(),
  search: Joi.string().optional(),
});
