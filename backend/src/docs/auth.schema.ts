export const RegisterBody = {
  type: 'object',
  required: ['name', 'email', 'password'],
  properties: {
    name: { type: 'string', example: 'John Doe' },
    email: { type: 'string', format: 'email', example: 'user@example.com' },
    password: { type: 'string', format: 'password', example: 'Password@123' },
  },
};

export const LoginBody = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email', example: 'user@example.com' },
    password: { type: 'string', format: 'password', example: 'Password@123' },
  },
};

export const ForgotPasswordBody = {
  type: 'object',
  required: ['email'],
  properties: {
    email: { type: 'string', format: 'email', example: 'user@example.com' },
  },
};

export const ResetPasswordBody = {
  type: 'object',
  required: ['token', 'newPassword'],
  properties: {
    token: { type: 'string', example: 'abc123...' },
    newPassword: {
      type: 'string',
      format: 'password',
      example: 'newStrongPassword456',
    },
  },
};
