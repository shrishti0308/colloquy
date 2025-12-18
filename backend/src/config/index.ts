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
};

if (!config.JWT_ACCESS_SECRET || !config.JWT_REFRESH_SECRET) {
  throw new Error(
    'Missing required environment variables: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be set'
  );
}

export const Config = Object.freeze(config);
