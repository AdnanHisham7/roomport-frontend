import type { Request, Response } from 'express';
import { PaymentRecordRepository } from '../../infrastructure/repository/payment-record-repository';
import { TenantRepository } from '../../infrastructure/repository/tenant-repository';
import { AppError, BadRequestError, NotFoundError } from '../../shared/error/app-error';

// Build period dates based on tenant rent cycle
function buildPeriod(rentType: string, base: Date): { label: string; start: Date; end: Date } {
  const d = new Date(base);
  const y = d.getFullYear();
  const m = d.getMonth();

  if (rentType === 'monthly') {
    const start = new Date(y, m, 1);
    const end   = new Date(y, m + 1, 0, 23, 59, 59);
    return { label: start.toLocaleString('default', { month: 'long', year: 'numeric' }), start, end };
  }
  if (rentType === 'quarterly') {
    const q     = Math.floor(m / 3);
    const start = new Date(y, q * 3, 1);
    const end   = new Date(y, q * 3 + 3, 0, 23, 59, 59);
    return { label: `Q${q + 1} ${y}`, start, end };
  }
  if (rentType === 'half_yearly') {
    const h     = m < 6 ? 0 : 1;
    const start = new Date(y, h * 6, 1);
    const end   = new Date(y, h * 6 + 6, 0, 23, 59, 59);
    return { label: `H${h + 1} ${y}`, start, end };
  }
  if (rentType === 'yearly') {
    const start = new Date(y, 0, 1);
    const end   = new Date(y, 11, 31, 23, 59, 59);
    return { label: `${y}`, start, end };
  }
  // custom / fallback — caller-supplied
  const start = new Date(y, m, 1);
  const end   = new Date(y, m + 1, 0, 23, 59, 59);
  return { label: start.toLocaleString('default', { month: 'long', year: 'numeric' }), start, end };
}

export class PaymentRecordController {
  constructor(
    private readonly repo: PaymentRecordRepository,
    private readonly tenantRepo: TenantRepository,
  ) {}

  private handleError(res: Response, error: unknown, fallback: string): Response {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message, suggestion: error.suggestion });
    return res.status(500).json({ message: fallback });
  }

  /** GET /payment-records/tenant/:tenantId */
  listByTenant = async (req: Request, res: Response): Promise<Response> => {
    try {
      const records = await this.repo.findByTenantId(req.params.tenantId);
      return res.status(200).json({ data: records });
    } catch (e) { return this.handleError(res, e, 'Failed to fetch payment records.'); }
  };

  /** POST /payment-records/tenant/:tenantId */
  record = async (req: Request, res: Response): Promise<Response> => {
    try {
      const tenant = await this.tenantRepo.findById(req.params.tenantId);
      if (!tenant) throw new NotFoundError('Tenant not found.');

      const { periodDate, status = 'paid', method, notes, receiptUrl, amount } = req.body;
      const base = periodDate ? new Date(periodDate) : new Date();
      const { label, start, end } = buildPeriod(tenant.rentType, base);

      const record = await this.repo.create({
        tenantId:    tenant._id!,
        buildingId:  tenant.buildingId!,
        unitId:      tenant.unitId,
        periodLabel: label,
        periodStart: start,
        periodEnd:   end,
        amount:      amount ?? tenant.rentAmount,
        status,
        paidAt:      status === 'paid' ? new Date() : undefined,
        method,
        notes,
        receiptUrl,
        recordedBy:  req.user!.userId,
      });
      return res.status(201).json({ message: 'Payment recorded.', data: record });
    } catch (e) { return this.handleError(res, e, 'Failed to record payment.'); }
  };

  /** PATCH /payment-records/:id */
  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const record = await this.repo.update(req.params.id, req.body);
      if (!record) throw new NotFoundError('Payment record not found.');
      return res.status(200).json({ message: 'Updated.', data: record });
    } catch (e) { return this.handleError(res, e, 'Failed to update payment record.'); }
  };

  /** DELETE /payment-records/:id */
  remove = async (req: Request, res: Response): Promise<Response> => {
    try {
      const ok = await this.repo.delete(req.params.id);
      if (!ok) throw new NotFoundError('Payment record not found.');
      return res.status(200).json({ message: 'Deleted.' });
    } catch (e) { return this.handleError(res, e, 'Failed to delete payment record.'); }
  };
}
