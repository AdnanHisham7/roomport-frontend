import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../shared/error/app-error';
import { MulterError } from 'multer';

export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.log('Global error handler caught:', error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message:    error.message,
      suggestion: error.suggestion,
    });
    return;
  }

  if (error instanceof MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'File is too large. Maximum size is 5MB.'
      : error.message;
    res.status(400).json({ message, suggestion: 'Choose a smaller or differently-formatted file.' });
    return;
  }

  res.status(500).json({
    message:    'An unexpected error occurred.',
    suggestion: 'Please try again later or contact support.',
    error:      error.message,
  });
};