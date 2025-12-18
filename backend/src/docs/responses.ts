export const responses = {
  UnauthorizedError: {
    description: 'Unauthorized. Access token is missing or invalid.',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ApiError' },
      },
    },
  },
  ForbiddenError: {
    description:
      'Forbidden. User does not have the required role (e.g., not an Admin).',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ApiError' },
      },
    },
  },
  NotFoundError: {
    description: 'The requested resource was not found.',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ApiError' },
      },
    },
  },
  BadRequestError: {
    description: 'Bad Request. The request body or parameters are invalid.',
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ApiError' },
      },
    },
  },
};
