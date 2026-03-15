import bcrypt from 'bcryptjs';
import type { IUserRepository } from '../../../domain/repository/user-repository-impl';
import type { IRoleRepository } from '../../../domain/repository/role-repository-impl';
import type { IBootstrapUseCase } from '../../interface/common/bootstrap-usecase.impl';
import { SystemRole, SYSTEM_ROLES_SEED } from '../../../shared/enums/SystemRoles.enum';
import { BootstrapRequestDTO, BootstrapResponseDTO } from '../../dtos/bootstrap/bootstrap.dto';
import { BadRequestError } from '../../../shared/error/app-error';

const SALT_ROUNDS = 12;

export class BootstrapSuperAdminUseCase implements IBootstrapUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository
  ) {}

  async bootstrap(data: BootstrapRequestDTO): Promise<BootstrapResponseDTO> {
    for (const roleData of SYSTEM_ROLES_SEED) {
      const exists = await this.roleRepository.existsByName(roleData.name);
      if (!exists) {
        await this.roleRepository.create(roleData);
      }
    }

    // 3. Get the superAdmin role
    const superAdminRole = await this.roleRepository.findByName(SystemRole.SUPER_ADMIN);
    if (!superAdminRole) {
      throw new BadRequestError(
        'Failed to seed superAdmin role.',
        'Please check the database connection and try again.'
      );
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    // 5. Create super admin user
    //    - isEmailVerified: true  (pre-verified — no OTP needed for system owner)
    //    - companyId: null        (super admin is platform-level, not company-level)
    const superAdmin = await this.userRepository.create({
      email:           data.email.toLowerCase().trim(),
      password:        hashedPassword,
      firstName:       data.firstName.trim(),
      lastName:        data.lastName.trim(),
      phone:           data.phone,
      roleId:          superAdminRole._id!,
      isEmailVerified: true,
      isActive:        true,
      otp:             null,
      otpExpiresAt:    null,
      refreshToken:    null,
    });

    return {
      message: 'System bootstrapped successfully. Super Admin account created.',
      superAdmin: {
        _id:       superAdmin._id!,
        email:     superAdmin.email,
        firstName: superAdmin.firstName,
        lastName:  superAdmin.lastName,
        role:      superAdminRole.name,
      },
    };
  }
}
