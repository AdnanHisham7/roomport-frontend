import type { Request, Response } from "express";
import { ISubscriptionUseCases } from "../../application/interface/subscription/subscription-usecase.impl";
import { AppError } from "../../shared/error/app-error";

export class SubscriptionController {
  constructor(private readonly uc: ISubscriptionUseCases) {}

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

  createQuote = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.createQuote(req.user!.userId, req.body);
      return res.status(201).json({ message: 'Subscription quote created. Proceed to checkout to activate it.', data });
    } catch (error) { return this.handleError(res, error, 'Failed to create subscription quote.'); }
  };

  getMine = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.getMine(req.user!.userId);
      return res.status(200).json({ data });
    } catch (error) { return this.handleError(res, error, 'Failed to fetch subscription.'); }
  };

  getHistory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const data = await this.uc.getHistory(req.user!.userId);
      return res.status(200).json({ data });
    } catch (error) { return this.handleError(res, error, 'Failed to fetch subscription history.'); }
  };
}
