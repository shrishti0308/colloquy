import Joi from 'joi';

export const logValidator = {
  logFrontendError: Joi.object({
    level: Joi.string().valid('error', 'warn', 'info').required(),
    message: Joi.string().required(),
    context: Joi.string().optional(),
    details: Joi.any().optional(),
    stack: Joi.string().optional(),
    userAgent: Joi.string().optional(),
    url: Joi.string().optional(),
    timestamp: Joi.string().isoDate().required(),
  }),
};
