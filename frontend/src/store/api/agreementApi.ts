import { baseApi } from './baseApi';
import type { Agreement, AgreementStatus } from '@/types/tenancy';

export interface PublicAgreement {
  _id: string;
  title: string;
  body: string;
  terms?: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  status: AgreementStatus;
  tenantName?: string;
}

export const agreementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAgreements: builder.query<{ data: Agreement[] }, { tenantId?: string; buildingId?: string; status?: string } | void>({
      query: (params) => ({ url: '/agreements/all', params: params ?? undefined }),
      providesTags: (result) =>
        result ? [...result.data.map((a) => ({ type: 'Agreement' as const, id: a._id })), { type: 'Agreement' as const, id: 'LIST' }] : [{ type: 'Agreement' as const, id: 'LIST' }],
    }),
    getAgreementById: builder.query<{ data: Agreement }, string>({
      query: (id) => `/agreements/agreement/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Agreement', id }],
    }),
    createAgreement: builder.mutation<{ data: Agreement; message?: string }, { tenantId: string; buildingId: string; unitId?: string; title: string; body: string; terms?: string; monthlyRent: number; startDate: string; endDate: string }>({
      query: (body) => ({ url: '/agreements/create', method: 'POST', body }),
      invalidatesTags: [{ type: 'Agreement', id: 'LIST' }],
    }),
    sendSigningLink: builder.mutation<{ message: string; expiresAt: string }, { id: string; expiresInHours?: number }>({
      query: ({ id, ...body }) => ({ url: `/agreements/agreement/${id}/send`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Agreement', id }, { type: 'Agreement', id: 'LIST' }],
    }),
    cancelAgreement: builder.mutation<{ data: Agreement; message?: string }, string>({
      query: (id) => ({ url: `/agreements/agreement/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Agreement', id }, { type: 'Agreement', id: 'LIST' }],
    }),

    // ── Public signing flow (no auth) ─────────────────────────────────────────
    viewAgreementByToken: builder.query<{ data: PublicAgreement }, string>({
      query: (token) => `/agreements/sign/${token}`,
    }),
    initiateSigning: builder.mutation<{ message: string; otpExpiresAt: string }, { token: string; typedSignatureName: string }>({
      query: ({ token, ...body }) => ({ url: `/agreements/sign/${token}/initiate`, method: 'POST', body }),
    }),
    verifySigningOtp: builder.mutation<{ message: string; finalPdfUrl: string }, { token: string; otp: string }>({
      query: ({ token, ...body }) => ({ url: `/agreements/sign/${token}/verify-otp`, method: 'POST', body }),
    }),
  }),
});

export const {
  useGetAgreementsQuery,
  useGetAgreementByIdQuery,
  useCreateAgreementMutation,
  useSendSigningLinkMutation,
  useCancelAgreementMutation,
  useViewAgreementByTokenQuery,
  useInitiateSigningMutation,
  useVerifySigningOtpMutation,
} = agreementApi;
