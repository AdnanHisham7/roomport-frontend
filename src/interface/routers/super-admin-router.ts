import { Router } from 'express';
import { SuperAdminController } from '../controllers/super-admin-controller';
import { UserRole } from '../../shared/enums/SystemRoles.enum';
import { authenticate, authorize } from '../middleware/auth-middleware';

export const createSuperAdminRouter = (controller: SuperAdminController): Router => {
  const router = Router();
  router.use(authenticate);
  router.use(authorize(UserRole.SUPER_ADMIN));

  router.get('/stats', controller.getStats);

  router.get('/builders', controller.listBuilders);
  router.get('/builders/:id', controller.getBuilderDetail);
  router.patch('/builders/:id/status', controller.updateBuilderStatus);
  router.delete('/builders/:id', controller.deleteBuilder);

  router.get('/buildings', controller.listBuildings);
  router.patch('/buildings/:id/feature', controller.toggleFeature);
  router.patch('/buildings/:id/publish', controller.togglePublish);
  router.delete('/buildings/:id', controller.deleteBuilding);

  router.get('/activity-logs', controller.listActivityLogs);

  router.get('/settings', controller.getSettings);
  router.put('/settings', controller.updateSettings);

  router.get('/subscriptions', controller.listSubscriptions);
  router.patch('/subscriptions/:id', controller.updateSubscription);

  return router;
};
