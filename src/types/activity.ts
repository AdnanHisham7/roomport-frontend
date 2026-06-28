export type NotificationType =
  | 'rent_reminder' | 'payment_recieved' | 'payment_overdue' | 'lease_expiry'
  | 'maintenance_update' | 'maintenance_assigned' | 'document_expiory' | 'general'
  | 'upgrade_request' | 'upgrade_request_resolved' | 'demo_request' | 'payment_confirmed'
  | 'subscription_updated';

export type NotificationChannel = 'in_app' | 'sms' | 'whatsapp' | 'email';

export interface AppNotification {
  _id:              string;
  userId:           string;
  title:            string;
  message:          string;
  notificationType: NotificationType;
  channel:          NotificationChannel;
  isRead:           boolean;
  buildingId?:      string;
  tenantId?:        string;
  readAt?:          string;
  metadata?:        Record<string, string>;
  createdAt?:       string;
  updatedAt?:       string;
}

export type ActivityLogAction =
  | 'user_login' | 'user_logout' | 'user_password_changed'
  | 'tenant_created' | 'tenant_updated' | 'tenant_deleted' | 'tenant_status_changed' | 'tenant_transferred'
  | 'building_created' | 'building_updated' | 'building_deleted' | 'building_published' | 'building_unpublished'
  | 'room_created' | 'room_updated' | 'room_deleted' | 'room_status_changed'
  | 'lease_created' | 'lease_signed' | 'lease_terminated' | 'lease_expired'
  | 'payment_recorded' | 'payment_updated' | 'payment_deleted'
  | 'rent_payment_created' | 'rent_payment_completed'
  | 'document_uploaded' | 'document_deleted'
  | 'subscription_created' | 'subscription_upgraded' | 'subscription_renewed'
  | 'subscription_expired' | 'subscription_canceled' | 'subscription_period_paid'
  | 'builder_registered' | 'builder_status_changed' | 'builder_deleted'
  | 'demo_request_received' | 'upgrade_request_received' | 'admin_revenue_recorded';

export type ActivityLogEntityType =
  | 'tenant' | 'lease' | 'payment' | 'building' | 'room' | 'user' | 'document' | 'subscription' | 'demo_request';

export interface ActivityLogUser {
  _id:        string;
  first_name: string;
  last_name:  string;
  email:      string;
  role:       string;
}

export interface ActivityLog {
  _id:          string;
  action:       ActivityLogAction;
  entityType?:  ActivityLogEntityType;
  buildingId?:  string;
  entityId?:    string;
  unitId?:      string;
  metadata?:    Record<string, unknown>;
  userId:       string;
  user?:        ActivityLogUser;
  description?: string;
  ipAddress?:   string;
  createdAt?:   string;
  updatedAt?:   string;
}
