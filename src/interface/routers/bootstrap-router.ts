import { Router } from 'express';
import { bootstrapController } from '../../infrastructure/DIContainer';

const router = Router();

/**
 * POST /api/v1/system/bootstrap
 * ⚠️  Remove this route or add IP-guard after first use in production.
 */
router.post('/bootstrap', bootstrapController.bootstrap);

export default router;
