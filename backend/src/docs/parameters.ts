export const parameters = {
  UserId: {
    name: 'id',
    in: 'path',
    description: 'UUID of the user',
    required: true,
    schema: {
      type: 'string',
      format: 'uuid',
      example: '123e4567-e..',
    },
  },
  ProblemId: {
    name: 'id',
    in: 'path',
    description: 'UUID of the problem',
    required: true,
    schema: {
      type: 'string',
      format: 'uuid',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
  },
  ProblemDifficulty: {
    name: 'difficulty',
    in: 'query',
    description: 'Filter problems by difficulty level',
    required: false,
    schema: {
      type: 'string',
      enum: ['easy', 'medium', 'hard'],
    },
  },
  ProblemTags: {
    name: 'tags',
    in: 'query',
    description: 'Filter problems by tags (can be array or single value)',
    required: false,
    schema: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    style: 'form',
    explode: true,
  },
  SearchQuery: {
    name: 'search',
    in: 'query',
    description: 'Search in problem title',
    required: false,
    schema: {
      type: 'string',
      example: 'two sum',
    },
  },
  SessionId: {
    name: 'id',
    in: 'path',
    description: 'UUID of the session',
    required: true,
    schema: {
      type: 'string',
      format: 'uuid',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
  },
  FeedbackUserId: {
    name: 'userId',
    in: 'path',
    description: 'UUID of the user to provide feedback for',
    required: true,
    schema: {
      type: 'string',
      format: 'uuid',
      example: '123e4567-e89b-12d3-a456-426614174001',
    },
  },
  SessionVisibility: {
    name: 'visibility',
    in: 'query',
    description: 'Filter sessions by visibility',
    required: false,
    schema: {
      type: 'string',
      enum: ['public', 'private'],
    },
  },
  SessionStatus: {
    name: 'status',
    in: 'query',
    description: 'Filter sessions by status',
    required: false,
    schema: {
      type: 'string',
      enum: ['scheduled', 'waiting', 'active', 'completed', 'cancelled'],
    },
  },
};
