import bcrypt from 'bcryptjs';
import { IAuthUseCases } from '../../interface/common/auth-usecase.impl';
import { IUserRepository } from '../../../domain/repository/user-repository-impl';
import { IJwtService } from '../../interface/common/jwt-service-usecase.impl';
import { IEmailService } from '../../interface/common/email-service-usecase.impl';
import { IOtpService } from '../../interface/common/otp-servie-usecase.impl';
import { ForgotPasswordRequestDTO, LoginRequestDTO, LoginResponseDTO, RefreshTokenRequestDTO, RefreshTokenResponseDTO, ResendOtpRequestDTO, ResetPasswordRequestDTO, SendOtpRequestDTO, ValidateOtpRequestDTO, VerifyEmailRequestDTO } from '../../dtos/user-usecaase/authdto';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from '../../../shared/error/app-error';
import { OtpPurpose } from '../../../shared/enums/OtpPurpose.enum';


const SALT_ROUNDS = 12;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export class AuthUseCases implements IAuthUseCases {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService:     IJwtService,
    private readonly emailService:   IEmailService,
    private readonly otpService:     IOtpService,
  ) {}

  // ─── LOGIN ─────────────────────────────────────────────────────────────────
  async login(data: LoginRequestDTO): Promise<LoginResponseDTO> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError(
        'Invalid email or password.',
        'Please check your credentials and try again.'
      );
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError(
        'Invalid email or password.',
        'Please check your credentials and try again.'
      );
    }

    // Block non-active statuses
    if (user.status === 'pending_verification') {
      throw new ForbiddenError(
        'Email not verified.',
        'Please verify your email before logging in. Check your inbox for the OTP.'
      );
    }
    if (user.status === 'inactive' || user.status === 'suspended') {
      throw new ForbiddenError(
        `Account is ${user.status}.`,
        'Please contact support for assistance.'
      );
    }

    const payload      = { userId: user._id!, email: user.email, role: user.role };
    const accessToken  = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    const hashedRefresh = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await this.userRepository.updateRefreshToken(user._id!, hashedRefresh);
    await this.userRepository.updateLastLogin(user._id!);

    return {
      accessToken,
      refreshToken,
      user: {
        _id:            user._id!,
        email:          user.email,
        first_name:     user.first_name,
        last_name:      user.last_name,
        role:           user.role,
        status:         user.status,
        email_verified: user.email_verified,
        building_id:    user.building_id ?? null,
        lastLoginAt:    new Date(),
      },
    };
  }

  // ─── LOGOUT ────────────────────────────────────────────────────────────────
  async logout(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(
        'User not found.',
        'The user account associated with this session no longer exists.'
      );
    }
    await this.userRepository.updateRefreshToken(userId, null);
  }

  // ─── REFRESH TOKEN ──────────────────────────────────────────────────────────
  async refreshToken(data: RefreshTokenRequestDTO): Promise<RefreshTokenResponseDTO> {
    let payload;
    try {
      payload = this.jwtService.verifyRefreshToken(data.refreshToken);
    } catch {
      throw new UnauthorizedError(
        'Invalid or expired refresh token.',
        'Your session has expired. Please login again.'
      );
    }

    const user = await this.userRepository.findById(payload.userId);

    if (!user || !user.refresh_token) {
      throw new UnauthorizedError(
        'Session not found.',
        'Your session has expired. Please login again.'
      );
    }

    const isTokenValid = await bcrypt.compare(data.refreshToken, user.refresh_token);
    if (!isTokenValid) {
      await this.userRepository.updateRefreshToken(payload.userId, null);
      throw new UnauthorizedError(
        'Refresh token reuse detected. All sessions have been invalidated.',
        'Please login again for security reasons.'
      );
    }

    const newPayload      = { userId: user._id!, email: user.email, role: user.role };
    const newAccessToken  = this.jwtService.generateAccessToken(newPayload);
    const newRefreshToken = this.jwtService.generateRefreshToken(newPayload);

    const hashedRefresh = await bcrypt.hash(newRefreshToken, SALT_ROUNDS);
    await this.userRepository.updateRefreshToken(user._id!, hashedRefresh);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  // ─── SEND OTP (Redis) ────────────────────────────────────────────────────────
  async sendOtp(data: SendOtpRequestDTO): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new NotFoundError(
        'No account found with this email address.',
        'Please check the email entered or contact support.'
      );
    }

    if (data.purpose === OtpPurpose.EMAIL_VERIFICATION && user.email_verified) {
      throw new BadRequestError(
        'Email is already verified.',
        'You can proceed to login.'
      );
    }

    const otp = generateOtp();
    await this.otpService.saveOtp(data.email, data.purpose, otp);
    await this.emailService.sendOtpEmail(data.email, otp, data.purpose);
  }

  // ─── RESEND OTP ─────────────────────────────────────────────────────────────
  async resendOtp(data: ResendOtpRequestDTO): Promise<void> {
    await this.sendOtp({ email: data.email, purpose: data.purpose });
  }

  // ─── VALIDATE OTP (Redis) ────────────────────────────────────────────────────
  async validateOtp(data: ValidateOtpRequestDTO): Promise<{ resetToken: string }> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new NotFoundError(
        'No account found with this email address.',
        'Please check the email entered or contact support.'
      );
    }

    const storedOtp = await this.otpService.getOtp(
      data.email,
      OtpPurpose.FORGOT_PASSWORD
    );

    if (!storedOtp) {
      throw new BadRequestError(
        'No OTP was requested or it has expired.',
        'Please request a new OTP and try again.'
      );
    }

    if (storedOtp !== data.otp) {
      throw new BadRequestError(
        'Invalid OTP.',
        'Please check the OTP sent to your email and try again.'
      );
    }

    await this.otpService.clearOtp(data.email, OtpPurpose.FORGOT_PASSWORD);

    const resetToken = this.jwtService.generateAccessToken({
      userId:   user._id!,
      email:    user.email,
      role: '' as any,
    });

    return { resetToken };
  }

  // ─── VERIFY EMAIL (Redis) ────────────────────────────────────────────────────
  async verifyEmail(data: VerifyEmailRequestDTO): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new NotFoundError(
        'No account found with this email address.',
        'Please check the email entered or contact support.'
      );
    }

    if (user.email_verified) {
      throw new BadRequestError(
        'Email is already verified.',
        'You can proceed to login.'
      );
    }

    const storedOtp = await this.otpService.getOtp(
      data.email,
      OtpPurpose.EMAIL_VERIFICATION
    );

    if (!storedOtp) {
      throw new BadRequestError(
        'No OTP was requested or it has expired.',
        'Please request a new OTP and try again.'
      );
    }

    if (storedOtp !== data.otp) {
      throw new BadRequestError(
        'Invalid OTP.',
        'Please check the OTP sent to your email and try again.'
      );
    }

    await this.otpService.clearOtp(data.email, OtpPurpose.EMAIL_VERIFICATION);
    await this.userRepository.updateEmailVerified(user._id!);
  }

  // ─── FORGOT PASSWORD ─────────────────────────────────────────────────────────
  async forgotPassword(data: ForgotPasswordRequestDTO): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) return; // silent — prevent email enumeration

    const otp = generateOtp();
    await this.otpService.saveOtp(data.email, OtpPurpose.FORGOT_PASSWORD, otp);
    await this.emailService.sendOtpEmail(data.email, otp, OtpPurpose.FORGOT_PASSWORD);
  }

  // ─── RESET PASSWORD ──────────────────────────────────────────────────────────
  async resetPassword(data: ResetPasswordRequestDTO): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new NotFoundError(
        'No account found with this email address.',
        'Please check the email entered or contact support.'
      );
    }

    const storedOtp = await this.otpService.getOtp(
      data.email,
      OtpPurpose.FORGOT_PASSWORD
    );

    if (!storedOtp) {
      throw new BadRequestError(
        'No OTP was requested or it has expired.',
        'Please use the forgot-password flow to request a valid OTP.'
      );
    }

    if (storedOtp !== data.otp) {
      throw new BadRequestError(
        'Invalid OTP.',
        'Please check the OTP sent to your email and try again.'
      );
    }

    await this.otpService.clearOtp(data.email, OtpPurpose.FORGOT_PASSWORD);

    const hashedPassword = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
    await this.userRepository.updatePassword(data.email, hashedPassword);
    await this.userRepository.updateRefreshToken(user._id!, null); // invalidate sessions
  }
}
