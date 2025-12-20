export const ProblemSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    title: {
      type: 'string',
      example: 'Two Sum',
    },
    description: {
      type: 'string',
      example: 'Find two numbers that add up to target...',
    },
    difficulty: {
      type: 'string',
      enum: ['easy', 'medium', 'hard'],
      example: 'easy',
    },
    visibility: {
      type: 'string',
      enum: ['public', 'private'],
      example: 'public',
    },
    createdBy: {
      type: 'string',
      example: 'user-id-123',
    },
    languageTemplates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
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
          starterCode: {
            type: 'string',
            example:
              'def two_sum(nums, target):\n    # Write your solution here\n    pass',
          },
        },
      },
    },
    testCases: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          input: {
            type: 'string',
            example: 'nums = [2,7,11,15], target = 9',
          },
          expectedOutput: {
            type: 'string',
            example: '[0, 1]',
          },
          explanation: {
            type: 'string',
            example: 'Because nums[0] + nums[1] = 9',
          },
          isHidden: {
            type: 'boolean',
            example: false,
          },
        },
      },
    },
    constraints: {
      type: 'array',
      items: {
        type: 'string',
      },
      example: ['2 <= nums.length <= 10^4', '−10^9 <= nums[i] <= 10^9'],
    },
    hints: {
      type: 'array',
      items: {
        type: 'string',
      },
      example: ['Use a hash map', 'Think O(n) time complexity'],
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
      },
      example: ['array', 'hash-table', 'two-pointers'],
    },
    usageCount: {
      type: 'number',
      example: 42,
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

export const CreateProblemBody = {
  type: 'object',
  required: [
    'title',
    'description',
    'difficulty',
    'languageTemplates',
    'testCases',
  ],
  properties: {
    title: {
      type: 'string',
      example: 'Two Sum',
      minLength: 3,
      maxLength: 200,
    },
    description: {
      type: 'string',
      example: '# Two Sum\n\nGiven an array of integers...',
    },
    difficulty: {
      type: 'string',
      enum: ['easy', 'medium', 'hard'],
      example: 'easy',
    },
    languageTemplates: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['language', 'starterCode'],
        properties: {
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
          },
          starterCode: {
            type: 'string',
          },
        },
      },
    },
    testCases: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['input', 'expectedOutput', 'isHidden'],
        properties: {
          input: {
            type: 'string',
          },
          expectedOutput: {
            type: 'string',
          },
          explanation: {
            type: 'string',
          },
          isHidden: {
            type: 'boolean',
          },
        },
      },
    },
    constraints: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    hints: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};

export const UpdateProblemBody = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      minLength: 3,
      maxLength: 200,
    },
    description: {
      type: 'string',
    },
    difficulty: {
      type: 'string',
      enum: ['easy', 'medium', 'hard'],
    },
    languageTemplates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          language: {
            type: 'string',
          },
          starterCode: {
            type: 'string',
          },
        },
      },
    },
    testCases: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          input: {
            type: 'string',
          },
          expectedOutput: {
            type: 'string',
          },
          explanation: {
            type: 'string',
          },
          isHidden: {
            type: 'boolean',
          },
        },
      },
    },
    constraints: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    hints: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};
