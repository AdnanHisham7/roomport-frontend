import dotenv from 'dotenv';
dotenv.config();
import createApp from './app';
import connectDB from './infrastructure/config/db';


const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    const app = createApp();

    const server = app.listen(PORT, () => {
      console.log(`\n🚀  Server running on http://localhost:${PORT}`);
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => process.exit(0));
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();