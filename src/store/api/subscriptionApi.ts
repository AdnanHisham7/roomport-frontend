import { baseApi } from './baseApi';
import type { Subscription } from '@/types/platform';

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPricing: builder.query<{ data: { pricePerBuilding: number; pricePerUnit: number; currency: string } }, void>({
      query: () => '/subscriptions/pricing',
    }),
    createQuote: builder.mutation<{ data: Subscription; message?: string }, { numberOfBuildings: number; numberOfUnits: number }>({
      query: (body) => ({ url: '/subscriptions/quote', method: 'POST', body }),
      invalidatesTags: ['Subscription'],
    }),
    getMySubscription: builder.query<{ data: Subscription | null }, void>({
      query: () => '/subscriptions/me',
      providesTags: ['Subscription'],
    }),
    getSubscriptionHistory: builder.query<{ data: Subscription[] }, void>({
      query: () => '/subscriptions/me/history',
      providesTags: ['Subscription'],
    }),
  }),
});

export const {
  useGetPricingQuery,
  useCreateQuoteMutation,
  useGetMySubscriptionQuery,
  useGetSubscriptionHistoryQuery,
} = subscriptionApi;
