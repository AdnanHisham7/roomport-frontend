import mongoose, { Document, Schema } from 'mongoose';
import type { ISubscription, ISubscriptionPeriod } from '../../../domain/entities/Subscription';

export interface ISubscriptionDocument extends Omit<ISubscription, '_id'>, Document {}
export interface ISubscriptionPeriodDocument extends Omit<ISubscriptionPeriod, '_id'>, Document {}

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    userId:             { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true } as any,
    amount:             { type: Number, required: true },
    numberOfBuildings:  { type: Number, required: true },
    numberOfUnits:      { type: Number, required: true },
    billingCycle:       { type: String, enum: ['monthly', 'yearly'], required: true, default: 'monthly' },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd:   { type: Date, required: true },
    dueDate:            { type: Date, required: true },
    paidAt:             { type: Date, default: null },
    status:             { type: String, required: true, default: 'pending', index: true },
    paymentMethod:      { type: String, default: null },
    invoicenumber:      { type: String, default: null },
    notes:              { type: String, default: null },
  },
  { timestamps: true }
);

const SubscriptionPeriodSchema = new Schema<ISubscriptionPeriodDocument>(
  {
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true, index: true } as any,
    userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true } as any,
    periodStart:    { type: Date, required: true },
    periodEnd:      { type: Date, required: true },
    periodLabel:    { type: String, required: true },
    amount:         { type: Number, required: true },
    status:         { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending', index: true },
    paidAt:         { type: Date, default: null },
    paidBy:         { type: Schema.Types.ObjectId, ref: 'User', default: null } as any,
    notes:          { type: String, default: null },
  },
  { timestamps: true }
);

SubscriptionPeriodSchema.index(
  { subscriptionId: 1, periodStart: 1, periodEnd: 1 },
  { unique: true }
);

export const SubscriptionModel       = mongoose.model<ISubscriptionDocument>('Subscription', SubscriptionSchema);
export const SubscriptionPeriodModel = mongoose.model<ISubscriptionPeriodDocument>('SubscriptionPeriod', SubscriptionPeriodSchema);