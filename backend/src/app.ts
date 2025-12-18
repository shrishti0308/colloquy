import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { Config } from './config';
import { swaggerSpecs } from './config/swagger';
import { generalLimiter } from './middlewares/rateLimiter';
import { requestLogger } from './middlewares/requestLogger';
import ApiError from './utils/apiError';
import logger from './utils/logger';

const app: Application = express();

// -- Middlewares --
// Cross-Origin Resource Sharing
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || Config.ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(
        new ApiError(403, `CORS policy: No access from origin ${origin}`)
      );
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
// Secure HTTP Headers
app.use(helmet());
// Parse JSON req.body
app.use(express.json());
// Parse URL-encodes req.body
app.use(express.urlencoded({ extended: true }));
// Cookie Parser
app.use(cookieParser());

// Request Logger
app.use(requestLogger);

// -- Routes --
// Home Route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Server is Running',
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Checks if the server is alive and responding.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   example: 2025-11-03T10:00:00Z
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use(Config.API_PREFIX, generalLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Not Found Route
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, 'Route Not Found'));
});

// Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  let error = err; // Start with the incoming error
  let statusCode = 500;

  // Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const messages = Object.values((err as any).errors)
      .map((val: any) => val.message)
      .join(', ');
    error = new ApiError(400, `Invalid input: ${messages}`);
  }

  // Mongoose Duplicate Key Errors
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue)[0];
    error = new ApiError(409, `Duplicate value for field: ${field}`);
  }

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    if (statusCode < 500) {
      logger.warn(`[ApiError] ${statusCode} - ${error.message}`);
    }
  } else {
    logger.error(`[UnhandledError] ${error.message}`, { stack: error.stack });
  }

  const message = (error as ApiError).message || 'Internal Server Error';
  const success = statusCode < 300;

  // Don't leak stack trace in production
  const stack = Config.IS_PRODUCTION ? {} : { stack: error.stack };

  return res.status(statusCode).json({
    success,
    message,
    ...stack,
  });
});

export default app;
