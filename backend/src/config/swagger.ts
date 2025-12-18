import path from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import { Config } from '.';
import { responses } from '../docs/responses';

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
