export class AppError extends Error {
  public readonly statusCode: number;
  public readonly suggestion: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    suggestion = 'Please try again later or contact support.',
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.suggestion = suggestion;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', suggestion = 'Please check your input and try again.') {
    super(message, 404, suggestion);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', suggestion = 'Please login and try again.') {
    super(message, 401, suggestion);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', suggestion = 'Please check your input and try again.') {
    super(message, 400, suggestion);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', suggestion = 'You do not have permission to perform this action.') {
    super(message, 403, suggestion);
  }
}