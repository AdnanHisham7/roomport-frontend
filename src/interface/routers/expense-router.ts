import { Router } from 'express';
import { UserRole } from '../../shared/enums/SystemRoles.enum';
import { authenticate, authorize } from '../middleware/auth-middleware';
import { validate } from '../middleware/validate-middleware';
import { ExpenseController } from '../controllers/expense-controller';
import {
  createExpenseSchema,
  expenseSummaryQuerySchema,
  expenseDateRangeQuerySchema,
} from '../validators/domain.validator';

const ADMIN = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER];
const SUPER  = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

export const createExpenseRouter = (c: ExpenseController): Router => {
  const r = Router();
  r.use(authenticate);

  r.get('/tracker/:buildingId/summary', authorize(...ADMIN), validate(expenseSummaryQuerySchema, 'query'), c.summary);
  r.get('/tracker/:buildingId/range',   authorize(...ADMIN), validate(expenseDateRangeQuerySchema, 'query'), c.getByDateRange);

  r.get('/',        authorize(...ADMIN), c.getAll);
  r.get('/:id',     authorize(...ADMIN), c.getById);
  r.post('/',       authorize(...ADMIN), validate(createExpenseSchema), c.create);
  r.put('/:id',     authorize(...ADMIN), c.update);
  r.delete('/:id',  authorize(...SUPER), c.delete);

  return r;
};
