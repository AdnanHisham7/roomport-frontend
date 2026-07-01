export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'inactive' | 'pending' | 'expired' | 'paid';

export interface ISubscription {
  _id?: any;
  userId: any;
  amount: number;
  numberOfBuildings: number;
  numberOfUnits: number;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  dueDate: Date;
  paidAt?: Date;
  status: SubscriptionStatus;
  paymentMethod?:    string;
  stripePaymentId?:  string;
  invoicenumber?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubscriptionPeriod {
  _id?: any;
  subscriptionId: any;
  userId: any;
  periodStart: Date;
  periodEnd: Date;
  periodLabel: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: Date;
  paidBy?: any;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
