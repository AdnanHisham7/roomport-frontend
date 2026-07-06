import { baseApi } from './baseApi';
import type { Subscription, SubscriptionPeriod } from '@/types/platform';

export interface BookDemoInput {
  firstName:         string;
  lastName:          string;
  email:             string;
  phone?:            string;
  companyName?:      string;
  numberOfBuildings: number;
  numberOfUnits:     number;
  message?:          string;
}

export interface UpgradeRequestInput {
  additionalBuildings?:    number;
  additionalUnits?:        number;
  additionalBuildingData?: { name: string; rooms: number }[];
  message?:                string;
}

export interface PricingData {
  monthlyPricePerBuilding: number;
  monthlyPricePerUnit:     number;
  yearlyPricePerBuilding:  number;
  yearlyPricePerUnit:      number;
  currency:                string;
  // Legacy compat
  pricePerBuilding:        number;
  pricePerUnit:            number;
}

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPricing: builder.query<{ data: PricingData }, void>({
      query: () => '/subscriptions/pricing',
    }),
    bookDemo: builder.mutation<{ message: string }, BookDemoInput>({
      query: (body) => ({ url: '/subscriptions/demo', method: 'POST', body }),
    }),
    requestUpgrade: builder.mutation<{ message: string }, UpgradeRequestInput>({
      query: (body) => ({ url: '/subscriptions/upgrade-request', method: 'POST', body }),
      invalidatesTags: ['Subscription'],
    }),
    getMySubscription: builder.query<{ data: Subscription | null }, void>({
      query: () => '/subscriptions/me',
      providesTags: ['Subscription'],
    }),
    getMyPeriods: builder.query<{ data: SubscriptionPeriod[] }, void>({
      query: () => '/subscriptions/me/periods',
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
  useBookDemoMutation,
  useRequestUpgradeMutation,
  useGetMySubscriptionQuery,
  useGetMyPeriodsQuery,
  useGetSubscriptionHistoryQuery,
} = subscriptionApi;
