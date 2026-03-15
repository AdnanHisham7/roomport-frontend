import bcrypt from "bcryptjs";
import { IAuthUseCases } from "../../interface/common/auth-usecase.impl";
import { IUserRepository } from "../../../domain/repository/user-repository-impl";
import { IJwtService } from "../../interface/common/jwt-service-usecase.impl";
import { IEmailService } from "../../interface/common/email-service-usecase.impl";
import { ForgotPasswordRequestDTO, LoginRequestDTO, LoginResponseDTO, RefreshTokenRequestDTO, RefreshTokenResponseDTO, ResendOtpRequestDTO, ResetPasswordRequestDTO, SendOtpRequestDTO, ValidateOtpRequestDTO, VerifyEmailRequestDTO } from "../../dtos/user-usecaase/authdto";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "../../../shared/error/app-error";
import { OtpPurpose } from "../../../shared/enums/OtpPurpose.enum";


const OTP_EXPIRY_MINUTES = 10;
const SALT_ROUNDS        = 12;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export class AuthUseCases implements IAuthUseCases {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService:     IJwtService,
    private readonly emailService:   IEmailService
  ) {}

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  async login(data: LoginRequestDTO): Promise<LoginResponseDTO> {
    const user = await this.userRepository.findByEmailWithRole(data.email);

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

    if (!user.isEmailVerified) {
      throw new ForbiddenError(
        'Email not verified.',
        'Please verify your email before logging in. Check your inbox for the OTP.'
      );
    }

    const payload      = { userId: user._id!, email: user.email };
    const accessToken  = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    // Store a hashed copy of the refresh token for rotation validation
    const hashedRefresh = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    await this.userRepository.updateRefreshToken(user._id!, hashedRefresh);
    await this.userRepository.updateLastLogin(user._id!);

    return {
      accessToken,
      refreshToken,
      user: {
        _id:             user._id!,
        email:           user.email,
        firstName:       user.firstName,
        lastName:        user.lastName,
        isEmailVerified: user.isEmailVerified,
        roleId:          user.role._id!,        // ObjectId of the role
        roleName:        user.role.name,         // 'superAdmin' | 'admin' | custom
        companyId:       user.companyId ?? null, // null for superAdmin
      },
    };
  }

  // ─── LOGOUT ───────────────────────────────────────────────────────────────
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

  // ─── REFRESH TOKEN ────────────────────────────────────────────────────────
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

    if (!user || !user.refreshToken) {
      throw new UnauthorizedError(
        'Session not found.',
        'Your session has expired. Please login again.'
      );
    }

    const isTokenValid = await bcrypt.compare(data.refreshToken, user.refreshToken);
    if (!isTokenValid) {
      // Possible token-reuse attack — invalidate all sessions
      await this.userRepository.updateRefreshToken(payload.userId, null);
      throw new UnauthorizedError(
        'Refresh token reuse detected. All sessions have been invalidated.',
        'Please login again for security reasons.'
      );
    }

    const newPayload      = { userId: user._id!, email: user.email };
    const newAccessToken  = this.jwtService.generateAccessToken(newPayload);
    const newRefreshToken = this.jwtService.generateRefreshToken(newPayload);

    const hashedRefresh = await bcrypt.hash(newRefreshToken, SALT_ROUNDS);
    await this.userRepository.updateRefreshToken(user._id!, hashedRefresh);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  // ─── SEND OTP ─────────────────────────────────────────────────────────────
  async sendOtp(data: SendOtpRequestDTO): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new NotFoundError(
        'No account found with this email address.',
        'Please check the email entered or contact support.'
      );
    }

    if (data.purpose === OtpPurpose.EMAIL_VERIFICATION && user.isEmailVerified) {
      throw new BadRequestError(
        'Email is already verified.',
        'You can proceed to login.'
      );
    }

    const otp          = generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.userRepository.updateOtp(data.email, otp, otpExpiresAt);
    await this.emailService.sendOtpEmail(data.email, otp, data.purpose);
  }

  // ─── RESEND OTP ───────────────────────────────────────────────────────────
  async resendOtp(data: ResendOtpRequestDTO): Promise<void> {
    await this.sendOtp({ email: data.email, purpose: data.purpose });
  }

  // ─── VALIDATE OTP ─────────────────────────────────────────────────────────
  async validateOtp(data: ValidateOtpRequestDTO): Promise<{ resetToken: string }> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new NotFoundError(
        'No account found with this email address.',
        'Please check the email entered or contact support.'
      );
    }

    if (!user.otp || !user.otpExpiresAt) {
      throw new BadRequestError(
        'No OTP was requested for this account.',
        'Please request a new OTP and try again.'
      );
    }

    if (user.otp !== data.otp) {
      throw new BadRequestError(
        'Invalid OTP.',
        'Please check the OTP sent to your email and try again.'
      );
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestError(
        'OTP has expired.',
        `OTP is valid for ${OTP_EXPIRY_MINUTES} minutes. Please request a new one.`
      );
    }

    const resetToken = this.jwtService.generateAccessToken({
      userId: user._id!,
      email:  user.email,
    });

    return { resetToken };
  }

  // ─── VERIFY EMAIL ─────────────────────────────────────────────────────────
  async verifyEmail(data: VerifyEmailRequestDTO): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new NotFoundError(
        'No account found with this email address.',
        'Please check the email entered or contact support.'
      );
    }

    if (user.isEmailVerified) {
      throw new BadRequestError(
        'Email is already verified.',
        'You can proceed to login.'
      );
    }

    if (!user.otp || !user.otpExpiresAt) {
      throw new BadRequestError(
        'No OTP was requested for this account.',
        'Please request a new OTP and try again.'
      );
    }

    if (user.otp !== data.otp) {
      throw new BadRequestError(
        'Invalid OTP.',
        'Please check the OTP sent to your email and try again.'
      );
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestError(
        'OTP has expired.',
        `OTP is valid for ${OTP_EXPIRY_MINUTES} minutes. Please request a new one.`
      );
    }

    await this.userRepository.verifyEmail(data.email);
    await this.userRepository.clearOtp(data.email);
  }

  // ─── FORGOT PASSWORD ──────────────────────────────────────────────────────
  async forgotPassword(data: ForgotPasswordRequestDTO): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email);

    // Always return without error to prevent user enumeration
   if (!user) {
    throw new NotFoundError(
      'No account found with this email address.',
      'Please check the email address and try again.'
    );
  }

    const otp          = generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.emailService.sendOtpEmail(data.email, otp, OtpPurpose.FORGOT_PASSWORD);
    await this.userRepository.updateOtp(data.email, otp, otpExpiresAt);
  }

  // ─── RESET PASSWORD ───────────────────────────────────────────────────────
  async resetPassword(data: ResetPasswordRequestDTO): Promise<void> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new NotFoundError(
        'No account found with this email address.',
        'Please check the email entered or contact support.'
      );
    }

    if (!user.otp || !user.otpExpiresAt) {
      throw new BadRequestError(
        'No OTP was requested for this account.',
        'Please use the forgot-password flow to request a valid OTP.'
      );
    }

    if (user.otp !== data.otp) {
      throw new BadRequestError(
        'Invalid OTP.',
        'Please check the OTP sent to your email and try again.'
      );
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestError(
        'OTP has expired.',
        `OTP is valid for ${OTP_EXPIRY_MINUTES} minutes. Please request a new one.`
      );
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
    await this.userRepository.updatePassword(data.email, hashedPassword);
    await this.userRepository.clearOtp(data.email);
    await this.userRepository.updateRefreshToken(user._id!, null);
  }
}