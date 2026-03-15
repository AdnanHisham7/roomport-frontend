import { AuthUseCases } from '../../application/usecase/common/auth-usecase';
import { RegisterUseCase } from '../../application/usecase/common/register-usecase';
import { BootstrapSuperAdminUseCase } from '../../application/usecase/system/bootstrap-super-admin.usecase';
import { AuthController } from '../../interface/controllers/auth-controller';
import { BootstrapController } from '../../interface/controllers/bootstrap-controller';
import { UserRepository } from '../repository/user-repository';
import { RoleRepository } from '../repository/role-repository';
import { EmailService } from '../services/email-service';
import { JwtService } from '../services/jwt-service';

// ─── Repositories ─────────────────────────────────────────────────────────────
const userRepository = new UserRepository();
const roleRepository = new RoleRepository();

// ─── Services ─────────────────────────────────────────────────────────────────
const jwtService   = new JwtService();
const emailService = new EmailService();

// ─── Use Cases ────────────────────────────────────────────────────────────────
const authUseCases    = new AuthUseCases(userRepository, jwtService, emailService);
const registerUseCase = new RegisterUseCase(userRepository, roleRepository, emailService);
const bootstrapUseCase = new BootstrapSuperAdminUseCase(userRepository, roleRepository);

// ─── Controllers ──────────────────────────────────────────────────────────────
export const authController      = new AuthController(authUseCases, registerUseCase);
export const bootstrapController = new BootstrapController(bootstrapUseCase);
