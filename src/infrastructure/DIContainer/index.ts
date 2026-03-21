import { AuthUseCases } from "../../application/usecase/common/auth-usecase";
import { RegisterUseCase } from "../../application/usecase/common/register-usecase";
import { BootstrapSuperAdminUseCase } from "../../application/usecase/system/bootstrap-super-admin.usecase";
import { TenantUseCases } from "../../application/usecase/tenant/tenant-usecase";
import { AuthController } from "../../interface/controllers/auth-controller";
import { BootstrapController } from "../../interface/controllers/bootstrap-controller";
import { TenantController } from "../../interface/controllers/tenant-controller";
import { TenantRepository } from "../repository/tenant-repository";
import { UserRepository } from "../repository/user-repository";
import { EmailService } from "../services/email-service";
import { JwtService } from "../services/jwt-service";
import { RedisOtpService } from "../services/redis-otp-service";


// ─── Repositories ──────────────────────────────────────────────────────────────
const userRepository     = new UserRepository();
const tenantRepository   = new TenantRepository();


// ─── Services ─────────────────────────────────────────────────────────────────
const jwtService   = new JwtService();
const emailService = new EmailService();
const otpService   = new RedisOtpService();

// ─── Use Cases ─────────────────────────────────────────────────────────────────
const authUseCases     = new AuthUseCases(userRepository, jwtService, emailService, otpService);
const registerUseCase  = new RegisterUseCase(userRepository, emailService, otpService);
const bootstrapUseCase = new BootstrapSuperAdminUseCase(userRepository);
const tenantUseCases   = new TenantUseCases(tenantRepository);


// ─── Controllers ──────────────────────────────────────────────────────────────
export const authController      = new AuthController(authUseCases, registerUseCase);
export const bootstrapController = new BootstrapController(bootstrapUseCase);
export const tenantController    = new TenantController(tenantUseCases);

