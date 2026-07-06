import { Router } from 'express';
import { InquiryController } from '../controllers/inquiry-controller';
import { UserRole } from '../../shared/enums/SystemRoles.enum';
import { authenticate, authorize } from '../middleware/auth-middleware';

export const createInquiryRouter = (controller: InquiryController): Router => {
  const router = Router();

  router.post('/', controller.create);   // public — no auth, anyone browsing can send a lead

  router.use(authenticate);
  router.use(authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN));

  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.patch('/:id/status', controller.updateStatus);
  router.delete('/:id', controller.delete);

  return router;
};
