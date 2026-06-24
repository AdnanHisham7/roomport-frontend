import { Notification, NotificationType, NotificationChannel } from '../../../domain/entities/Notification';
import { INotificationRepository } from '../../../domain/repository/notification-repository';
import { INotificationUseCase, SendMultiChannelNotificationDTO } from '../../interface/common/notification-usecase.impl';
import { IEmailService } from '../../interface/common/email-service-usecase.impl';
import { ISmsService } from '../../interface/common/sms-service.interface';
import { IUserRepository } from '../../../domain/repository/user-repository-impl';

export class NotificationUseCase implements INotificationUseCase {
  constructor(
    private notificationRepository: INotificationRepository,
    private emailService: IEmailService,
    private smsService: ISmsService,
    private userRepository: IUserRepository
  ) {}

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.findByUserId(userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }

  async markAsRead(notificationId: string): Promise<Notification | null> {
    return this.notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  async sendNotification(data: SendMultiChannelNotificationDTO): Promise<void> {
    const { 
      userId, 
      title, 
      message, 
      notificationType = NotificationType.GENERAL, 
      channel = NotificationChannel.IN_APP,
      buildingId,
      tenantId
    } = data as any;

    const promises: Promise<any>[] = [];

    // Always create a system notification since it represents the history
    promises.push(this.notificationRepository.create({ 
      userId, 
      title, 
      message, 
      notificationType, 
      channel,
      buildingId,
      tenantId
    }));

    // Trigger external channels if requested
    if (channel === NotificationChannel.EMAIL || channel === NotificationChannel.SMS || channel === NotificationChannel.WHATSAPP) {
      const user = await this.userRepository.findById(userId);
      if (user) {
        if (channel === NotificationChannel.EMAIL && user.email && this.emailService.sendNotificationEmail) {
          promises.push(this.emailService.sendNotificationEmail(user.email, title, message).catch(err => {
            console.error('Failed to send email notification:', err);
          }));
        }

        if (channel === NotificationChannel.SMS && user.phone_number) {
          promises.push(this.smsService.sendSms(user.phone_number, `[${title}]: ${message}`).catch(err => {
            console.error('Failed to send SMS notification:', err);
          }));
        }

        // WhatsApp integration could be added here in the future.
        if (channel === NotificationChannel.WHATSAPP) {
          console.warn('WhatsApp channel is not yet implemented.');
        }
      }
    }

    await Promise.allSettled(promises);
  }
}
