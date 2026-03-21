// ─── TENANT CONTROLLER (midlaj) ───────────────────────────────────────────────
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ITenantUseCases } from '../../application/interface/tenant/tenant-usecase-impl';
import { AppError } from '../../shared/error/app-error';

export class TenantController {
  constructor(private readonly tenantUseCases: ITenantUseCases) {}

  // ── Static validation ─────────────────────────────────────────────────────
  static createValidation: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
    const { firstName, lastName, email, phone, rentType, rentAmount, dueDate } = req.body;
    const errors: string[] = [];

    if (!firstName?.trim())  errors.push('firstName is required.');
    if (!lastName?.trim())   errors.push('lastName is required.');
    if (!email?.trim())      errors.push('email is required.');
    if (!phone?.trim())      errors.push('phone is required.');
    if (!rentType)           errors.push('rentType is required (monthly, quarterly, half_yearly, yearly, custom).');
    if (rentAmount === undefined || rentAmount === null || isNaN(Number(rentAmount)))
      errors.push('rentAmount is required and must be a number.');
    if (!dueDate || isNaN(Number(dueDate)) || Number(dueDate) < 1 || Number(dueDate) > 31)
      errors.push('dueDate must be a number between 1 and 31.');

    if (errors.length > 0) {
      res.status(422).json({ message: 'Validation failed.', suggestion: 'Fix the errors and try again.', errors });
      return;
    }
    next();
  };

  // ── GET /tenants ──────────────────────────────────────────────────────────
  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { buildingId, unitId, status } = req.query as Record<string, string>;
      const tenants = await this.tenantUseCases.getAll({ buildingId, unitId, status });
      return res.status(200).json({ message: 'Tenants fetched.', count: tenants.length, data: tenants });
    } catch (err) { return this.handleError(res, err, 'Failed to fetch tenants.'); }
  };

  // ── GET /tenants/:id ──────────────────────────────────────────────────────
 getById = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
  try {
    const tenant = await this.tenantUseCases.getById(req.params.id);
    return res.status(200).json({ message: 'Tenant fetched.', data: tenant });
  } catch (err) {
    return this.handleError(res, err, 'Failed to fetch tenant.');
  }
};

  // ── POST /tenants ─────────────────────────────────────────────────────────
  createTenant = async (req: Request, res: Response): Promise<Response> => {
    try {
      const tenant = await this.tenantUseCases.create({
        ...req.body,
        rentAmount: Number(req.body.rentAmount),
        dueDate:    Number(req.body.dueDate),
      });
      return res.status(201).json({ message: 'Tenant created successfully.', data: tenant });
    } catch (err) { return this.handleError(res, err, 'Failed to create tenant.'); }
  };

  // ── PUT /tenants/:id ──────────────────────────────────────────────────────
  updateTenant = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const tenant = await this.tenantUseCases.update(req.params.id, req.body);
      return res.status(200).json({ message: 'Tenant updated successfully.', data: tenant });
    } catch (err) { return this.handleError(res, err, 'Failed to update tenant.'); }
  };

  // ── DELETE /tenants/:id ───────────────────────────────────────────────────
  deleteTenant = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      await this.tenantUseCases.delete(req.params.id);
      return res.status(200).json({ message: 'Tenant deleted successfully.' });
    } catch (err) { return this.handleError(res, err, 'Failed to delete tenant.'); }
  };

  // ── GET /tenants/:id/leases ───────────────────────────────────────────────
  getTenantLeases = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const leases = await this.tenantUseCases.getTenantLeases(req.params.id);
      return res.status(200).json({ message: 'Tenant leases fetched.', data: leases });
    } catch (err) { return this.handleError(res, err, 'Failed to fetch tenant leases.'); }
  };

  private handleError(res: Response, error: unknown, fallback: string): Response {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message, suggestion: error.suggestion });
    }
    return res.status(500).json({ message: fallback, suggestion: 'Please try again later.', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
