import { IUser } from '../../../domain/entities/User';

export interface IUserUseCase {
  getProfile(userId: string): Promise<IUser | null>;
  updateProfile(userId: string, data: Partial<IUser>): Promise<IUser | null>;
  createManager(adminId: string, data: any): Promise<IUser>;
}
