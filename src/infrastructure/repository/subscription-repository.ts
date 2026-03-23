import type { ISubscription } from '../../domain/entities/Subscription';
import type { ISubscriptionRepository } from '../../domain/repository/subscription-repository-impl';
import { SubscriptionModel } from '../db/model/subscription-model';

export class SubscriptionRepository implements ISubscriptionRepository {
  private toStringId(doc: { _id: unknown }): string {
    return (doc._id as { toString(): string }).toString();
  }

  private toEntity(doc: any): ISubscription {
    const obj = doc.toObject ? doc.toObject() : { ...doc };
    return {
      ...obj,
      _id: this.toStringId(obj),
      userId: obj.userId?.toString() ?? undefined,
    };
  }

  async findById(subscriptionId: string): Promise<ISubscription | null> {
    const doc = await SubscriptionModel.findById(subscriptionId).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async create(data: Omit<ISubscription, '_id' | 'createdAt' | 'updatedAt'>): Promise<ISubscription> {
    const doc = await SubscriptionModel.create(data);
    return this.toEntity(doc);
  }

  async findByStripePaymentId(stripePaymentId: string): Promise<ISubscription | null> {
    const doc = await SubscriptionModel.findOne({ stripePaymentId }).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async update(subscriptionId: string, data: Partial<ISubscription>): Promise<ISubscription | null> {
    const doc = await SubscriptionModel.findByIdAndUpdate(subscriptionId, { $set: data }, { new: true }).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }

  async findByUserId(userId: string): Promise<ISubscription | null> {
    const doc = await SubscriptionModel.findOne({ userId }).lean();
    if (!doc) return null;
    return this.toEntity(doc);
  }
}
