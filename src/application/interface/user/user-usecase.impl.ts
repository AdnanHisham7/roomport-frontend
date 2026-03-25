import { IUser } from '../../../domain/entities/User';

export interface IUserUseCase {
  getProfile(userId: string): Promise<IUser | null>;
  updateProfile(userId: string, data: Partial<IUser>): Promise<IUser | null>;
}
