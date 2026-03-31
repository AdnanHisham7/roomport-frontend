import { IUser } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repository/user-repository-impl';
import { AppError } from '../../../shared/error/app-error';
import { IUserUseCase } from '../../interface/user/user-usecase.impl';

export class UserUseCase implements IUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async getProfile(userId: string): Promise<IUser | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'Make sure the user ID is correct');
    }
    return user;
  }

  async updateProfile(userId: string, data: Partial<IUser>): Promise<IUser | null> {
    // You might want to strip sensitive fields here like password, role, email_verified, etc.
    const allowedUpdates: Partial<IUser> = { ...data };
    delete allowedUpdates.password;
    delete allowedUpdates.role;
    delete allowedUpdates.email_verified;
    delete allowedUpdates.phone_verified;
    delete allowedUpdates.status;

    const updatedUser = await this.userRepository.update(userId, allowedUpdates);
    if (!updatedUser) {
      throw new AppError('User not found', 404, 'Make sure the user ID is correct');
    }
    return updatedUser;
  }
}
