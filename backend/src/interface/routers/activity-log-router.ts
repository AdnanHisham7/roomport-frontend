import { Router } from 'express';
import { ActivityLogController } from '../controllers/activity-log-controller';
import { authenticate, authorize } from '../middleware/auth-middleware';
import { UserRole } from '../../shared/enums/SystemRoles.enum';

export const activityLogRouter = (controller: ActivityLogController): Router => {
  const router = Router();

  router.use(authenticate);
  router.use(authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN));

  router.post('/', controller.logActivity.bind(controller));
  router.get('/', controller.getActivities.bind(controller));
  router.get('/:id', controller.getActivityById.bind(controller));
  router.get('/building/:buildingId', controller.getActivitiesByBuilding.bind(controller));
  router.get('/user/:userId', controller.getActivitiesByUser.bind(controller));

  return router;
};
