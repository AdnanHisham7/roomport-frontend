export interface IStripeService {
  createCheckoutSession(userId: string, email: string, amount: number, successUrl: string, cancelUrl: string): Promise<string>;
  createPublicCheckoutSession(email: string, amount: number, metadata: Record<string, string>, successUrl: string, cancelUrl: string): Promise<string>;
  constructWebhookEvent(payload: string | Buffer, signature: string): any;
}
