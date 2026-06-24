import { Notification, ICreateNotification } from '../../domain/entities/Notification';
import { INotificationRepository } from '../../domain/repository/notification-repository';
import { NotificationModel } from '../db/model/notification-model';

export class NotificationRepositoryImpl implements INotificationRepository {
  async create(data: ICreateNotification): Promise<Notification> {
    const created = await NotificationModel.create(data);
    return this.mapToEntity(created);
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    const notifications = await NotificationModel.find({ userId }).sort({ createdAt: -1 });
    return notifications.map(this.mapToEntity);
  }

  async findById(id: string): Promise<Notification | null> {
    const notification = await NotificationModel.findById(id);
    return notification ? this.mapToEntity(notification) : null;
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const notification = await NotificationModel.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    return notification ? this.mapToEntity(notification) : null;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany({ userId }, { isRead: true, readAt: new Date() });
  }

  async countUnread(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ userId, isRead: false });
  }

  private mapToEntity(doc: any): Notification {
    return new Notification(
      doc._id.toString(),
      doc.userId.toString(),
      doc.title,
      doc.message,
      doc.notificationType,
      doc.channel,
      doc.isRead,
      doc.buildingId?.toString(),
      doc.tenantId?.toString(),
      doc.readAt,
      doc.createdAt,
      doc.updatedAt
    );
  }
}
