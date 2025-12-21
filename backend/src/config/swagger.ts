import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import { Config } from '.';
import {
  ForgotPasswordBody,
  LoginBody,
  RegisterBody,
  ResetPasswordBody,
} from '../docs/auth.schema';
import { parameters } from '../docs/parameters';
import {
  CreateProblemBody,
  ProblemSchema,
  UpdateProblemBody,
} from '../docs/problem.schema';
import { responses } from '../docs/responses';
import {
  AddFeedbackBody,
  CreateSessionBody,
  InviteParticipantsBody,
  JoinSessionBody,
  SessionSchema,
  SubmitCodeBody,
  UpdateSessionBody,
} from '../docs/session.schema';
import {
  AdminUpdateUserBody,
  ChangePasswordBody,
  UpdateProfileBody,
  UserSchema,
} from '../docs/user.schema';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Colloquy API',
      version: '1.0.0',
      description: 'API documentation for Colloquy Backend',
    },
    servers: [
      {
        url: `http://localhost:${Config.PORT}${Config.API_PREFIX}`,
        description: 'Local Development Server (API)',
      },
      {
        url: `http://localhost:${Config.PORT}`,
        description: 'Local Development Server (Root)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT Access Token',
        },
      },
      schemas: {
        ApiError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Something went wrong',
            },
          },
        },
        NotFound: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Route Not Found',
            },
          },
        },
        User: UserSchema,
        RegisterBody: RegisterBody,
        LoginBody: LoginBody,
        ForgotPasswordBody: ForgotPasswordBody,
        ResetPasswordBody: ResetPasswordBody,
        UpdateProfileBody: UpdateProfileBody,
        ChangePasswordBody: ChangePasswordBody,
        AdminUpdateUserBody: AdminUpdateUserBody,
        Problem: ProblemSchema,
        CreateProblemBody: CreateProblemBody,
        UpdateProblemBody: UpdateProblemBody,
        Session: SessionSchema,
        CreateSessionBody: CreateSessionBody,
        UpdateSessionBody: UpdateSessionBody,
        JoinSessionBody: JoinSessionBody,
        InviteParticipantsBody: InviteParticipantsBody,
        SubmitCodeBody: SubmitCodeBody,
        AddFeedbackBody: AddFeedbackBody,
      },
      parameters: {
        ...parameters,
      },
      responses: responses,
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.resolve(__dirname, '../routes/**/*.{ts,js}'),
    path.resolve(__dirname, '../app.{ts,js}'),
  ],
};

export const swaggerSpecs = swaggerJSDoc(options);
