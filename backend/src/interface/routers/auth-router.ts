import { Router } from 'express';
import { authController } from '../../infrastructure/DIContainer/index';
import { authenticate } from '../middleware/auth-middleware';
import { validate } from '../middleware/validate-middleware';
import {
  registerSchema, loginSchema, refreshTokenSchema, sendOtpSchema, resendOtpSchema,
  validateOtpSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();

// ── Public routes — no token required ────────────────────────────────────────
router.post('/register',        validate(registerSchema),        authController.register);
router.post('/login',           validate(loginSchema),           authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema),  authController.forgotPassword);
router.post('/reset-password',  validate(resetPasswordSchema),   authController.resetPassword);
router.post('/send-otp',        validate(sendOtpSchema),         authController.sendOtp);
router.post('/resend-otp',      validate(resendOtpSchema),       authController.resendOtp);
router.post('/validate-otp',    validate(validateOtpSchema),     authController.validateOtp);
router.post('/verify-email',    validate(verifyEmailSchema),     authController.verifyEmail);
router.post('/refresh-token',   validate(refreshTokenSchema),    authController.refreshToken);

// ── Protected routes — valid access token required ────────────────────────────
router.post('/logout', authenticate, authController.logout);

export default router;
