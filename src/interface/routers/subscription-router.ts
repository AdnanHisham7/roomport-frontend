import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription-controller';
import { UserRole } from '../../shared/enums/SystemRoles.enum';
import { authenticate, authorize } from '../middleware/auth-middleware';

export const createSubscriptionRouter = (controller: SubscriptionController): Router => {
  const router = Router();

  // Public
  router.get('/pricing', controller.getPricing);
  router.post('/demo', controller.bookDemo);

  router.use(authenticate);

  // Builder routes
  router.get('/me',             authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), controller.getMine);
  router.get('/me/periods',     authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), controller.getMyPeriods);
  router.get('/me/history',     authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), controller.getHistory);
  router.post('/upgrade-request', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), controller.requestUpgrade);

  // Super admin routes
  router.post('/admin/create',               authorize(UserRole.SUPER_ADMIN), controller.createBuilderSubscription);
  router.patch('/admin/:id',                 authorize(UserRole.SUPER_ADMIN), controller.adminUpdate);
  router.post('/admin/periods/:periodId/pay',authorize(UserRole.SUPER_ADMIN), controller.markPeriodPaid);
  router.get('/admin/periods',               authorize(UserRole.SUPER_ADMIN), controller.listPeriods);
  router.get('/admin/demo-requests',         authorize(UserRole.SUPER_ADMIN), controller.listDemoRequests);
  router.patch('/admin/demo-requests/:id',   authorize(UserRole.SUPER_ADMIN), controller.updateDemoRequest);

  return router;
};
