import { baseApi } from './baseApi';
import type { ActivityLog } from '@/types/activity';

interface ActivityLogPage {
  success: boolean;
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
}

export const activityLogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivityLogs: builder.query<ActivityLogPage, { buildingId?: string; page?: number; limit?: number; action?: string } | void>({
      query: (params) => ({ url: '/activity-logs', params: params ?? undefined }),
      providesTags: ['ActivityLog'],
    }),
  }),
});

export const { useGetActivityLogsQuery } = activityLogApi;
