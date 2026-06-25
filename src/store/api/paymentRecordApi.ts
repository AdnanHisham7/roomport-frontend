import { baseApi } from './baseApi';
import type { PaymentRecord, PaymentRecordStatus, PaymentMethod } from '@/types/platform';

export interface RecordPaymentInput {
  periodDate?: string;       // ISO date — leave blank for current period
  status?: PaymentRecordStatus;
  method?: PaymentMethod;
  amount?: number;
  notes?: string;
  receiptUrl?: string;
}

export const paymentRecordApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentRecords: builder.query<{ data: PaymentRecord[] }, string>({
      query: (tenantId) => `/payment-records/tenant/${tenantId}`,
      providesTags: (_r, _e, tenantId) => [{ type: 'PaymentRecord' as const, id: tenantId }],
    }),
    recordPayment: builder.mutation<{ data: PaymentRecord; message: string }, { tenantId: string } & RecordPaymentInput>({
      query: ({ tenantId, ...body }) => ({ url: `/payment-records/tenant/${tenantId}`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { tenantId }) => [{ type: 'PaymentRecord' as const, id: tenantId }],
    }),
    updatePaymentRecord: builder.mutation<{ data: PaymentRecord }, { id: string; body: Partial<PaymentRecord> }>({
      query: ({ id, body }) => ({ url: `/payment-records/${id}`, method: 'PATCH', body }),
      invalidatesTags: () => [{ type: 'PaymentRecord' as const, id: 'LIST' }],
    }),
    deletePaymentRecord: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/payment-records/${id}`, method: 'DELETE' }),
      invalidatesTags: () => [{ type: 'PaymentRecord' as const, id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPaymentRecordsQuery,
  useRecordPaymentMutation,
  useUpdatePaymentRecordMutation,
  useDeletePaymentRecordMutation,
} = paymentRecordApi;
