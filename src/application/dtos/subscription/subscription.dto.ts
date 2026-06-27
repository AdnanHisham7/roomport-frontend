import type { BillingCycle } from '../../../domain/entities/Subscription';

export interface CreateBuilderSubscriptionDTO {
  userId:            string;
  billingCycle:      BillingCycle;
  numberOfBuildings: number;
  numberOfUnits:     number;
  amount:            number;
  notes?:            string;
}

export interface AdminUpdateSubscriptionDTO {
  numberOfBuildings?: number;
  numberOfUnits?:     number;
  status?:            string;
  amount?:            number;
  billingCycle?:      BillingCycle;
  dueDate?:           Date;
  notes?:             string;
}

export interface MarkPeriodPaidDTO {
  periodId:      string;
  paidAt?:       Date;
  notes?:        string;
}

export interface SubscriptionResponseDTO {
  _id:               string;
  userId:            string;
  amount:            number;
  numberOfBuildings: number;
  numberOfUnits:     number;
  billingCycle:      BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd:   Date;
  dueDate:           Date;
  paidAt?:           Date;
  status:            string;
  paymentMethod?:    string;
  invoicenumber?:    string;
  notes?:            string;
  createdAt?:        Date;
  updatedAt?:        Date;
}

export interface SubscriptionPeriodResponseDTO {
  _id:            string;
  subscriptionId: string;
  userId:         string;
  periodStart:    Date;
  periodEnd:      Date;
  periodLabel:    string;
  amount:         number;
  status:         string;
  paidAt?:        Date;
  notes?:         string;
  createdAt?:     Date;
}

export interface DemoRequestDTO {
  firstName:         string;
  lastName:          string;
  email:             string;
  phone?:            string;
  companyName?:      string;
  numberOfBuildings: number;
  numberOfUnits:     number;
  message?:          string;
}

export interface UpgradeRequestDTO {
  userId:                   string;
  additionalBuildings?:     number;
  additionalUnits?:         number;
  additionalBuildingData?:  Array<{ name: string; rooms: number }>;
  message?:                 string;
}
