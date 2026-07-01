import { logger } from '../../shared/logger/logger';
import { Request, Response } from 'express';
import { AnalyticsUseCase } from '../../application/usecase/analytics/analytics-usecase';

export class AnalyticsController {
  constructor(private readonly analyticsUseCase: AnalyticsUseCase) {}

  async getDashboardMetrics(req: Request, res: Response): Promise<Response> {
    try {
      // Assuming authMiddleware sets req.user.userId
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const metrics = await this.analyticsUseCase.getDashboardMetrics(userId);
      return res.status(200).json({ success: true, data: metrics });
    } catch (error: any) {
      logger.error('Error fetching analytics metrics:', error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}
