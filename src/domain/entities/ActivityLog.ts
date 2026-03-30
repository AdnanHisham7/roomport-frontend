export enum ActivityLogAction {
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  TENANT_CREATED = 'tenant_created',
  TENANT_UPDATED = 'tenant_updated',
  TENANT_DELETED = 'tenant_deleted',
  BUILDING_CREATED = 'building_created',
  BUILDING_UPDATED = 'building_updated',
  BUILDING_DELETED = 'building_deleted',
  LEASE_CREATED = 'lease_created',
  LEASE_TERMINATED = 'lease_terminated',
  RENT_PAYMENT_CREATED = 'rent_payment_created',
  RENT_PAYMENT_COMPLETED = 'rent_payment_completed',
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_DELETED = 'document_deleted',
  SUBSCRIPTION_CREATED = 'subscription_created',
  SUBSCRIPTION_UPGRADED = 'subscription_upgraded',
  SUBSCRIPTION_CANCELED = 'subscription_canceled',
}

export enum ActivityLogEntityType {
  TENANT = 'tenant',
  LEASE = 'lease',
  PAYMENT = 'payment',
  BUILDING = 'building',
  USER = 'user',
  DOCUMENT = 'document',
  SUBSCRIPTION = 'subscription',
}

export interface IActivityLog {
  _id?: string;
  action: ActivityLogAction;
  entityType?: ActivityLogEntityType;
  buildingId?: string;
  entityId?: string;
  unitId?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
  userAgent?: string;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
