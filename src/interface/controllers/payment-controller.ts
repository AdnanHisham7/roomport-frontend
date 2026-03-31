import { Request, Response } from 'express';
import { CreateCheckoutSessionUseCase } from '../../application/usecase/payment/create-checkout-session-usecase';
import { HandleWebhookUseCase } from '../../application/usecase/payment/handle-webhook-usecase';

export class PaymentController {
  constructor(
    private createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
    private handleWebhookUseCase: HandleWebhookUseCase
  ) {}

  async createCheckoutSession(req: Request, res: Response) {
    try {
      const { subscriptionId, successUrl, cancelUrl } = req.body;
      const userId = (req.user as any)?.userId;

      if (!userId || !subscriptionId || !successUrl || !cancelUrl) {
        return res.status(400).json({ success: false, message: 'Missing required parameters' });
      }

      const url = await this.createCheckoutSessionUseCase.execute(userId, subscriptionId, successUrl, cancelUrl);
      res.status(200).json({ success: true, url });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async publicCheckout(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, phone, numberOfBuildings, numberOfUnits, successUrl, cancelUrl } = req.body;
      console.log(req.body)

      if (!firstName || !lastName || !email || !numberOfBuildings || !numberOfUnits || !successUrl || !cancelUrl) {
        return res.status(400).json({ success: false, message: 'Missing required parameters' });
      }


      const url = await this.createCheckoutSessionUseCase.executePublic(
        firstName,
        lastName,
        email,
        phone || '',
        Number(numberOfBuildings),
        Number(numberOfUnits),
        successUrl,
        cancelUrl
      );
      
      res.status(200).json({ success: true, url });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const payload = req.body;


      console.log(signature, payload)
      await this.handleWebhookUseCase.execute(payload, signature);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook Error:', error.message);
      res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }
}
