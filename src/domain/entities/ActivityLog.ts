export enum ActivityLogAction {
  USER_LOGIN                   = 'user_login',
  USER_LOGOUT                  = 'user_logout',
  USER_PASSWORD_CHANGED        = 'user_password_changed',
  TENANT_CREATED               = 'tenant_created',
  TENANT_UPDATED               = 'tenant_updated',
  TENANT_DELETED               = 'tenant_deleted',
  TENANT_STATUS_CHANGED        = 'tenant_status_changed',
  TENANT_TRANSFERRED           = 'tenant_transferred',
  BUILDING_CREATED             = 'building_created',
  BUILDING_UPDATED             = 'building_updated',
  BUILDING_DELETED             = 'building_deleted',
  BUILDING_PUBLISHED           = 'building_published',
  BUILDING_UNPUBLISHED         = 'building_unpublished',
  ROOM_CREATED                 = 'room_created',
  ROOM_UPDATED                 = 'room_updated',
  ROOM_DELETED                 = 'room_deleted',
  ROOM_STATUS_CHANGED          = 'room_status_changed',
  LEASE_CREATED                = 'lease_created',
  LEASE_SIGNED                 = 'lease_signed',
  LEASE_TERMINATED             = 'lease_terminated',
  LEASE_EXPIRED                = 'lease_expired',
  PAYMENT_RECORDED             = 'payment_recorded',
  PAYMENT_UPDATED              = 'payment_updated',
  PAYMENT_DELETED              = 'payment_deleted',
  RENT_PAYMENT_CREATED         = 'rent_payment_created',
  RENT_PAYMENT_COMPLETED       = 'rent_payment_completed',
  DOCUMENT_UPLOADED            = 'document_uploaded',
  DOCUMENT_DELETED             = 'document_deleted',
  SUBSCRIPTION_CREATED         = 'subscription_created',
  SUBSCRIPTION_UPGRADED        = 'subscription_upgraded',
  SUBSCRIPTION_RENEWED         = 'subscription_renewed',
  SUBSCRIPTION_EXPIRED         = 'subscription_expired',
  SUBSCRIPTION_CANCELED        = 'subscription_canceled',
  SUBSCRIPTION_PERIOD_PAID     = 'subscription_period_paid',
  BUILDER_REGISTERED           = 'builder_registered',
  BUILDER_STATUS_CHANGED       = 'builder_status_changed',
  BUILDER_DELETED              = 'builder_deleted',
  DEMO_REQUEST_RECEIVED        = 'demo_request_received',
  UPGRADE_REQUEST_RECEIVED     = 'upgrade_request_received',
  ADMIN_REVENUE_RECORDED       = 'admin_revenue_recorded',
}

export enum ActivityLogEntityType {
  TENANT       = 'tenant',
  LEASE        = 'lease',
  PAYMENT      = 'payment',
  BUILDING     = 'building',
  ROOM         = 'room',
  USER         = 'user',
  DOCUMENT     = 'document',
  SUBSCRIPTION = 'subscription',
  DEMO_REQUEST = 'demo_request',
}

export interface IActivityLog {
  _id?:         string;
  action:       ActivityLogAction;
  entityType?:  ActivityLogEntityType;
  buildingId?:  string;
  entityId?:    string;
  unitId?:      string;
  ipAddress?:   string;
  metadata?:    Record<string, any>;
  userAgent?:   string;
  userId:       string;
  description?: string;
  createdAt?:   Date;
  updatedAt?:   Date;
}
