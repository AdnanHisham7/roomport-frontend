import type { Request, Response } from 'express';
import { SuperAdminUseCases } from '../../application/usecase/super-admin/super-admin-usecase';
import { AppError } from '../../shared/error/app-error';

export class SuperAdminController {
  constructor(private readonly uc: SuperAdminUseCases) {}

  private handleError(res: Response, error: unknown, fallback: string): Response {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message, suggestion: error.suggestion });
    }
    return res.status(500).json({ message: fallback, error: error instanceof Error ? error.message : 'Unknown error' });
  }

  private pagination(req: Request) {
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    return { page, limit };
  }

  getStats = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.getPlatformStats();
      return res.status(200).json({ data });
    } catch (error) { return this.handleError(res, error, 'Failed to fetch platform stats.'); }
  };

  registerBuilder = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { firstName, lastName, email, phone, billingCycle, numberOfBuildings, numberOfUnits, amount, notes } = req.body;
      if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !billingCycle || !numberOfBuildings || !numberOfUnits || amount === undefined) {
        return res.status(422).json({ message: 'firstName, lastName, email, billingCycle, numberOfBuildings, numberOfUnits, amount are all required.' });
      }
      if (!['monthly', 'yearly'].includes(billingCycle)) {
        return res.status(422).json({ message: 'billingCycle must be "monthly" or "yearly".' });
      }
      const result = await this.uc.registerBuilder(
        { firstName, lastName, email, phone, billingCycle, numberOfBuildings: Number(numberOfBuildings), numberOfUnits: Number(numberOfUnits), amount: Number(amount), notes },
        req.user!.userId
      );
      return res.status(201).json(result);
    } catch (error) { return this.handleError(res, error, 'Failed to register builder.'); }
  };

  listBuilders = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { page, limit } = this.pagination(req);
      const { search, status, role } = req.query as Record<string, string>;
      const result = await this.uc.listBuilders({ search, status, role }, page, limit);
      return res.status(200).json(result);
    } catch (error) { return this.handleError(res, error, 'Failed to fetch builders.'); }
  };

  getBuilderDetail = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.getBuilderDetail(req.params.id);
      return res.status(200).json({ data });
    } catch (error) { return this.handleError(res, error, 'Failed to fetch builder.'); }
  };

  updateBuilderStatus = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      await this.uc.updateBuilderStatus(req.params.id, req.body.status);
      return res.status(200).json({ message: 'Builder status updated.' });
    } catch (error) { return this.handleError(res, error, 'Failed to update builder status.'); }
  };

  deleteBuilder = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      await this.uc.deleteBuilder(req.params.id);
      return res.status(200).json({ message: 'Builder account deleted.' });
    } catch (error) { return this.handleError(res, error, 'Failed to delete builder.'); }
  };

  listBuildings = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { page, limit } = this.pagination(req);
      const { search, status } = req.query as Record<string, string>;
      const isPublished = req.query.isPublished !== undefined ? req.query.isPublished === 'true' : undefined;
      const isFeatured  = req.query.isFeatured  !== undefined ? req.query.isFeatured  === 'true' : undefined;
      const result = await this.uc.listBuildings({ search, status, isPublished, isFeatured }, page, limit);
      return res.status(200).json(result);
    } catch (error) { return this.handleError(res, error, 'Failed to fetch buildings.'); }
  };

  toggleFeature = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.toggleFeatureBuilding(req.params.id, !!req.body.isFeatured);
      return res.status(200).json({ message: 'Updated.', data });
    } catch (error) { return this.handleError(res, error, 'Failed to update feature flag.'); }
  };

  togglePublish = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.togglePublishBuilding(req.params.id, !!req.body.isPublished);
      return res.status(200).json({ message: 'Updated.', data });
    } catch (error) { return this.handleError(res, error, 'Failed to update publish flag.'); }
  };

  deleteBuilding = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      await this.uc.deleteBuildingAsAdmin(req.params.id);
      return res.status(200).json({ message: 'Building deleted.' });
    } catch (error) { return this.handleError(res, error, 'Failed to delete building.'); }
  };

  listActivityLogs = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { page, limit } = this.pagination(req);
      const { action, entityType, buildingId, userId } = req.query as Record<string, string>;
      const result = await this.uc.listActivityLogs({ action, entityType, buildingId, userId }, page, limit);
      return res.status(200).json(result);
    } catch (error) { return this.handleError(res, error, 'Failed to fetch activity logs.'); }
  };

  getSettings = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.getSettings();
      return res.status(200).json({ data });
    } catch (error) { return this.handleError(res, error, 'Failed to get settings.'); }
  };

  updateSettings = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.updateSettings(req.body, req.user!.userId);
      return res.status(200).json({ message: 'Settings updated.', data });
    } catch (error) { return this.handleError(res, error, 'Failed to update settings.'); }
  };

  listSubscriptions = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { page, limit } = this.pagination(req);
      const { userId, status } = req.query as Record<string, string>;
      const result = await this.uc.listSubscriptions({ userId, status }, page, limit);
      return res.status(200).json(result);
    } catch (error) { return this.handleError(res, error, 'Failed to fetch subscriptions.'); }
  };

  updateSubscription = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.updateSubscription(req.params.id, req.body, req.user!.userId);
      return res.status(200).json({ message: 'Subscription updated.', data });
    } catch (error) { return this.handleError(res, error, 'Failed to update subscription.'); }
  };
}
