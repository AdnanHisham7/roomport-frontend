export interface CreateSubscriptionQuoteDTO {
  numberOfBuildings: number;
  numberOfUnits: number;
}

export interface AdminUpdateSubscriptionDTO {
  numberOfBuildings?: number;
  numberOfUnits?: number;
  status?: string;
  amount?: number;
  dueDate?: Date;
}

export interface SubscriptionResponseDTO {
  _id: string;
  userId: string;
  amount: number;
  numberOfBuildings: number;
  numberOfUnits: number;
  dueDate: Date;
  paidAt?: Date;
  status: string;
  paymentMethod?: string;
  invoicenumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
