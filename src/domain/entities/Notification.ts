export enum NotificationType {
  RENT_REMINDER      = 'rent_reminder',
  PAYMENT_RECEIVED   = 'payment_recieved',
  PAYMENT_OVERDUE    = 'payment_overdue',
  LEASE_EXPIRY       = 'lease_expiry',
  MAINTENANCE_UPDATE = 'maintenance_update',
  MAINTENANCE_ASSIGNED = 'maintenance_assigned',
  DOCUMENT_EXPIRY    = 'document_expiory',
  UPGRADE_REQUEST    = 'upgrade_request',
  DEMO_REQUEST       = 'demo_request',
  GENERAL            = 'general',
}

export enum NotificationChannel {
  IN_APP   = 'in_app',
  SMS      = 'sms',
  WHATSAPP = 'whatsapp',
  EMAIL    = 'email',
}

export class Notification {
  constructor(
    public readonly _id:              string,
    public readonly userId:           string,
    public readonly title:            string,
    public readonly message:          string,
    public readonly notificationType: NotificationType,
    public readonly channel:          NotificationChannel,
    public readonly isRead:           boolean,
    public readonly buildingId?:      string,
    public readonly tenantId?:        string,
    public readonly readAt?:          Date,
    public readonly createdAt?:       Date,
    public readonly updatedAt?:       Date,
    public readonly type?:            string,
    public readonly metadata?:        Record<string, any>,
    public readonly recipientRole?:   string,
  ) {}
}

export type ICreateNotification = Omit<Notification, '_id' | 'createdAt' | 'updatedAt' | 'isRead' | 'readAt'>;
