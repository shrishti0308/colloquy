import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import ApiError from '../utils/apiError';

export const validate = (
  schema: Joi.Schema,
  property: 'body' | 'query' | 'params' = 'body'
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Show all errors, not just first
      stripUnknown: true, // Remove fields not in schema
      convert: true, // Convert types (e.g., "123" → 123)
    });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      throw new ApiError(400, `Validation error: ${errors.join(', ')}`);
    }

    // Replace req[property] with validated & sanitized data
    if (property === 'query') {
      // req.query is read-only, so we need to redefine it
      Object.defineProperty(req, 'query', {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    } else {
      req[property] = value;
    }

    next();
  };
};
