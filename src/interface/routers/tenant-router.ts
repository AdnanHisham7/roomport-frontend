import { Router } from 'express';
import { UserRole } from '../../shared/enums/SystemRoles.enum';
import { TenantController } from '../controllers/tenant-controller';
import { authenticate, authorize } from '../middleware/auth-middleware';
import { validate } from '../middleware/validate-middleware';
import { createTenantSchema, transferTenantSchema } from '../validators/tenant.validator';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER];
const SUPER_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

export const createTenantRouter = (c: TenantController): Router => {
  const router = Router();
  router.use(authenticate);

  router.get('/gettenants',               authorize(...ADMIN_ROLES), c.getAll);
  router.get('/gettenant/:id',            c.getById);
  router.post('/createtenant',            authorize(...ADMIN_ROLES), validate(createTenantSchema), c.createTenant);
  router.put('/updatetenant/:id',         authorize(...ADMIN_ROLES), c.updateTenant);
  router.delete('/deletetenant/:id',      authorize(...SUPER_ROLES), c.deleteTenant);
  router.get('/gettenantleases/:id',      c.getTenantLeases);
  router.post('/transfer/:id',            authorize(...ADMIN_ROLES), validate(transferTenantSchema), c.transferTenant);

  return router;
};
