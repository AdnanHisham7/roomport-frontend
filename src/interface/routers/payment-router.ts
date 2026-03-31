import { Router } from 'express';
import { PaymentController } from '../controllers/payment-controller';
import { authenticate } from '../middleware/auth-middleware';

export const createPaymentRouter = (paymentController: PaymentController): Router => {
  const router = Router();

  router.post(
    '/checkout',
    authenticate,
    paymentController.createCheckoutSession.bind(paymentController)
  );

  router.post(
    '/public-checkout',
    paymentController.publicCheckout.bind(paymentController)
  );

  router.post(
    '/webhook',
    paymentController.handleWebhook.bind(paymentController)
  );

  return router;
};
