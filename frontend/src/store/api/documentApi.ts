import { baseApi } from './baseApi';
import type { RentalDocument } from '@/types/tenancy';

export const documentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDocuments: builder.query<{ data: RentalDocument[] }, { buildingId?: string; unitId?: string; tenantId?: string; type?: string } | void>({
      query: (params) => ({ url: '/documents/getdocuments', params: params ?? undefined }),
      providesTags: (result) =>
        result ? [...result.data.map((d) => ({ type: 'Document' as const, id: d._id })), { type: 'Document' as const, id: 'LIST' }] : [{ type: 'Document' as const, id: 'LIST' }],
    }),
    getDocumentById: builder.query<{ data: RentalDocument }, string>({
      query: (id) => `/documents/getdocument/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Document', id }],
    }),
    createDocument: builder.mutation<{ data: RentalDocument; message?: string }, Partial<RentalDocument>>({
      query: (body) => ({ url: '/documents/createdocument', method: 'POST', body }),
      invalidatesTags: [{ type: 'Document', id: 'LIST' }],
    }),
    deleteDocument: builder.mutation<{ message?: string }, string>({
      query: (id) => ({ url: `/documents/deletedocument/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Document', id: 'LIST' }],
    }),
  }),
});

export const { useGetDocumentsQuery, useGetDocumentByIdQuery, useCreateDocumentMutation, useDeleteDocumentMutation } = documentApi;
