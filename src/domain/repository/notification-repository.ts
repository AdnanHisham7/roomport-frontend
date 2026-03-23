import { Notification, ICreateNotification } from '../entities/Notification';

export interface INotificationRepository {
  create(data: ICreateNotification): Promise<Notification>;
  findByUserId(userId: string): Promise<Notification[]>;
  findById(id: string): Promise<Notification | null>;
  markAsRead(id: string): Promise<Notification | null>;
  markAllAsRead(userId: string): Promise<void>;
}
