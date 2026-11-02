import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type AuthUser } from '../utils/auth.js';

declare global { namespace Express { interface Request { user?: AuthUser } } }

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ success:false, message:'Authentication required' });
  try { req.user = verifyToken(header.slice(7)); next(); } catch { return res.status(401).json({ success:false, message:'Invalid or expired token' }); }
}

export function requireRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ success:false, message:'Insufficient permissions' });
    next();
  };
}
