export type UserRole   = 'super_admin' | 'admin' | 'manager';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

export interface IUser {
  _id?:            string;
  email:           string;
  first_name:      string;
  last_name:       string;
  phone_number?:   string;
  password:        string;
  status:          UserStatus;   
  role:            UserRole;     
  building_id?:    string;       
  profile_image?:  string;
  lastLoginAt?:    Date;
  refresh_token?:  string | null;
  phone_verified:  boolean;
  email_verified:  boolean;
  paymentStatus:   boolean;
  subscriptionId?: string;       
  createdAt?:      Date;
  updatedAt?:      Date;
}
