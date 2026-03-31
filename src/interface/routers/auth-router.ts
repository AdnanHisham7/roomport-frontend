import { Router } from 'express';
import { authController } from '../../infrastructure/DIContainer/index';
import { authenticate } from '../middleware/auth-middleware';

const router = Router();

// ── Public routes — no token required ────────────────────────────────────────
router.post('/register',        authController.register);
router.post('/login',           authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password',  authController.resetPassword);
router.post('/send-otp',        authController.sendOtp);
router.post('/resend-otp',      authController.resendOtp);
router.post('/validate-otp',    authController.validateOtp);
router.post('/verify-email',    authController.verifyEmail);
router.post('/refresh-token',   authController.refreshToken);

// ── Protected routes — valid access token required ────────────────────────────
router.post('/logout', authenticate, authController.logout);

export default router;
 