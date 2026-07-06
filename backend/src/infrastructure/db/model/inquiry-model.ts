import mongoose, { Document, Schema } from 'mongoose';
import { IInquiry } from '../../../domain/entities/Inquiry';

export interface IInquiryDocument extends Omit<IInquiry, '_id'>, Document {}

const InquirySchema = new Schema<IInquiryDocument>(
  {
    buildingId: { type: Schema.Types.ObjectId, ref: 'Building', required: true, index: true } as any,
    unitId:     { type: Schema.Types.ObjectId, ref: 'Unit', default: null } as any,
    ownerId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true } as any,
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, trim: true, lowercase: true },
    phone:      { type: String, default: null, trim: true },
    message:    { type: String, default: null, trim: true },
    status: {
      type:    String,
      enum:    ['new', 'contacted', 'closed', 'spam'],
      default: 'new',
      index:   true,
    },
  },
  { timestamps: true }
);

export const InquiryModel = mongoose.model<IInquiryDocument>('Inquiry', InquirySchema);
