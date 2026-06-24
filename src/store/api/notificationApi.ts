import { baseApi } from './baseApi';
import type { AppNotification } from '@/types/activity';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<{ data: AppNotification[] }, void>({
      query: () => '/notifications',
      providesTags: (result) =>
        result ? [...result.data.map((n) => ({ type: 'Notification' as const, id: n._id })), { type: 'Notification' as const, id: 'LIST' }] : [{ type: 'Notification' as const, id: 'LIST' }],
    }),
    getUnreadCount: builder.query<{ success: boolean; data: { count: number } }, void>({
      query: () => '/notifications/unread-count',
      providesTags: [{ type: 'Notification', id: 'COUNT' }],
    }),
    markNotificationRead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }, { type: 'Notification', id: 'COUNT' }],
    }),
    markAllNotificationsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: '/notifications/read-all', method: 'PATCH' }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }, { type: 'Notification', id: 'COUNT' }],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;
