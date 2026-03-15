export interface IUser {
  _id?: string;
  roleId?: string;
  password: string;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  avatarUrl?: string;
  companyId?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  email: string;
  otp?: string | null;
  otpExpiresAt?: Date | null; 
  refreshToken?: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}