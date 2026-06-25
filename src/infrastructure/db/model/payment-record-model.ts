import mongoose, { Document, Schema } from 'mongoose';

export type PaymentRecordStatus = 'pending' | 'paid' | 'overdue' | 'waived';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'upi' | 'cheque' | 'card' | 'other';

export interface IPaymentRecord {
  _id?:        string;
  tenantId:    string;
  buildingId:  string;
  unitId?:     string;
  periodLabel: string;    // "July 2025", "Q2 2025", "2025"
  periodStart: Date;
  periodEnd:   Date;
  amount:      number;
  status:      PaymentRecordStatus;
  paidAt?:     Date;
  method?:     PaymentMethod;
  notes?:      string;
  receiptUrl?: string;
  recordedBy:  string;
  createdAt?:  Date;
  updatedAt?:  Date;
}

export interface IPaymentRecordDocument extends Omit<IPaymentRecord, '_id'>, Document {}

const PaymentRecordSchema = new Schema<IPaymentRecordDocument>(
  {
    tenantId:    { type: Schema.Types.ObjectId, ref: 'Tenant',   required: true, index: true } as any,
    buildingId:  { type: Schema.Types.ObjectId, ref: 'Building', required: true, index: true } as any,
    unitId:      { type: Schema.Types.ObjectId, ref: 'Unit',     default: null  } as any,
    periodLabel: { type: String, required: true, trim: true },
    periodStart: { type: Date, required: true },
    periodEnd:   { type: Date, required: true },
    amount:      { type: Number, required: true, min: 0 },
    status:      { type: String, enum: ['pending','paid','overdue','waived'], default: 'pending', index: true },
    paidAt:      { type: Date, default: null },
    method:      { type: String, enum: ['cash','bank_transfer','upi','cheque','card','other'], default: null },
    notes:       { type: String, default: null, trim: true },
    receiptUrl:  { type: String, default: null },
    recordedBy:  { type: Schema.Types.ObjectId, ref: 'User', required: true } as any,
  },
  { timestamps: true }
);

PaymentRecordSchema.index({ tenantId: 1, periodStart: 1 });

export const PaymentRecordModel = mongoose.model<IPaymentRecordDocument>('PaymentRecord', PaymentRecordSchema);
