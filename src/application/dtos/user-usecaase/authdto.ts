import { OtpPurpose } from "../../../shared/enums/OtpPurpose.enum";

// ─── Login ────────────────────────────────────────────────────────────────────
export interface LoginRequestDTO {
  email:    string;
  password: string;
}

export interface LoginResponseDTO {
  accessToken:  string;
  refreshToken: string;
  user: {
    _id:           string;
    email:         string;
    first_name:    string;
    last_name:     string;
    role:          string;
    status:        string;
    email_verified: boolean;
    building_id?:  string | null;
    lastLoginAt?:  Date;
  };
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
export interface RefreshTokenRequestDTO  { refreshToken: string; }
export interface RefreshTokenResponseDTO { accessToken: string; refreshToken: string; }

// ─── OTP ─────────────────────────────────────────────────────────────────────
export interface SendOtpRequestDTO   { email: string; purpose: OtpPurpose; }
export interface ValidateOtpRequestDTO { email: string; otp: string; }
export interface ResendOtpRequestDTO { email: string; purpose: OtpPurpose; }

// ─── Email Verification ───────────────────────────────────────────────────────
export interface VerifyEmailRequestDTO { email: string; otp: string; }

// ─── Forgot / Reset Password ──────────────────────────────────────────────────
export interface ForgotPasswordRequestDTO { email: string; }
export interface ResetPasswordRequestDTO  {
  email:       string;
  otp:         string;
  newPassword: string;
}
