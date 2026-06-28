import { baseApi } from './baseApi';
import type { PlatformStats, BuilderListItem, BuilderDetail, PlatformSetting, Subscription, SubscriptionPeriod, DemoRequest } from '@/types/platform';
import type { Building } from '@/types/building';
import type { ActivityLog } from '@/types/activity';

interface SAPage<T> { data: T[]; total: number; page: number; limit: number; totalPages: number }

export interface RegisterBuilderInput {
  firstName:         string;
  lastName:          string;
  email:             string;
  phone?:            string;
  billingCycle:      'monthly' | 'yearly';
  numberOfBuildings: number;
  numberOfUnits:     number;
  amount:            number;
  notes?:            string;
}

export interface UpgradeRequest {
  _id:                   string;
  userId:                { _id: string; first_name: string; last_name: string; email: string; phone_number?: string } | string;
  subscriptionId?:       string;
  additionalBuildings?:  number;
  additionalUnits?:      number;
  additionalBuildingData?: Array<{ name: string; rooms: number }>;
  message?:              string;
  status:                'pending' | 'approved' | 'rejected' | 'cancelled';
  adminNotes?:           string;
  resolvedBy?:           string;
  resolvedAt?:           string;
  createdAt?:            string;
  updatedAt?:            string;
}

export interface ResolveUpgradeRequestInput {
  id:                 string;
  status:             'approved' | 'rejected';
  adminNotes?:        string;
  numberOfBuildings?: number;
  numberOfUnits?:     number;
  amount?:            number;
}

export const superAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlatformStats: builder.query<{ data: PlatformStats }, void>({
      query: () => '/super-admin/stats',
      providesTags: ['SuperAdminStats'],
    }),

    // ── Builder Management ─────────────────────────────────────────────────────
    registerBuilder: builder.mutation<{ userId: string; message: string }, RegisterBuilderInput>({
      query: (body) => ({ url: '/super-admin/builders/register', method: 'POST', body }),
      invalidatesTags: ['SuperAdminBuilders', 'SuperAdminStats', 'Subscription'],
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

    // ── Buildings ──────────────────────────────────────────────────────────────
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

    // ── Activity Logs ──────────────────────────────────────────────────────────
    getSuperAdminActivityLogs: builder.query<SAPage<ActivityLog>, { page?: number; limit?: number; action?: string } | void>({
      query: (params) => ({ url: '/super-admin/activity-logs', params: params ?? undefined }),
    }),

    // ── Settings ───────────────────────────────────────────────────────────────
    getPlatformSettings: builder.query<{ data: PlatformSetting }, void>({
      query: () => '/super-admin/settings',
      providesTags: ['SuperAdminSettings'],
    }),
    updatePlatformSettings: builder.mutation<{ data: PlatformSetting; message?: string }, Partial<PlatformSetting>>({
      query: (body) => ({ url: '/super-admin/settings', method: 'PUT', body }),
      invalidatesTags: ['SuperAdminSettings'],
    }),

    // ── Subscriptions ──────────────────────────────────────────────────────────
    getSuperAdminSubscriptions: builder.query<SAPage<Subscription & { ownerName?: string; periods?: SubscriptionPeriod[] }>, { userId?: string; status?: string; page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/super-admin/subscriptions', params: params ?? undefined }),
      providesTags: ['Subscription'],
    }),
    updateSuperAdminSubscription: builder.mutation<{ data: Subscription; message?: string }, { id: string; body: Partial<{ numberOfBuildings: number; numberOfUnits: number; status: string; amount: number; billingCycle: string }> }>({
      query: ({ id, body }) => ({ url: `/super-admin/subscriptions/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Subscription'],
    }),
    getSubscriptionPeriods: builder.query<SAPage<SubscriptionPeriod>, { subscriptionId?: string; userId?: string; status?: string; page?: number } | void>({
      query: (params) => ({ url: '/subscriptions/admin/periods', params: params ?? undefined }),
      providesTags: ['Subscription'],
    }),
    markPeriodPaid: builder.mutation<{ data: SubscriptionPeriod; message: string }, { periodId: string; paidAt?: string; notes?: string }>({
      query: ({ periodId, ...body }) => ({ url: `/subscriptions/admin/periods/${periodId}/pay`, method: 'POST', body }),
      invalidatesTags: ['Subscription', 'SuperAdminStats'],
    }),

    // ── Demo Requests ──────────────────────────────────────────────────────────
    getDemoRequests: builder.query<SAPage<DemoRequest>, { status?: string; page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/subscriptions/admin/demo-requests', params: params ?? undefined }),
      providesTags: ['SuperAdminStats'],
    }),
    updateDemoRequest: builder.mutation<{ data: DemoRequest; message: string }, { id: string; status?: string; adminNotes?: string }>({
      query: ({ id, ...body }) => ({ url: `/subscriptions/admin/demo-requests/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['SuperAdminStats'],
    }),

    // ── Upgrade Requests ───────────────────────────────────────────────────────
    getUpgradeRequests: builder.query<SAPage<UpgradeRequest>, { status?: string; userId?: string; page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/super-admin/upgrade-requests', params: params ?? undefined }),
      providesTags: ['UpgradeRequests'],
    }),
    resolveUpgradeRequest: builder.mutation<{ message: string }, ResolveUpgradeRequestInput>({
      query: ({ id, ...body }) => ({ url: `/super-admin/upgrade-requests/${id}/resolve`, method: 'POST', body }),
      invalidatesTags: ['UpgradeRequests', 'Subscription', 'Notification'],
    }),
  }),
});

export const {
  useGetPlatformStatsQuery,
  useRegisterBuilderMutation,
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
  useGetSubscriptionPeriodsQuery,
  useMarkPeriodPaidMutation,
  useGetDemoRequestsQuery,
  useUpdateDemoRequestMutation,
  useGetUpgradeRequestsQuery,
  useResolveUpgradeRequestMutation,
} = superAdminApi;
