import { Router }             from 'express';
import { UserRole } from '../../shared/enums/SystemRoles.enum';
import { authenticate, authorize } from '../middleware/auth-middleware';
import { ExpenseController } from '../controllers/expense-controller';

const ADMIN = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER];
const SUPER  = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

export const createExpenseRouter = (c: ExpenseController): Router => {
  const r = Router();
  r.use(authenticate);

  // ── Tracker (must be before /:id to avoid route conflict) ─────────────────
  r.get('/tracker/:buildingId/summary', authorize(...ADMIN), c.summary);
  r.get('/tracker/:buildingId/range',   authorize(...ADMIN), c.getByDateRange);

  // ── CRUD ──────────────────────────────────────────────────────────────────
  r.get('/',        authorize(...ADMIN), c.getAll);
  r.get('/:id',     authorize(...ADMIN), c.getById);
  r.post('/',       authorize(...ADMIN), c.create);
  r.put('/:id',     authorize(...ADMIN), c.update);
  r.delete('/:id',  authorize(...SUPER), c.delete);

  return r;
};
