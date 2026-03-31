import { Router } from 'express';
import { ActivityLogController } from '../controllers/activity-log-controller';
// import { authMiddleware } from '../middleware/auth-middleware';

export const activityLogRouter = (controller: ActivityLogController): Router => {
  const router = Router();

  // router.use(authMiddleware); // Uncomment and use as required by your project authentication needs

  router.post('/', controller.logActivity.bind(controller));
  router.get('/', controller.getActivities.bind(controller));
  router.get('/:id', controller.getActivityById.bind(controller));
  router.get('/building/:buildingId', controller.getActivitiesByBuilding.bind(controller));
  router.get('/user/:userId', controller.getActivitiesByUser.bind(controller));

  return router;
};
