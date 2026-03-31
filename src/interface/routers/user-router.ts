import { Router } from 'express';
import { UserController } from '../controllers/user-controller';
import { authenticate } from '../middleware/auth-middleware';

export const createUserRouter = (userController: UserController): Router => {
  const router = Router();

  // All profile routes must be authenticated
  router.use(authenticate);

  router.get('/profile', userController.getProfile);
  router.put('/profile', userController.updateProfile);
  router.patch('/profile', userController.updateProfile);

  return router;
};
