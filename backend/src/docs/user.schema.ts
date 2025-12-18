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
