import Joi from 'joi';
import { UserRole } from '../models/user.model';
import { paginationSchema } from './common.validator';

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
}).min(1); // At least one field must be present

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string()
    .required()
    .min(8)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    )
    .messages({
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
    })
    .invalid(Joi.ref('oldPassword'))
    .messages({
      'any.invalid': 'New password must be different from old password',
    }),
});

export const adminUpdateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().email().lowercase().trim().optional(),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .optional(),
}).min(1);

export const getUsersQuerySchema = paginationSchema;
