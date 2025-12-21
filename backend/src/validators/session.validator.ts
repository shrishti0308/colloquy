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
}).min(1);

export const sessionQuerySchema = Joi.object({
  visibility: Joi.string()
    .valid(...Object.values(SessionVisibility))
    .optional(),
  status: Joi.string()
    .valid(...Object.values(SessionStatus))
    .optional(),
});
