import { env } from '../config/env';
import Stripe from 'stripe';
import { IStripeService } from '../../application/interface/common/stripe-service.interface';

export class StripeService implements IStripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2026-02-25.clover',
    });
  }

  async createCheckoutSession(userId: string, email: string, amount: number, successUrl: string, cancelUrl: string): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Invoice Payment',
            },
            unit_amount: Math.round(amount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId,
    });

    return session.url as string;
  }

  async createPublicCheckoutSession(email: string, amount: number, metadata: Record<string, string>, successUrl: string, cancelUrl: string): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Property Management Subscription',
            },
            unit_amount: Math.round(amount * 100), // Stripe expects cents
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata,
    });

    return session.url as string;
  }

  constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET || '';
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
