import { DashboardMetricsDTO } from '../../application/dtos/analytics/analytics.dto';

export interface IAnalyticsRepository {
  getDashboardMetrics(userId: string): Promise<DashboardMetricsDTO>;
}
