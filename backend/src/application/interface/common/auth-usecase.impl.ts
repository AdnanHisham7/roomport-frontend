import type {
  ForgotPasswordRequestDTO,
  LoginRequestDTO,
  LoginResponseDTO,
  RefreshTokenRequestDTO,
  RefreshTokenResponseDTO,
  ResendOtpRequestDTO,
  ResetPasswordRequestDTO,
  SendOtpRequestDTO,
  VerifyEmailRequestDTO,
  ValidateOtpRequestDTO
} from '../../dtos/user-usecaase/authdto';

export interface IAuthUseCases {
  login(data: LoginRequestDTO): Promise<LoginResponseDTO>;
  logout(userId: string): Promise<void>;
  refreshToken(data: RefreshTokenRequestDTO): Promise<RefreshTokenResponseDTO>;
  sendOtp(data: SendOtpRequestDTO): Promise<void>;
  validateOtp(data: ValidateOtpRequestDTO): Promise<{ resetToken: string }>;
  resendOtp(data: ResendOtpRequestDTO): Promise<void>;
  verifyEmail(data: VerifyEmailRequestDTO): Promise<void>;
  forgotPassword(data: ForgotPasswordRequestDTO): Promise<void>;
  resetPassword(data: ResetPasswordRequestDTO): Promise<void>;
}
