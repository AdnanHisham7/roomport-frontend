import { baseApi } from './baseApi';
import type { Inquiry, InquiryStatus } from '@/types/platform';

interface InquiryPage { data: Inquiry[]; total: number; page: number; limit: number }

export const inquiryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createInquiry: builder.mutation<{ message: string; data: Inquiry }, { buildingId: string; unitId?: string; name: string; email: string; phone?: string; message?: string }>({
      query: (body) => ({ url: '/inquiries', method: 'POST', body }),
    }),
    getInquiries: builder.query<InquiryPage, { buildingId?: string; status?: InquiryStatus; page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/inquiries', params: params ?? undefined }),
      providesTags: (result) =>
        result ? [...result.data.map((i) => ({ type: 'Inquiry' as const, id: i._id })), { type: 'Inquiry' as const, id: 'LIST' }] : [{ type: 'Inquiry' as const, id: 'LIST' }],
    }),
    updateInquiryStatus: builder.mutation<{ message: string; data: Inquiry }, { id: string; status: InquiryStatus }>({
      query: ({ id, ...body }) => ({ url: `/inquiries/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Inquiry', id: 'LIST' }],
    }),
    deleteInquiry: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/inquiries/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Inquiry', id: 'LIST' }],
    }),
  }),
});

export const {
  useCreateInquiryMutation,
  useGetInquiriesQuery,
  useUpdateInquiryStatusMutation,
  useDeleteInquiryMutation,
} = inquiryApi;
