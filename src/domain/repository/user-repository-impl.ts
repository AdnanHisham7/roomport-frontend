import type { IUser } from '../entities/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  create(data: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<IUser>;
  updateStatus(userId: string, status: IUser['status']): Promise<void>;
  updateEmailVerified(userId: string): Promise<void>;
  updatePassword(email: string, hashedPassword: string): Promise<void>;
  updateRefreshToken(userId: string, hashedToken: string | null): Promise<void>;
  updateLastLogin(userId: string): Promise<void>;
  update(userId: string, data: Partial<IUser>): Promise<IUser | null>;
}
