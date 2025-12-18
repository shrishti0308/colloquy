import app from './app';
import { Config } from './config';
import { connectDB } from './config/db';
import { verifyMailConnection } from './services/mail.service';
import logger from './utils/logger';

const { PORT, NODE_ENV } = Config;

const startServer = async () => {
  await connectDB();

  await verifyMailConnection();

  const server = app.listen(PORT, () => {
    logger.info(`[Server] Server running on port ${PORT} in ${NODE_ENV} mode`);
  });

  process.on('unhandledRejection', (err: Error) => {
    logger.error(`[Error] Unhandled Rejection: ${err.name} - ${err.message}`);
    server.close(() => {
      logger.info(
        '[Server] Shutting down server due to unhandled promise rejection'
      );
      process.exit(1);
    });
  });

  process.on('uncaughtException', (err: Error) => {
    logger.error(`[Error] Uncaught Exception: ${err.name} - ${err.message}`);
    server.close(() => {
      logger.info('[Server] Shutting down server due to uncaught exception');
      process.exit(1);
    });
  });
};

startServer();
