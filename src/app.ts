import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import authRoutes from './interface/routers/auth-router';
import systemRoutes from './interface/routers/bootstrap-router';
import  { createTenantRouter } from './interface/routers/tenant-router';
import { globalErrorHandler } from './interface/middleware/errorhandle-middleware';
import { tenantController } from './infrastructure/DIContainer';

const createApp = (): Application => {
  const app = express();
  app.use(morgan('dev'));
  app.use(helmet());

  app.use(
    cors({
      origin: process.env.APP_URL ?? 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many login attempts, please try again later.',
    },
  });

  // ✅ Body parsers FIRST so req.body is available in morgan
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));


  app.use(globalLimiter);

  app.get('/health', (_req: Request, res: Response) => {
    console.log('Health check endpoint hit');
    res.status(200).json({
      success: true,
      message: 'PropertySaaS API is running 🚀',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/v1/auth', authLimiter, authRoutes);
  app.use('/api/v1/system', systemRoutes);
  app.use('/api/v1/tenants', createTenantRouter(tenantController));
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      code: 'NOT_FOUND',
    });
  });

  app.use(globalErrorHandler);

  return app;
};

export default createApp;