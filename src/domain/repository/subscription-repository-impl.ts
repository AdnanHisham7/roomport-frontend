import type { ISubscription } from '../entities/Subscription';

export interface SubscriptionListFilter {
  userId?: string;
  status?: string;
}

export interface ISubscriptionRepository {
  findById(subscriptionId: string): Promise<ISubscription | null>;
  create(data: Omit<ISubscription, '_id' | 'createdAt' | 'updatedAt'>): Promise<ISubscription>;
  findByStripePaymentId(stripePaymentId: string): Promise<ISubscription | null>;
  update(subscriptionId: string, data: Partial<ISubscription>): Promise<ISubscription | null>;
  /** Returns the most relevant subscription for a user — an active/paid one if any exist, else the most recent. */
  findByUserId(userId: string): Promise<ISubscription | null>;
  findAllByUserId(userId: string): Promise<ISubscription[]>;
  findAllPaginated(filter: SubscriptionListFilter, skip: number, limit: number): Promise<{ data: ISubscription[]; total: number }>;
  countAll(filter?: SubscriptionListFilter): Promise<number>;
  getRevenueTotal(): Promise<number>;
}
