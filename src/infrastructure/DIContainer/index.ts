import { AgreementUseCases } from "../../application/usecase/agreement/agreement-usecase";
import { BuildingUseCases } from "../../application/usecase/building/building-usecase";
import { AuthUseCases } from "../../application/usecase/common/auth-usecase";
import { RegisterUseCase } from "../../application/usecase/common/register-usecase";
import { DocumentUseCases } from "../../application/usecase/document/document-usecase";
import { ExpenseUseCases } from "../../application/usecase/expence/expense-usecase";
import { FloorUseCases } from "../../application/usecase/floor/floor-usecase";
import { BootstrapSuperAdminUseCase } from "../../application/usecase/system/bootstrap-super-admin.usecase";
import { TenantUseCases } from "../../application/usecase/tenant/tenant-usecase";
import { AgreementController } from "../../interface/controllers/agreement-controller";
import { AuthController } from "../../interface/controllers/auth-controller";
import { BootstrapController } from "../../interface/controllers/bootstrap-controller";
import { BuildingController } from "../../interface/controllers/building-controller";
import { DocumentController } from "../../interface/controllers/document-controller";
import { ExpenseController } from "../../interface/controllers/expense-controller";
import { FloorController } from "../../interface/controllers/floor-controller";
import { TenantController } from "../../interface/controllers/tenant-controller";
import { AgreementRepository } from "../repository/agreement-repository";
import { BuildingRepository } from "../repository/building-repository";
import { DocumentRepository } from "../repository/document-repository";
import { ExpenseRepository } from "../repository/expence-repository";
import { FloorRepository } from "../repository/floor-repository";
import { TenantRepository } from "../repository/tenant-repository";
import { UserRepository } from "../repository/user-repository";
import { EmailService } from "../services/email-service";
import { JwtService } from "../services/jwt-service";
import { PdfService } from "../services/pdf-service";
import { RedisOtpService } from "../services/redis-otp-service";
import { SubscriptionRepository } from "../repository/subscription-repository";
import { StripeService } from "../services/stripe.service";
import { CreateCheckoutSessionUseCase } from "../../application/usecase/payment/create-checkout-session-usecase";
import { HandleWebhookUseCase } from "../../application/usecase/payment/handle-webhook-usecase";
import { PaymentController } from "../../interface/controllers/payment-controller";
import { UnitUseCases } from "../../application/usecase/unit/unit-usecase";
import { UnitController } from "../../interface/controllers/unit-controller";
import { UnitRepository } from "../repository/unit-repository";
import { AnalyticsController } from "../../interface/controllers/analytics-controller";
import { AnalyticsUseCase } from "../../application/usecase/analytics/analytics-usecase";
import { AnalyticsRepository } from "../repository/analytics-repository";
import { NotificationRepositoryImpl } from "../repository/notification-repository-impl";
import { TwilioSmsService } from "../services/twilio-sms.service";
import { NotificationUseCase } from "../../application/usecase/notification/notification-usecase";
import { NotificationController } from "../../interface/controllers/notification-controller";
import { UserUseCase } from "../../application/usecase/user/user-usecase";
import { UserController } from "../../interface/controllers/user-controller";
import { ActivityLogRepositoryImpl } from "../repository/activity-log-repository";
import { ActivityLogUsecaseImpl } from "../../application/interface/activity-log/activity-log-usecase.impl";
import { ActivityLogController } from "../../interface/controllers/activity-log-controller";

// ─── Repositories ──────────────────────────────────────────────────────────────
const userRepository = new UserRepository();
const tenantRepository = new TenantRepository();
const documentRepository = new DocumentRepository();
const agreementRepository = new AgreementRepository();
const subscriptionRepository = new SubscriptionRepository();
const unitRepository = new UnitRepository();
const analyticsRepository = new AnalyticsRepository();
const notificationRepository = new NotificationRepositoryImpl();
const buildingRepository = new BuildingRepository();
const floorRepository = new FloorRepository();
const activityLogRepository = new ActivityLogRepositoryImpl();
const buildingRepo     = new BuildingRepository();
const floorRepo        = new FloorRepository();
const expenseRepo      = new ExpenseRepository();


// ─── Services ─────────────────────────────────────────────────────────────────
const jwtService = new JwtService();
const emailService = new EmailService();
const otpService = new RedisOtpService();
const pdfService = new PdfService();
const stripeService = new StripeService();
const twilioSmsService = new TwilioSmsService();

// ─── Use Cases ─────────────────────────────────────────────────────────────────
const userUseCase = new UserUseCase(userRepository);
const authUseCases = new AuthUseCases(userRepository, jwtService, emailService, otpService);
const registerUseCase = new RegisterUseCase(userRepository, emailService, otpService);
const bootstrapUseCase = new BootstrapSuperAdminUseCase(userRepository);
const tenantUseCases = new TenantUseCases(tenantRepository);
const documentUseCases = new DocumentUseCases(documentRepository);
const agreementUseCases = new AgreementUseCases(
  agreementRepository,
  tenantRepository,
  documentRepository,
  emailService,
  pdfService
);
const createCheckoutSessionUseCase = new CreateCheckoutSessionUseCase(stripeService, userRepository, subscriptionRepository);
const handleWebhookUseCase = new HandleWebhookUseCase(stripeService, userRepository, subscriptionRepository, emailService);
const unitUseCases = new UnitUseCases(unitRepository);
const analyticsUseCase = new AnalyticsUseCase(analyticsRepository);
const notificationUseCase = new NotificationUseCase(notificationRepository, emailService, twilioSmsService, userRepository);
const buildingUseCases = new BuildingUseCases(buildingRepository);
const floorUseCases = new FloorUseCases(floorRepository, buildingRepository);
const activityLogUseCase = new ActivityLogUsecaseImpl(activityLogRepository);
const expenseUseCases       = new ExpenseUseCases(expenseRepo);


// ─── Controllers ──────────────────────────────────────────────────────────────
export const authController = new AuthController(authUseCases, registerUseCase);
export const bootstrapController = new BootstrapController(bootstrapUseCase);
export const tenantController = new TenantController(tenantUseCases);
export const documentController = new DocumentController(documentUseCases);
export const agreementController = new AgreementController(agreementUseCases);
export const paymentController = new PaymentController(createCheckoutSessionUseCase, handleWebhookUseCase);
export const unitController = new UnitController(unitUseCases);
export const notificationController = new NotificationController(notificationUseCase);
export const analyticsController = new AnalyticsController(analyticsUseCase);
export const userController = new UserController(userUseCase);
export const activityLogController = new ActivityLogController(activityLogUseCase);

export const buildingController  = new BuildingController(buildingUseCases);
export const floorController     = new FloorController(floorUseCases);
export const expenseController      = new ExpenseController(expenseUseCases);