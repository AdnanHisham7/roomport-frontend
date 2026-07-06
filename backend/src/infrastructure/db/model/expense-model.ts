import mongoose, { Document, Schema } from 'mongoose';
import { IExpense } from '../../../domain/entities/Expence';

export interface IExpenseDocument extends Omit<IExpense, '_id'>, Document {}

const ExpenseSchema = new Schema<IExpenseDocument>(
  {
    buildingId: {
      type:     Schema.Types.ObjectId,
      ref:      'Building',
      required: true,
      index:    true,
    } as any,
    unitId: {
      type:    Schema.Types.ObjectId,
      ref:     'Unit',
      default: null,
      index:   true,
    } as any,
    category: {
      type:     String,
      required: true,
      enum:     [
        'repair', 'utility', 'salary', 'tax', 'renovation',
        'cleaning', 'insurance', 'security', 'commission',
        'legal', 'marketing', 'other',
      ],
      index: true,
    },
    title: {
      type:     String,
      required: true,
      trim:     true,
    },
    description: {
      type:    String,
      default: null,
      trim:    true,
    },
    amount: {
      type:     Number,
      required: true,
      min:      0,
    },
    date: {
      type:     Date,
      required: true,
      index:    true,         // indexed for fast date-range queries
    },
    status: {
      type:    String,
      enum:    ['pending', 'paid', 'cancelled'],
      default: 'paid',       // default paid — most expenses are logged after payment
      index:   true,
    },
    method: {
      type:     String,
      required: true,
      enum:     ['cash', 'bank_transfer', 'upi', 'cheque', 'card'],
    },
    paidTo: {
      type:    String,
      default: null,
      trim:    true,
    },
    receiptUrl: {
      type:    String,
      default: null,
    },
    invoiceNumber: {
      type:    String,
      default: null,
      trim:    true,
    },
    recordedBy: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    } as any,
  },
  { timestamps: true }
);

// Compound index for fast date range + building queries
ExpenseSchema.index({ buildingId: 1, date: -1 });
ExpenseSchema.index({ buildingId: 1, category: 1, date: -1 });

export const ExpenseModel = mongoose.model<IExpenseDocument>('Expense', ExpenseSchema);
