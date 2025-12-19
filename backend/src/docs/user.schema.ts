export const UserSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
    name: { type: 'string', example: 'John Doe' },
    email: {
      type: 'string',
      format: 'email',
      pattern: '.+@.+\\..+',
      example: 'user@example.com',
    },
    role: {
      type: 'string',
      enum: ['user', 'interviewer', 'admin'],
      example: 'user',
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

export const UpdateProfileBody = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      example: 'Jane Doe',
    },
  },
};

export const ChangePasswordBody = {
  type: 'object',
  required: ['oldPassword', 'newPassword'],
  properties: {
    oldPassword: {
      type: 'string',
      format: 'password',
      example: 'currentPassword@123',
    },
    newPassword: {
      type: 'string',
      format: 'password',
      example: 'newStrongPassword@456',
    },
  },
};

export const AdminUpdateUserBody = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      example: 'Updated Name',
    },
    email: {
      type: 'string',
      format: 'email',
      pattern: '.+@.+\\..+',
      example: 'user@example.com',
    },
    role: {
      type: 'string',
      enum: ['user', 'admin'],
      example: 'admin',
    },
  },
};
