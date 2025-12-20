import Joi from 'joi';
import { UserRole } from '../models/user.model';

export const registerSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(100),
  email: Joi.string().required().email().lowercase().trim(),
  password: Joi.string()
    .required()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
    }),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional()
    .default(UserRole.USER),
});

export const loginSchema = Joi.object({
  email: Joi.string().required().email().lowercase().trim(),
  password: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().required().email().lowercase().trim(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string()
    .required()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
    }),
});
