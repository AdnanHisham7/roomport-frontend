import mongoose, { Schema, Document } from 'mongoose';
import { NotificationType, NotificationChannel } from '../../../domain/entities/Notification';

export interface INotificationDocument extends Document {
  buildingId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  notificationType: string;
  channel: string;
  isRead: boolean;
  readAt?: Date;
  tenantId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    buildingId: { type: Schema.Types.ObjectId, ref: 'Building', required: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    notificationType: { type: String, enum: Object.values(NotificationType), default: NotificationType.GENERAL },
    channel: { type: String, enum: Object.values(NotificationChannel), default: NotificationChannel.IN_APP },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: false }
  },
  {
    timestamps: true,
  }
);

export const NotificationModel = mongoose.model<INotificationDocument>('Notification', notificationSchema);
