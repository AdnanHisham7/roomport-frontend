import mongoose, { Document, Schema } from 'mongoose';

export type UpgradeRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface IUpgradeRequest {
  _id?:                  string;
  userId:                string;
  subscriptionId?:       string;
  additionalBuildings?:  number;
  additionalUnits?:      number;
  additionalBuildingData?: Array<{ name: string; rooms: number }>;
  message?:              string;
  status:                UpgradeRequestStatus;
  adminNotes?:           string;
  resolvedBy?:           string;
  resolvedAt?:           Date;
  createdAt?:            Date;
  updatedAt?:            Date;
}

export interface IUpgradeRequestDocument extends Omit<IUpgradeRequest, '_id'>, Document {}

const UpgradeRequestSchema = new Schema<IUpgradeRequestDocument>(
  {
    userId:               { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true } as any,
    subscriptionId:       { type: Schema.Types.ObjectId, ref: 'Subscription', default: null } as any,
    additionalBuildings:  { type: Number, default: 0 },
    additionalUnits:      { type: Number, default: 0 },
    additionalBuildingData: { type: Schema.Types.Mixed, default: [] },
    message:              { type: String, default: null, trim: true },
    status:               { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending', index: true },
    adminNotes:           { type: String, default: null },
    resolvedBy:           { type: Schema.Types.ObjectId, ref: 'User', default: null } as any,
    resolvedAt:           { type: Date, default: null },
  },
  { timestamps: true }
);

UpgradeRequestSchema.index({ status: 1, createdAt: -1 });

export const UpgradeRequestModel = mongoose.model<IUpgradeRequestDocument>('UpgradeRequest', UpgradeRequestSchema);
