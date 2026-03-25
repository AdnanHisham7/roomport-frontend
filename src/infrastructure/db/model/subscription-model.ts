import mongoose, { Document, Schema } from 'mongoose';
import { ISubscription } from '../../../domain/entities/Subscription';

export interface ISubscriptionDocument extends Omit<ISubscription, '_id'>, Document {}

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true } as any,
    amount: { type: Number, required: true },
    numberOfBuildings: { type: Number, required: true },
    numberOfUnits: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    paidAt: { type: Date, default: null },
    status: { type: String, required: true, default: 'pending', index: true },
    paymentMethod: { type: String, default: null },
    stripeChargeId: { type: String, default: null },
    invoicenumber: { type: String, default: null },
    stripePaymentId: { type: String, default: null },
  },
  { timestamps: true }
);

export const SubscriptionModel = mongoose.model<ISubscriptionDocument>('Subscription', SubscriptionSchema);
