import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription-controller';
import { UserRole } from '../../shared/enums/SystemRoles.enum';
import { authenticate, authorize } from '../middleware/auth-middleware';

export const createSubscriptionRouter = (controller: SubscriptionController): Router => {
  const router = Router();

  router.get('/pricing', controller.getPricing);                      // public — used by pricing calculator

  router.use(authenticate);
  router.use(authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN));

  router.post('/quote', controller.createQuote);
  router.get('/me', controller.getMine);
  router.get('/me/history', controller.getHistory);

  return router;
};
