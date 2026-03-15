import type { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '../../application/interface/common/jwt-service-usecase.impl';
import { JwtService } from '../../infrastructure/services/jwt-service';



// Extend Express Request to carry the decoded user payload
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

const jwtService = new JwtService();

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        message:    'Authentication failed: No token provided.',
        suggestion: 'Please include a valid Bearer token in the Authorization header.',
      });
      return;
    }

    const token   = authHeader.split(' ')[1];
    const payload = jwtService.verifyAccessToken(token);
    req.user      = payload;

    next();
  } catch (error) {
    console.log('Error in authenticate middleware:', error);
    res.status(401).json({
      message:    'Authentication failed: Invalid or expired token.',
      suggestion: 'Please login again or use your refresh token.',
    });
  }
};