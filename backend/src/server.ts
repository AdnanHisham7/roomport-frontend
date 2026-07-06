import dotenv from 'dotenv';
dotenv.config();
import { env } from './infrastructure/config/env';
import { logger } from './shared/logger/logger';
import createApp from './app';
import connectDB from './infrastructure/config/db';
import { startRentReminderCron } from './infrastructure/cron/rent-reminder.cron';

const PORT = env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const app = createApp();

    const server = app.listen(PORT, () => {
      logger.info(`\n🚀  Server running on http://localhost:${PORT}`);
    });
    
    startRentReminderCron();

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => process.exit(0));
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received. Shutting down gracefully...');
      server.close(() => process.exit(0));
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();