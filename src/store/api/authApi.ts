import { baseApi } from './baseApi';
import type { LoginResponse, AuthUser } from '@/types/auth';

interface MsgRes { message?: string; suggestion?: string }

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<MsgRes, { email: string; password: string; first_name: string; last_name: string; phone_number?: string }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    login: builder.mutation<{ data: LoginResponse } & MsgRes, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    logout: builder.mutation<MsgRes, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    sendOtp: builder.mutation<MsgRes, { email: string; purpose: string }>({
      query: (body) => ({ url: '/auth/send-otp', method: 'POST', body }),
    }),
    resendOtp: builder.mutation<MsgRes, { email: string; purpose: string }>({
      query: (body) => ({ url: '/auth/resend-otp', method: 'POST', body }),
    }),
    validateOtp: builder.mutation<MsgRes & { data?: unknown }, { email: string; otp: string }>({
      query: (body) => ({ url: '/auth/validate-otp', method: 'POST', body }),
    }),
    verifyEmail: builder.mutation<MsgRes, { email: string; otp: string }>({
      query: (body) => ({ url: '/auth/verify-email', method: 'POST', body }),
    }),
    forgotPassword: builder.mutation<MsgRes, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<MsgRes, { email: string; otp: string; newPassword: string }>({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    bootstrapSuperAdmin: builder.mutation<MsgRes, { email: string; password: string; first_name: string; last_name: string; phone_number?: string }>({
      query: (body) => ({ url: '/system/bootstrap', method: 'POST', body }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useSendOtpMutation,
  useResendOtpMutation,
  useValidateOtpMutation,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useBootstrapSuperAdminMutation,
} = authApi;

export type { AuthUser };
