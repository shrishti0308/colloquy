import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const config = {
  // --- Basic App Config ---
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [],
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  IS_PRODUCTION: process.env.NODE_ENV === 'production',

  API_PREFIX: process.env.API_PREFIX || '/api/v1',

  // --- Database ---
  DB_URI: process.env.DB_URI || 'mongodb://localhost:27017/colloquy',
};

export const Config = Object.freeze(config);
