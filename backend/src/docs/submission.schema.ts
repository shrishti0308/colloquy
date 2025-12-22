export const SubmissionSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    userId: {
      type: 'string',
      example: 'user-id-123',
    },
    problemId: {
      type: 'string',
      example: '123e4567-e89b-12d3-a456-426614174001',
    },
    code: {
      type: 'string',
      example: 'def two_sum(nums, target):\n    return [0, 1]',
    },
    language: {
      type: 'string',
      enum: [
        'c',
        'cpp',
        'python',
        'java',
        'javascript',
        'typescript',
        'go',
        'rust',
      ],
      example: 'python',
    },
    totalTestCases: {
      type: 'number',
      example: 10,
    },
    passedTestCases: {
      type: 'number',
      example: 8,
    },
    failedTestCases: {
      type: 'number',
      example: 2,
    },
    status: {
      type: 'string',
      enum: ['pass', 'partial', 'fail', 'error'],
      example: 'partial',
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
    },
  },
};

export const CreateSubmissionBody = {
  type: 'object',
  required: [
    'problemId',
    'code',
    'language',
    'totalTestCases',
    'passedTestCases',
    'failedTestCases',
    'status',
  ],
  properties: {
    problemId: {
      type: 'string',
      example: '123e4567-e89b-12d3-a456-426614174001',
    },
    code: {
      type: 'string',
      example: 'def two_sum(nums, target):\n    hash_map = {}\n    ...',
    },
    language: {
      type: 'string',
      enum: [
        'c',
        'cpp',
        'python',
        'java',
        'javascript',
        'typescript',
        'go',
        'rust',
      ],
      example: 'python',
    },
    totalTestCases: {
      type: 'number',
      minimum: 0,
      example: 10,
    },
    passedTestCases: {
      type: 'number',
      minimum: 0,
      example: 8,
    },
    failedTestCases: {
      type: 'number',
      minimum: 0,
      example: 2,
    },
    status: {
      type: 'string',
      enum: ['pass', 'partial', 'fail', 'error'],
      example: 'partial',
    },
  },
};
