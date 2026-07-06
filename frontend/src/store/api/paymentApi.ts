import { baseApi } from './baseApi';

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation<{ success: boolean; data: { url: string } }, { subscriptionId: string; successUrl: string; cancelUrl: string }>({
      query: (body) => ({ url: '/payments/checkout', method: 'POST', body }),
    }),
    publicCheckout: builder.mutation<{ success: boolean; data: { url: string } }, { firstName: string; lastName: string; email: string; phone?: string; numberOfBuildings: number; numberOfUnits: number; successUrl: string; cancelUrl: string }>({
      query: (body) => ({ url: '/payments/public-checkout', method: 'POST', body }),
    }),
  }),
});

export const { useCreateCheckoutSessionMutation, usePublicCheckoutMutation } = paymentApi;
