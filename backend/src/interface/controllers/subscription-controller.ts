import { env } from '../../infrastructure/config/env';
import type { Request, Response } from 'express';
import { SubscriptionUseCases } from '../../application/usecase/subscription/subscription-usecase';
import { AppError } from '../../shared/error/app-error';

export class SubscriptionController {
  constructor(private readonly uc: SubscriptionUseCases) {}

  private handleError(res: Response, error: unknown, fallback: string): Response {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message, suggestion: error.suggestion });
    }
    return res.status(500).json({ message: fallback, error: error instanceof Error ? error.message : 'Unknown error' });
  }

  getPricing = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.getPricing();
      return res.status(200).json({ data });
    } catch (error) { return this.handleError(res, error, 'Failed to fetch pricing.'); }
  };

  getMine = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.getMine(req.user!.userId);
      return res.status(200).json({ data });
    } catch (error) { return this.handleError(res, error, 'Failed to fetch subscription.'); }
  };

  getMyPeriods = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.getMyPeriods(req.user!.userId);
      return res.status(200).json({ data });
    } catch (error) { return this.handleError(res, error, 'Failed to fetch subscription periods.'); }
  };

  getHistory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.getHistory(req.user!.userId);
      return res.status(200).json({ data });
    } catch (error) { return this.handleError(res, error, 'Failed to fetch subscription history.'); }
  };

  requestUpgrade = async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this.uc.requestUpgrade(
        { ...req.body, userId: req.user!.userId },
        process.env.ADMIN_EMAIL ?? 'admin@rentflow.in'
      );
      return res.status(200).json(result);
    } catch (error) { return this.handleError(res, error, 'Failed to submit upgrade request.'); }
  };

  bookDemo = async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this.uc.bookDemo({
        ...req.body,
        numberOfBuildings: Number(req.body.numberOfBuildings),
        numberOfUnits:     Number(req.body.numberOfUnits),
      });
      return res.status(201).json(result);
    } catch (error) { return this.handleError(res, error, 'Failed to submit demo request.'); }
  };

  // ── Admin endpoints ──────────────────────────────────────────────────────────

  createBuilderSubscription = async (req: Request, res: Response): Promise<Response> => {
    try {
      const result = await this.uc.createBuilderSubscription(
        {
          ...req.body,
          numberOfBuildings: Number(req.body.numberOfBuildings),
          numberOfUnits:     Number(req.body.numberOfUnits),
          amount:            Number(req.body.amount),
        },
        req.user!.userId
      );
      return res.status(201).json({ message: 'Subscription created successfully.', ...result });
    } catch (error) { return this.handleError(res, error, 'Failed to create subscription.'); }
  };

  adminUpdate = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.adminUpdate(req.params.id, req.body, req.user!.userId);
      return res.status(200).json({ message: 'Subscription updated.', data });
    } catch (error) { return this.handleError(res, error, 'Failed to update subscription.'); }
  };

  markPeriodPaid = async (req: Request<{ periodId: string }>, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.markPeriodPaid(req.params.periodId, req.user!.userId, req.body);
      return res.status(200).json({ message: 'Period marked as paid. Next period created.', data });
    } catch (error) { return this.handleError(res, error, 'Failed to mark period as paid.'); }
  };

  listPeriods = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page  = Math.max(1, Number(req.query.page)  || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const { userId, subscriptionId, status } = req.query as Record<string, string>;
      const result = await this.uc.listPeriods({ userId, subscriptionId, status }, page, limit);
      return res.status(200).json(result);
    } catch (error) { return this.handleError(res, error, 'Failed to list periods.'); }
  };

  listDemoRequests = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page  = Math.max(1, Number(req.query.page)  || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const { status } = req.query as Record<string, string>;
      const result = await this.uc.listDemoRequests({ status }, page, limit);
      return res.status(200).json(result);
    } catch (error) { return this.handleError(res, error, 'Failed to list demo requests.'); }
  };

  updateDemoRequest = async (req: Request<{ id: string }>, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.updateDemoRequest(req.params.id, req.body);
      return res.status(200).json({ message: 'Demo request updated.', data });
    } catch (error) { return this.handleError(res, error, 'Failed to update demo request.'); }
  };
}
