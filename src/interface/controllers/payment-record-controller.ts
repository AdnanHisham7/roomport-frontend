import type { Request, Response } from 'express';
import { PaymentRecordRepository } from '../../infrastructure/repository/payment-record-repository';
import { TenantRepository } from '../../infrastructure/repository/tenant-repository';
import { IBuildingRepository } from '../../domain/repository/building-repository-impl';
import { AppError, BadRequestError, ForbiddenError, NotFoundError } from '../../shared/error/app-error';
import { IActivityLogUsecase } from '../../application/usecase/activity-log/activity-log-usecase';
import { ActivityLogAction, ActivityLogEntityType } from '../../domain/entities/ActivityLog';

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
  const start = new Date(y, m, 1);
  const end   = new Date(y, m + 1, 0, 23, 59, 59);
  return { label: start.toLocaleString('default', { month: 'long', year: 'numeric' }), start, end };
}

export class PaymentRecordController {
  constructor(
    private readonly repo: PaymentRecordRepository,
    private readonly tenantRepo: TenantRepository,
    private readonly buildingRepo: IBuildingRepository,
    private readonly activityLogUc: IActivityLogUsecase,
  ) {}

  private handleError(res: Response, error: unknown, fallback: string): Response {
    if (error instanceof AppError) return res.status(error.statusCode).json({ message: error.message, suggestion: error.suggestion });
    return res.status(500).json({ message: fallback });
  }

  private async assertBuildingOwnership(buildingId: string | undefined, userId: string, role: string): Promise<void> {
    if (role === 'super_admin' || !buildingId) return;
    const building = await this.buildingRepo.findById(buildingId);
    if (!building) throw new ForbiddenError('Building not found or access denied.');
    if (building.ownerId !== userId && building.managerId !== userId) {
      throw new ForbiddenError('You do not have access to this building.', 'This building belongs to a different builder.');
    }
  }

  listByTenant = async (req: Request, res: Response): Promise<Response> => {
    try {
      const tenantId = req.params.tenantId as string;
      const tenant = await this.tenantRepo.findById(tenantId);
      if (!tenant) throw new NotFoundError('Tenant not found.');

      const user = req.user!;
      if (user.role !== 'super_admin') {
        await this.assertBuildingOwnership(tenant.buildingId, user.userId, user.role);
      }

      const records = await this.repo.findByTenantId(tenantId);
      return res.status(200).json({ data: records });
    } catch (e) { return this.handleError(res, e, 'Failed to fetch payment records.'); }
  };

  record = async (req: Request, res: Response): Promise<Response> => {
    try {
      const tenantId = req.params.tenantId as string;
      const tenant = await this.tenantRepo.findById(tenantId);
      if (!tenant) throw new NotFoundError('Tenant not found.');

      const user = req.user!;
      if (user.role !== 'super_admin') {
        await this.assertBuildingOwnership(tenant.buildingId, user.userId, user.role);
      }

      const { periodDate, status = 'paid', method, notes, receiptUrl, amount } = req.body;
      const base = periodDate ? new Date(periodDate) : new Date();
      const { label, start, end } = buildPeriod(tenant.rentType, base);

      const existingRecords = await this.repo.findByTenantId(tenantId);
      const duplicate = existingRecords.find(r => {
        const rStart = new Date(r.periodStart).getTime();
        const rEnd   = new Date(r.periodEnd).getTime();
        return rStart === start.getTime() && rEnd === end.getTime();
      });

      if (duplicate) {
        throw new BadRequestError(
          `A payment record already exists for the period "${label}".`,
          'Each period can only have one payment record. Update the existing record if needed.'
        );
      }

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
        recordedBy:  user.userId,
      });

      this.activityLogUc.logActivity({
        action:      ActivityLogAction.RENT_PAYMENT_CREATED,
        entityType:  ActivityLogEntityType.PAYMENT,
        entityId:    record._id,
        buildingId:  tenant.buildingId,
        unitId:      tenant.unitId,
        userId:      user.userId,
        description: `Rent payment of ₹${record.amount} recorded for tenant ${tenant.firstName} ${tenant.lastName} (${label}). Status: ${status}.`,
        metadata:    { tenantId, periodLabel: label, amount: record.amount, status, method },
      }).catch(console.error);

      return res.status(201).json({ message: 'Payment recorded.', data: record });
    } catch (e) { return this.handleError(res, e, 'Failed to record payment.'); }
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = req.params.id as string;
      const existing = await this.repo.findById(id);
      if (!existing) throw new NotFoundError('Payment record not found.');

      const user = req.user!;
      if (user.role !== 'super_admin') {
        await this.assertBuildingOwnership(existing.buildingId, user.userId, user.role);
      }

      const record = await this.repo.update(id, req.body);
      if (!record) throw new NotFoundError('Payment record not found.');

      this.activityLogUc.logActivity({
        action:      ActivityLogAction.PAYMENT_UPDATED,
        entityType:  ActivityLogEntityType.PAYMENT,
        entityId:    id,
        buildingId:  existing.buildingId,
        unitId:      existing.unitId,
        userId:      user.userId,
        description: `Payment record for period "${existing.periodLabel}" updated.`,
        metadata:    { changes: req.body },
      }).catch(console.error);

      return res.status(200).json({ message: 'Updated.', data: record });
    } catch (e) { return this.handleError(res, e, 'Failed to update payment record.'); }
  };

  remove = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = req.params.id as string;
      const existing = await this.repo.findById(id);
      if (!existing) throw new NotFoundError('Payment record not found.');

      const user = req.user!;
      if (user.role !== 'super_admin') {
        await this.assertBuildingOwnership(existing.buildingId, user.userId, user.role);
      }

      const ok = await this.repo.delete(id);
      if (!ok) throw new NotFoundError('Payment record not found.');

      this.activityLogUc.logActivity({
        action:      ActivityLogAction.PAYMENT_DELETED,
        entityType:  ActivityLogEntityType.PAYMENT,
        entityId:    id,
        buildingId:  existing.buildingId,
        unitId:      existing.unitId,
        userId:      user.userId,
        description: `Payment record for period "${existing.periodLabel}" deleted.`,
      }).catch(console.error);

      return res.status(200).json({ message: 'Deleted.' });
    } catch (e) { return this.handleError(res, e, 'Failed to delete payment record.'); }
  };
}
