import { Router } from 'express';
import { UserRole } from '../../shared/enums/SystemRoles.enum';
import { authenticate, authorize } from '../middleware/auth-middleware';
import { validate } from '../middleware/validate-middleware';
import { DocumentController } from '../controllers/document-controller';
import { createDocumentSchema } from '../validators/domain.validator';

const ADMIN_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER];

export const createDocumentRouter = (c: DocumentController): Router => {
  const router = Router();
  router.use(authenticate);

  router.get('/getdocuments',              c.getAll);
  router.get('/getdocument/:id',           c.getById);
  router.post('/createdocument',           validate(createDocumentSchema), c.create);
  router.delete('/deletedocument/:id',     authorize(...ADMIN_ROLES), c.delete);

  return router;
};
