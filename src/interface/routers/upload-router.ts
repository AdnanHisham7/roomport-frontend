import { Router } from 'express';
import { UploadController } from '../controllers/upload-controller';
import { uploadImage } from '../middleware/upload-middleware';
import { authenticate, authorize } from '../middleware/auth-middleware';
import { UserRole } from '../../shared/enums/SystemRoles.enum';

export const createUploadRouter = (controller: UploadController): Router => {
  const router = Router();
  router.use(authenticate);
  router.use(authorize(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPER_ADMIN));

  // :category is a free-form folder name, e.g. "buildings", "units", "profiles", "documents"
  router.post('/:category/single', uploadImage.single('file'), controller.uploadSingle);
  router.post('/:category/multiple', uploadImage.array('files', 10), controller.uploadMultiple);

  return router;
};
