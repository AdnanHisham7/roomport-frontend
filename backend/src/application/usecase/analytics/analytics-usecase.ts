import { IAnalyticsRepository } from '../../../domain/repository/analytics-repository-impl';
import { DashboardMetricsDTO } from '../../dtos/analytics/analytics.dto';

export class AnalyticsUseCase {
  constructor(private readonly analyticsRepository: IAnalyticsRepository) {}

  async getDashboardMetrics(userId: string): Promise<DashboardMetricsDTO> {
    if (!userId) {
      throw new Error('User ID is required to fetch dashboard metrics');
    }
    return await this.analyticsRepository.getDashboardMetrics(userId);
  }
}
