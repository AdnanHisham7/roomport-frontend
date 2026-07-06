import { baseApi } from './baseApi';
import type { DashboardMetrics } from '@/types/analytics';

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query<{ data: DashboardMetrics }, void>({
      query: () => '/analytics/dashboard',
      providesTags: ['Analytics'],
    }),
  }),
});

export const { useGetDashboardMetricsQuery } = analyticsApi;
