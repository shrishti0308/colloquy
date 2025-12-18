import mongoose from 'mongoose';
import logger from '../utils/logger';
import { Config } from './index';

export const connectDB = async () => {
  if (!Config.DB_URI) {
    logger.error('[Error] Database URI is not defined in the configuration.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(Config.DB_URI);
    logger.info(`[Database] Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    const err = error as Error;
    logger.error(`[Error] Failed to connect to the database: ${err.message}`);
    process.exit(1);
  }
};
