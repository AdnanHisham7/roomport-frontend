import { baseApi } from './baseApi';
import type { PlatformStats, BuilderListItem, BuilderDetail, PlatformSetting, Subscription } from '@/types/platform';
import type { Building } from '@/types/building';
import type { ActivityLog } from '@/types/activity';

interface SAPage<T> { data: T[]; total: number; page: number; limit: number; totalPages: number }

export const superAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformStats: builder.query<{ data: PlatformStats }, void>({
      query: () => '/super-admin/stats',
      providesTags: ['SuperAdminStats'],
    }),
    getBuilders: builder.query<SAPage<BuilderListItem>, { search?: string; status?: string; page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/super-admin/builders', params: params ?? undefined }),
      providesTags: ['SuperAdminBuilders'],
    }),
    getBuilderDetail: builder.query<{ data: BuilderDetail }, string>({
      query: (id) => `/super-admin/builders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'SuperAdminBuilders', id }],
    }),
    updateBuilderStatus: builder.mutation<{ message: string }, { id: string; status: string }>({
      query: ({ id, ...body }) => ({ url: `/super-admin/builders/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: ['SuperAdminBuilders', 'SuperAdminStats'],
    }),
    deleteBuilder: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/super-admin/builders/${id}`, method: 'DELETE' }),
      invalidatesTags: ['SuperAdminBuilders', 'SuperAdminStats'],
    }),
    getSuperAdminBuildings: builder.query<SAPage<Building & { ownerName?: string }>, { search?: string; status?: string; isPublished?: boolean; isFeatured?: boolean; page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/super-admin/buildings', params: params ?? undefined }),
      providesTags: ['SuperAdminBuildings'],
    }),
    toggleBuildingFeature: builder.mutation<{ message: string }, { id: string; isFeatured: boolean }>({
      query: ({ id, ...body }) => ({ url: `/super-admin/buildings/${id}/feature`, method: 'PATCH', body }),
      invalidatesTags: ['SuperAdminBuildings'],
    }),
    toggleBuildingPublish: builder.mutation<{ message: string }, { id: string; isPublished: boolean }>({
      query: ({ id, ...body }) => ({ url: `/super-admin/buildings/${id}/publish`, method: 'PATCH', body }),
      invalidatesTags: ['SuperAdminBuildings'],
    }),
    deleteSuperAdminBuilding: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/super-admin/buildings/${id}`, method: 'DELETE' }),
      invalidatesTags: ['SuperAdminBuildings', 'SuperAdminStats'],
    }),
    getSuperAdminActivityLogs: builder.query<SAPage<ActivityLog>, { page?: number; limit?: number; action?: string } | void>({
      query: (params) => ({ url: '/super-admin/activity-logs', params: params ?? undefined }),
    }),
    getPlatformSettings: builder.query<{ data: PlatformSetting }, void>({
      query: () => '/super-admin/settings',
      providesTags: ['SuperAdminSettings'],
    }),
    updatePlatformSettings: builder.mutation<{ data: PlatformSetting; message?: string }, Partial<PlatformSetting>>({
      query: (body) => ({ url: '/super-admin/settings', method: 'PUT', body }),
      invalidatesTags: ['SuperAdminSettings'],
    }),
    getSuperAdminSubscriptions: builder.query<SAPage<Subscription & { ownerName?: string }>, { userId?: string; status?: string; page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/super-admin/subscriptions', params: params ?? undefined }),
      providesTags: ['Subscription'],
    }),
    updateSuperAdminSubscription: builder.mutation<{ data: Subscription; message?: string }, { id: string; body: Partial<{ numberOfBuildings: number; numberOfUnits: number; status: string; amount: number }> }>({
      query: ({ id, body }) => ({ url: `/super-admin/subscriptions/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Subscription'],
    }),
  }),
});

export const {
  useGetPlatformStatsQuery,
  useGetBuildersQuery,
  useGetBuilderDetailQuery,
  useUpdateBuilderStatusMutation,
  useDeleteBuilderMutation,
  useGetSuperAdminBuildingsQuery,
  useToggleBuildingFeatureMutation,
  useToggleBuildingPublishMutation,
  useDeleteSuperAdminBuildingMutation,
  useGetSuperAdminActivityLogsQuery,
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
  useGetSuperAdminSubscriptionsQuery,
  useUpdateSuperAdminSubscriptionMutation,
} = superAdminApi;
