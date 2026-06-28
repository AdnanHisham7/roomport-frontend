import mongoose, { Schema, Document } from 'mongoose';
import { NotificationType, NotificationChannel } from '../../../domain/entities/Notification';

export interface INotificationDocument extends Document {
  buildingId?:   mongoose.Types.ObjectId;
  userId?:       mongoose.Types.ObjectId;
  title:         string;
  message:       string;
  type?:         string;
  metadata?:     Record<string, any>;
  recipientId?:  mongoose.Types.ObjectId;
  recipientRole?: string;
  notificationType: string;
  channel:       string;
  isRead:        boolean;
  readAt?:       Date;
  tenantId?:     mongoose.Types.ObjectId;
  createdAt:     Date;
  updatedAt:     Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    buildingId:       { type: Schema.Types.ObjectId, ref: 'Building', required: false },
    userId:           { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    title:            { type: String, required: true },
    message:          { type: String, required: true },
    notificationType: { type: String, enum: Object.values(NotificationType), default: NotificationType.GENERAL },
    channel:          { type: String, enum: Object.values(NotificationChannel), default: NotificationChannel.IN_APP },
    isRead:           { type: Boolean, default: false },
    readAt:           { type: Date },
    type:             { type: String, required: false },
    recipientId:      { type: Schema.Types.ObjectId, ref: 'User', required: false },
    recipientRole:    { type: String, required: false, index: true },
    tenantId:         { type: Schema.Types.ObjectId, ref: 'Tenant', required: false },
    metadata:         { type: Schema.Types.Mixed, required: false },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ recipientRole: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ recipientRole: 1, isRead: 1 });

export const NotificationModel = mongoose.model<INotificationDocument>('Notification', notificationSchema);
