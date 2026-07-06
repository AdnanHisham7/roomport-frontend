import { Router } from 'express';
import { PaymentRecordController } from '../controllers/payment-record-controller';
import { authenticate, authorize } from '../middleware/auth-middleware';
import { UserRole } from '../../shared/enums/SystemRoles.enum';

export const createPaymentRecordRouter = (controller: PaymentRecordController): Router => {
  const router = Router();
  router.use(authenticate);
  router.use(authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN));

  router.get('/tenant/:tenantId',  controller.listByTenant);
  router.post('/tenant/:tenantId', controller.record);
  router.patch('/:id',             controller.update);
  router.delete('/:id',            controller.remove);

  return router;
};
