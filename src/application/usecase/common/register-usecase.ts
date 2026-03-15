import bcrypt from 'bcryptjs';
import type { RegisterRequestDTO, RegisterResponseDTO } from '../../../application/dtos/user-usecaase/register.dto';
import { BadRequestError } from '../../../shared/error/app-error';
import type { IUserRepository } from '../../../domain/repository/user-repository-impl';
import type { IRoleRepository } from '../../../domain/repository/role-repository-impl';
import type { IEmailService } from '../../interface/common/email-service-usecase.impl';
import type { IRegisterUseCase } from '../../interface/common/register-usecase.impl';
import { OtpPurpose } from '../../../shared/enums/OtpPurpose.enum';
import { PROTECTED_ROLES } from '../../../shared/enums/SystemRoles.enum';

const SALT_ROUNDS       = 12;
const OTP_EXPIRY_MINUTES = 10;

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export class RegisterUseCase implements IRegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly emailService:   IEmailService
  ) {}

  async register(data: RegisterRequestDTO): Promise<RegisterResponseDTO> {
    // 1. Check if email already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new BadRequestError(
        'An account with this email already exists.',
        'Please use a different email or login to your existing account.'
      );
    }

    // 2. Resolve role
    //    - On public register → always 'admin' (they are a building owner)
    //    - SUPER_ADMIN is NEVER assigned here — bootstrap only
    const roleName = 'admin';
    let role = await this.roleRepository.findByName(roleName);

    if (!role) { 
      // Safety guard: if someone passes a protected name, block it
      if ((PROTECTED_ROLES as readonly string[]).includes(roleName)) {
        throw new BadRequestError(
          `Role '${roleName}' is reserved and cannot be assigned on registration.`,
          'Contact the platform administrator.'
        );
      }
      // Custom roles: create on the fly
      role = await this.roleRepository.create({
        name:         roleName,
        description:  `Custom role: ${roleName}`,
        isSystemRole: false,
      });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // 4. Create the user (unverified — must verify email before login)
    const user = await this.userRepository.create({
      email:           data.email.toLowerCase().trim(),
      password:        hashedPassword,
      firstName:       data.firstName.trim(),
      lastName:        data.lastName.trim(),
      phone:           data.phone,
      roleId:          role._id!,
      isEmailVerified: false,
      isActive:        true,
      otp:             null,
      otpExpiresAt:    null,
      refreshToken:    null,
    });

    // 5. Auto-send verification OTP (non-blocking on email failure)
    const otp          = generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await this.userRepository.updateOtp(user.email, otp, otpExpiresAt);

    const res = this.emailService
      .sendOtpEmail(user.email, otp, OtpPurpose.EMAIL_VERIFICATION)
      .catch((err) => console.error('[EmailService] OTP send failed:', err));
     console.log('OTP email send result:', res);
    return {
      message: 'Account created successfully. Please check your email for the OTP to verify your account.',
      user: {
        _id:       user._id!,
        email:     user.email,
        firstName: user.firstName,
        lastName:  user.lastName,
      },
    };
  }
}
