import { Notification, NotificationType, NotificationChannel } from '../../../domain/entities/Notification';

export interface SendMultiChannelNotificationDTO {
  userId: string;
  title: string;
  message: string;
  notificationType?: NotificationType;
  channel?: NotificationChannel;
  buildingId?: string;
  tenantId?: string;
}

export interface INotificationUseCase {
  getUserNotifications(userId: string): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<Notification | null>;
  markAllAsRead(userId: string): Promise<void>;
  sendNotification(data: SendMultiChannelNotificationDTO): Promise<void>;
}
