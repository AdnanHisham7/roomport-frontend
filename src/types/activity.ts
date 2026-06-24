export type NotificationType =
  | 'rent_reminder' | 'payment_recieved' | 'payment_overdue' | 'lease_expiry'
  | 'maintenance_update' | 'maintenance_assigned' | 'document_expiory' | 'general';

export type NotificationChannel = 'in_app' | 'sms' | 'whatsapp' | 'email';

export interface AppNotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  channel: NotificationChannel;
  isRead: boolean;
  buildingId?: string;
  tenantId?: string;
  readAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ActivityLogAction =
  | 'user_login' | 'user_logout' | 'tenant_created' | 'tenant_updated' | 'tenant_deleted'
  | 'building_created' | 'building_updated' | 'building_deleted'
  | 'lease_created' | 'lease_terminated' | 'rent_payment_created' | 'rent_payment_completed'
  | 'document_uploaded' | 'document_deleted'
  | 'subscription_created' | 'subscription_upgraded' | 'subscription_canceled';

export type ActivityLogEntityType = 'tenant' | 'lease' | 'payment' | 'building' | 'user' | 'document' | 'subscription';

export interface ActivityLog {
  _id: string;
  action: ActivityLogAction;
  entityType?: ActivityLogEntityType;
  buildingId?: string;
  entityId?: string;
  unitId?: string;
  metadata?: Record<string, unknown>;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}
