import { Router } from 'express';
import { UserRole } from '../../shared/enums/SystemRoles.enum';
import { UserController } from '../controllers/user-controller';
import { authenticate, authorize } from '../middleware/auth-middleware';

export const createUserRouter = (userController: UserController): Router => {
  const router = Router();

  // All profile routes must be authenticated
  router.use(authenticate);

  router.get('/profile', userController.getProfile);
  router.put('/profile', userController.updateProfile);
  router.patch('/profile', userController.updateProfile);
  router.post('/manager', authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), userController.createManager);

  return router;
};
