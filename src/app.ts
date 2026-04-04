import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import authRoutes from './interface/routers/auth-router';
import systemRoutes from './interface/routers/bootstrap-router';
import { createTenantRouter } from './interface/routers/tenant-router';
import { createDocumentRouter } from './interface/routers/document-router';
import { globalErrorHandler } from './interface/middleware/errorhandle-middleware';
import { documentController, tenantController, agreementController, buildingController, floorController, expenseController } from './infrastructure/DIContainer';
import { createAgreementRouter } from './interface/routers/agreement-router';
import { createPaymentRouter } from './interface/routers/payment-router';
import { paymentController } from './infrastructure/DIContainer';
import { createUnitRouter } from './interface/routers/unit-router';
import { unitController } from './infrastructure/DIContainer';
import { createExpenseRouter } from './interface/routers/expense-router';

import { createBuildingRouter } from './interface/routers/building-router';
import { createUserRouter } from './interface/routers/user-router';
import { userController, activityLogController } from './infrastructure/DIContainer';
import { activityLogRouter } from './interface/routers/activity-log-router';
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

  // ✅ Set up Stripe Webhook parser BEFORE express.json()
  app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

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
  app.use('/api/v1/documents', createDocumentRouter(documentController));
  app.use('/api/v1/agreements', createAgreementRouter(agreementController));
  app.use('/api/v1/payments', createPaymentRouter(paymentController));
  app.use('/api/v1/units', createUnitRouter(unitController));
  app.use('/api/v1/expenses', createExpenseRouter(expenseController));

  app.use('/api/v1/buildings',     createBuildingRouter(buildingController, floorController));
  app.use('/api/v1/users',         createUserRouter(userController));
  app.use('/api/v1/activity-logs', activityLogRouter(activityLogController));

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