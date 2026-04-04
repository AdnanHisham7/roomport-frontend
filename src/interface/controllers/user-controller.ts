import { Request, Response } from 'express';
import { IUserUseCase } from '../../application/interface/user/user-usecase.impl';
import { AppError } from '../../shared/error/app-error';

export class UserController {
  constructor(private readonly userUseCase: IUserUseCase) {}

  getProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized access.' });
      }

      const profile = await this.userUseCase.getProfile(userId);
      return res.status(200).json({ message: 'Profile fetched successfully.', data: profile });
    } catch (error) {
      return this.handleError(res, error, 'An error occurred while fetching profile.');
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized access.' });
      }

      const data = req.body;
      const updatedProfile = await this.userUseCase.updateProfile(userId, data);
      return res.status(200).json({ message: 'Profile updated successfully.', data: updatedProfile });
    } catch (error) {
      return this.handleError(res, error, 'An error occurred while updating profile.');
    }
  };

  createManager = async (req: Request, res: Response): Promise<Response> => {
    try {
      const adminId = req.user?.userId;
      if (!adminId) {
        return res.status(401).json({ message: 'Unauthorized access.' });
      }

      const data = req.body;
      if (!data.email || !data.password || !data.first_name || !data.last_name) {
          throw new AppError('Manager creation failed', 400, 'Missing required fields (email, password, first_name, last_name)');
      }

      const newManager = await this.userUseCase.createManager!(adminId, data);
      return res.status(201).json({ message: 'Manager created successfully.', data: newManager });
    } catch (error) {
      return this.handleError(res, error, 'An error occurred while creating manager.');
    }
  };

  private handleError(res: Response, error: unknown, fallback: string): Response {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message,
        suggestion: error.suggestion,
      });
    }
    return res.status(500).json({
      message: fallback,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
