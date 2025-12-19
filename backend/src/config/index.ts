import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const config = {
  // --- Basic App Config ---
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5000',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [],
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  IS_PRODUCTION: process.env.NODE_ENV === 'production',

  API_PREFIX: process.env.API_PREFIX || '/api/v1',

  // --- Database ---
  DB_URI: process.env.DB_URI || 'mongodb://localhost:27017/colloquy',

  // --- Security ---
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // --- Mail Service (Nodemailer) ---
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: parseInt(process.env.MAIL_PORT || '465', 10),
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASS: process.env.MAIL_PASS,
  MAIL_FROM: process.env.MAIL_FROM,

  // --- Stream & Inngest Configuration ---
  STREAM_API_KEY: process.env.STREAM_API_KEY,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET,
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
};

if (!config.JWT_ACCESS_SECRET || !config.JWT_REFRESH_SECRET) {
  throw new Error(
    'Missing required environment variables: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set'
  );
}

if (!config.STREAM_API_KEY || !config.STREAM_API_SECRET) {
  throw new Error(
    'Missing required environment variables: STREAM_API_KEY and STREAM_API_SECRET must be set'
  );
}

if (!config.INNGEST_EVENT_KEY || !config.INNGEST_SIGNING_KEY) {
  throw new Error(
    'Missing required environment variables: INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY must be set'
  );
}

if (
  !config.MAIL_HOST ||
  !config.MAIL_PORT ||
  !config.MAIL_USER ||
  !config.MAIL_PASS
) {
  throw new Error(
    'Missing required environment variables: MAIL_HOST, MAIL_PORT, MAIL_USER, and MAIL_PASS must be set'
  );
}

export const Config = Object.freeze(config);
