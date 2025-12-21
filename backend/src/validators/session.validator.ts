import Joi from 'joi';
import { SessionStatus, SessionVisibility } from '../models/session.model';

export const createSessionSchema = Joi.object({
  title: Joi.string().required().min(3).max(200).trim(),
  description: Joi.string().optional().max(1000).trim().allow(''),
  visibility: Joi.string()
    .valid(...Object.values(SessionVisibility))
    .required(),
  passcode: Joi.string().when('visibility', {
    is: SessionVisibility.PRIVATE,
    then: Joi.string().required().min(4).max(20),
    otherwise: Joi.forbidden(),
  }),
  maxParticipants: Joi.number().integer().min(1).max(50).default(1),
  problems: Joi.array().items(Joi.string()).default([]),
  recordingEnabled: Joi.boolean().default(false),
  scheduledFor: Joi.date().greater('now').optional(),
});

export const updateSessionSchema = Joi.object({
  title: Joi.string().min(3).max(200).trim().optional(),
  description: Joi.string().max(1000).trim().allow('').optional(),
  visibility: Joi.string()
    .valid(...Object.values(SessionVisibility))
    .optional(),
  passcode: Joi.string().min(4).max(20).optional(),
  maxParticipants: Joi.number().integer().min(1).max(50).optional(),
  problems: Joi.array().items(Joi.string()).optional(),
  recordingEnabled: Joi.boolean().optional(),
  scheduledFor: Joi.date().greater('now').optional(),
  status: Joi.string()
    .optional()
    .valid(...Object.values(SessionStatus)),
  reason: Joi.string().optional().max(500).trim(),
}).min(1);

export const sessionQuerySchema = Joi.object({
  visibility: Joi.string()
    .valid(...Object.values(SessionVisibility))
    .optional(),
  status: Joi.string()
    .valid(...Object.values(SessionStatus))
    .optional(),
});

export const joinSessionSchema = Joi.object({
  passcode: Joi.string().min(4).max(20).optional(),
});

export const inviteParticipantsSchema = Joi.object({
  emails: Joi.array()
    .items(Joi.string().email())
    .min(1)
    .max(10) // Max 10 invites per request
    .required(),
});

export const submitCodeSchema = Joi.object({
  problemId: Joi.string().required(), // NEW
  language: Joi.string().required().trim(),
  code: Joi.string().required().min(1),
  notes: Joi.string().optional().max(500).trim(),
});

export const addFeedbackSchema = Joi.object({
  score: Joi.number().min(0).max(100).optional(),
  feedback: Joi.string().max(2000).trim().optional(),
  strengths: Joi.array().items(Joi.string().trim()).optional(),
  improvements: Joi.array().items(Joi.string().trim()).optional(),
}).min(1);
