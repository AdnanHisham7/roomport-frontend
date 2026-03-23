import type { ISubscription } from '../entities/Subscription';

export interface ISubscriptionRepository {
  findById(subscriptionId: string): Promise<ISubscription | null>;
  create(data: Omit<ISubscription, '_id' | 'createdAt' | 'updatedAt'>): Promise<ISubscription>;
  findByStripePaymentId(stripePaymentId: string): Promise<ISubscription | null>;
  update(subscriptionId: string, data: Partial<ISubscription>): Promise<ISubscription | null>;
  findByUserId(userId: string): Promise<ISubscription | null>;
}
