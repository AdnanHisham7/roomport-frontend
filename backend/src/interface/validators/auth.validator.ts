import { z } from 'zod';
import { OtpPurpose } from '../../shared/enums/OtpPurpose.enum';

const email = z.string().trim().toLowerCase().email('A valid email address is required.');
const password = z.string().min(8, 'Password must be at least 8 characters.');
const otpPurpose = z.nativeEnum(OtpPurpose, {
  message: `Purpose must be one of: ${Object.values(OtpPurpose).join(', ')}.`,
});

export const registerSchema = z.object({
  email,
  password,
  first_name:   z.string().trim().min(1, 'first_name is required.'),
  last_name:    z.string().trim().min(1, 'last_name is required.'),
  phone_number: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required.'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required.'),
});

export const sendOtpSchema = z.object({
  email,
  purpose: otpPurpose,
});

export const resendOtpSchema = sendOtpSchema;

export const validateOtpSchema = z.object({
  email,
  otp: z.string().min(1, 'otp is required.'),
});

export const verifyEmailSchema = z.object({
  email,
  otp: z.string().min(1, 'otp is required.'),
});

export const forgotPasswordSchema = z.object({
  email,
});

export const resetPasswordSchema = z.object({
  email,
  otp:         z.string().min(1, 'otp is required.'),
  newPassword: password,
});
