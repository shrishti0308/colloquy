export const SessionSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: '123e4567-e89b-12d3-a456-426614174000',
    },
    title: {
      type: 'string',
      example: 'Technical Interview - Backend Role',
    },
    description: {
      type: 'string',
      example: 'Senior Backend Engineer position interview',
    },
    visibility: {
      type: 'string',
      enum: ['public', 'private'],
      example: 'public',
    },
    hasPasscode: {
      // NEW
      type: 'boolean',
      description: 'Indicates if session requires a passcode',
      example: false,
    },
    hostId: {
      type: 'string',
      example: 'user-id-123',
    },
    participants: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
          },
          joinedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true, // NEW
          },
          invitedAt: {
            // NEW
            type: 'string',
            format: 'date-time',
          },
          invitationStatus: {
            // NEW
            type: 'string',
            enum: ['pending', 'accepted'],
          },
          leftAt: {
            type: 'string',
            format: 'date-time',
          },
          submittedCode: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                problemId: {
                  type: 'string',
                  example: 'problem-id-1',
                },
                language: {
                  type: 'string',
                },
                code: {
                  type: 'string',
                },
                submittedAt: {
                  type: 'string',
                  format: 'date-time',
                },
                notes: {
                  type: 'string',
                },
              },
            },
          },
          score: {
            type: 'number',
            example: 85,
          },
          feedback: {
            type: 'string',
          },
          strengths: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          improvements: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
    },
    maxParticipants: {
      type: 'number',
      example: 1,
    },
    problems: {
      type: 'array',
      items: {
        type: 'string',
      },
      example: ['default-blank-problem', 'problem-id-1', 'problem-id-2'],
    },
    streamCallId: {
      type: 'string',
      example: 'session_1234567890_abc123',
    },
    streamChannelId: {
      type: 'string',
      example: 'session_1234567890_abc123',
    },
    recordingEnabled: {
      type: 'boolean',
      example: false,
    },
    recordingUrl: {
      type: 'string',
      example: 'https://stream.io/recordings/...',
    },
    chatLogs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
          },
          userName: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
    },
    status: {
      type: 'string',
      enum: ['scheduled', 'waiting', 'active', 'completed', 'cancelled'],
      example: 'waiting',
    },
    scheduledFor: {
      type: 'string',
      format: 'date-time',
    },
    startedAt: {
      type: 'string',
      format: 'date-time',
    },
    endedAt: {
      type: 'string',
      format: 'date-time',
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

export const CreateSessionBody = {
  type: 'object',
  required: ['title', 'visibility'],
  properties: {
    title: {
      type: 'string',
      example: 'Technical Interview - Backend Role',
      minLength: 3,
      maxLength: 200,
    },
    description: {
      type: 'string',
      example: 'Senior Backend Engineer position interview',
      maxLength: 1000,
    },
    visibility: {
      type: 'string',
      enum: ['public', 'private'],
      example: 'public',
    },
    passcode: {
      type: 'string',
      description: 'Required if visibility is private',
      minLength: 4,
      maxLength: 20,
      example: 'secret123',
    },
    maxParticipants: {
      type: 'number',
      default: 1,
      minimum: 1,
      maximum: 50,
      example: 1,
    },
    problems: {
      type: 'array',
      items: {
        type: 'string',
      },
      default: [],
      example: ['problem-id-1', 'problem-id-2'],
    },
    recordingEnabled: {
      type: 'boolean',
      default: false,
      example: false,
    },
    scheduledFor: {
      type: 'string',
      format: 'date-time',
      description: 'Must be in the future',
      example: '2025-12-25T10:00:00.000Z',
    },
  },
};

export const UpdateSessionBody = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      minLength: 3,
      maxLength: 200,
    },
    description: {
      type: 'string',
      maxLength: 1000,
    },
    visibility: {
      type: 'string',
      enum: ['public', 'private'],
    },
    passcode: {
      type: 'string',
      minLength: 4,
      maxLength: 20,
    },
    maxParticipants: {
      type: 'number',
      minimum: 1,
      maximum: 50,
    },
    problems: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    recordingEnabled: {
      type: 'boolean',
    },
    scheduledFor: {
      type: 'string',
      format: 'date-time',
    },
    status: {
      type: 'string',
      enum: ['scheduled', 'waiting', 'active', 'completed', 'cancelled'],
    },
    reason: {
      type: 'string',
      maxLength: 500,
      description: 'Reason for status change, required if cancelling',
    },
  },
};

export const JoinSessionBody = {
  type: 'object',
  properties: {
    passcode: {
      type: 'string',
      description: 'Required for private sessions',
      minLength: 4,
      maxLength: 20,
      example: 'secret123',
    },
  },
};

export const InviteParticipantsBody = {
  type: 'object',
  required: ['emails'],
  properties: {
    emails: {
      type: 'array',
      items: {
        type: 'string',
        format: 'email',
      },
      minItems: 1,
      maxItems: 10,
      example: ['candidate@example.com', 'another@example.com'],
    },
  },
};

export const SubmitCodeBody = {
  type: 'object',
  required: ['language', 'code'],
  properties: {
    problemId: {
      type: 'string',
      example: 'two-sum-problem-id',
      description: 'ID of the problem being solved',
    },
    language: {
      type: 'string',
      example: 'javascript',
    },
    code: {
      type: 'string',
      example: 'function twoSum(nums, target) { ... }',
    },
    notes: {
      type: 'string',
      maxLength: 500,
      example: 'Used hash map approach for O(n) complexity',
    },
  },
};

export const AddFeedbackBody = {
  type: 'object',
  properties: {
    score: {
      type: 'number',
      minimum: 0,
      maximum: 100,
      example: 85,
    },
    feedback: {
      type: 'string',
      maxLength: 2000,
      example: 'Great problem-solving skills and clear communication',
    },
    strengths: {
      type: 'array',
      items: {
        type: 'string',
      },
      example: [
        'Clear communication',
        'Efficient solutions',
        'Good edge case handling',
      ],
    },
    improvements: {
      type: 'array',
      items: {
        type: 'string',
      },
      example: ['Code documentation', 'Test case coverage'],
    },
  },
  description: 'At least one field is required',
};
