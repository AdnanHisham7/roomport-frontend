import { baseApi } from './baseApi';
import type { Expense, ExpenseTrackerSummary } from '@/types/tenancy';

export const expenseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenses: builder.query<{ data: Expense[] }, { buildingId?: string; unitId?: string; category?: string; status?: string } | void>({
      query: (params) => ({ url: '/expenses', params: params ?? undefined }),
      providesTags: (result) =>
        result ? [...result.data.map((e) => ({ type: 'Expense' as const, id: e._id })), { type: 'Expense' as const, id: 'LIST' }] : [{ type: 'Expense' as const, id: 'LIST' }],
    }),
    getExpenseById: builder.query<{ data: Expense }, string>({
      query: (id) => `/expenses/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Expense', id }],
    }),
    createExpense: builder.mutation<{ data: Expense; message?: string }, Partial<Expense>>({
      query: (body) => ({ url: '/expenses', method: 'POST', body }),
      invalidatesTags: [{ type: 'Expense', id: 'LIST' }],
    }),
    updateExpense: builder.mutation<{ data: Expense; message?: string }, { id: string; body: Partial<Expense> }>({
      query: ({ id, body }) => ({ url: `/expenses/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Expense', id }, { type: 'Expense', id: 'LIST' }],
    }),
    deleteExpense: builder.mutation<{ message?: string }, string>({
      query: (id) => ({ url: `/expenses/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Expense', id: 'LIST' }],
    }),
    getExpenseTrackerSummary: builder.query<{ data: ExpenseTrackerSummary }, { buildingId: string; period?: string; year?: number; month?: number; week?: number }>({
      query: ({ buildingId, ...params }) => ({ url: `/expenses/tracker/${buildingId}/summary`, params }),
      providesTags: [{ type: 'Expense', id: 'TRACKER' }],
    }),
  }),
});

export const {
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetExpenseTrackerSummaryQuery,
} = expenseApi;
