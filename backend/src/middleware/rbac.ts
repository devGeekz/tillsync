import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../utils/errors';

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new UnauthorizedError('Not authenticated'));
    }
    if (!allowedRoles.includes(req.auth.role)) {
      return next(new UnauthorizedError('Insufficient permissions'));
    }
    next();
  };
}