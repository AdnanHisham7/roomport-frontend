import mongoose, { Document, Schema } from 'mongoose';
import { ActivityLogAction, ActivityLogEntityType, IActivityLog } from '../../../domain/entities/ActivityLog';

export interface ActivityLogDocument extends Omit<IActivityLog, '_id'>, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema(
  {
    action: {
      type: String,
      enum: Object.values(ActivityLogAction),
      required: true,
    },
    entityType: {
      type: String,
      enum: Object.values(ActivityLogEntityType),
    },
    buildingId: {
      type: Schema.Types.ObjectId,
      ref: 'Building',
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    unitId: {
      type: Schema.Types.ObjectId,
      ref: 'Unit',
    },
    ipAddress: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    userAgent: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for faster querying
ActivityLogSchema.index({ buildingId: 1 });
ActivityLogSchema.index({ userId: 1 });
ActivityLogSchema.index({ entityId: 1, entityType: 1 });
ActivityLogSchema.index({ action: 1 });
ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLogModel = mongoose.model<ActivityLogDocument>('ActivityLog', ActivityLogSchema);
