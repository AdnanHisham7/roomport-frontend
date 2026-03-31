export interface ISubscription {
  _id?: any;
  userId: any;
  amount: number;
  numberOfBuildings: number;
  numberOfUnits: number;
  dueDate: Date;
  paidAt?: Date;
  status: string;
  paymentMethod?: string;
  stripeChargeId?: string;
  invoicenumber?: string;
  stripePaymentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
