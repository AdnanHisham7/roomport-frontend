import { Router } from 'express';
import { NotificationController } from '../controllers/notification-controller';
import { authenticate } from '../middleware/auth-middleware';

export function notificationRouter(notificationController: NotificationController): Router {
  const router = Router();

  // Assuming authenticate middleware sets req.user
  router.get('/', authenticate as any, notificationController.getUserNotifications.bind(notificationController));
  router.post('/test-send', authenticate as any, notificationController.sendTestNotification.bind(notificationController));
  router.patch('/read-all', authenticate as any, notificationController.markAllAsRead.bind(notificationController));
  router.patch('/:id/read', authenticate as any, notificationController.markAsRead.bind(notificationController));

  return router;
}

