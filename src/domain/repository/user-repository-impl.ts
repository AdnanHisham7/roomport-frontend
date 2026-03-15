import type { IRole } from '../entities/Role';
import type { IUser } from '../entities/User';

export interface IUserWithRole extends IUser {
  role: IRole;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;

  findByEmailWithRole(email: string): Promise<IUserWithRole | null>;

  findById(id: string): Promise<IUser | null>;

  // Used by bootstrap to check if any users exist yet
  findAll(): Promise<IUser[]>;

  create(data: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<IUser>;

  updateOtp(email: string, otp: string, otpExpiresAt: Date): Promise<void>;

  clearOtp(email: string): Promise<void>;

  updatePassword(email: string, hashedPassword: string): Promise<void>;

  verifyEmail(email: string): Promise<void>;

  updateRefreshToken(userId: string, hashedToken: string | null): Promise<void>;

  updateLastLogin(userId: string): Promise<void>;
}
