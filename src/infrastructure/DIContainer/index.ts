import { AgreementUseCases } from "../../application/usecase/agreement/agreement-usecase";
import { AuthUseCases } from "../../application/usecase/common/auth-usecase";
import { RegisterUseCase } from "../../application/usecase/common/register-usecase";
import { DocumentUseCases } from "../../application/usecase/document/document-usecase";
import { BootstrapSuperAdminUseCase } from "../../application/usecase/system/bootstrap-super-admin.usecase";
import { TenantUseCases } from "../../application/usecase/tenant/tenant-usecase";
import { AgreementController } from "../../interface/controllers/agreement-controller";
import { AuthController } from "../../interface/controllers/auth-controller";
import { BootstrapController } from "../../interface/controllers/bootstrap-controller";
import { DocumentController } from "../../interface/controllers/document-controller";
import { TenantController } from "../../interface/controllers/tenant-controller";
import { AgreementRepository } from "../repository/agreement-repository";
import { DocumentRepository } from "../repository/document-repository";
import { TenantRepository } from "../repository/tenant-repository";
import { UserRepository } from "../repository/user-repository";
import { EmailService } from "../services/email-service";
import { JwtService } from "../services/jwt-service";
import { PdfService } from "../services/pdf-service";
import { RedisOtpService } from "../services/redis-otp-service";


// ─── Repositories ──────────────────────────────────────────────────────────────
const userRepository     = new UserRepository();
const tenantRepository   = new TenantRepository();
const documentRepository = new DocumentRepository();
const agreementRepository = new AgreementRepository();


// ─── Services ─────────────────────────────────────────────────────────────────
const jwtService   = new JwtService();
const emailService = new EmailService();
const otpService   = new RedisOtpService();
const pdfService   = new PdfService();

// ─── Use Cases ─────────────────────────────────────────────────────────────────
const authUseCases     = new AuthUseCases(userRepository, jwtService, emailService, otpService);
const registerUseCase  = new RegisterUseCase(userRepository, emailService, otpService);
const bootstrapUseCase = new BootstrapSuperAdminUseCase(userRepository);
const tenantUseCases   = new TenantUseCases(tenantRepository);
const documentUseCases = new DocumentUseCases(documentRepository);
const agreementUseCases = new AgreementUseCases(
  agreementRepository,
  tenantRepository,
  documentRepository,
  emailService,
  pdfService
);

// ─── Controllers ──────────────────────────────────────────────────────────────
export const authController      = new AuthController(authUseCases, registerUseCase);
export const bootstrapController = new BootstrapController(bootstrapUseCase);
export const tenantController    = new TenantController(tenantUseCases);
export const documentController  = new DocumentController(documentUseCases);
export const agreementController = new AgreementController(agreementUseCases);
