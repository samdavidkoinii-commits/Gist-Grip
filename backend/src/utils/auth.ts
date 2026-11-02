import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export type AuthUser = { id: number; role: string; email: string; name: string };
export function signToken(user: AuthUser) { return jwt.sign(user, config.jwtSecret, { expiresIn: '7d' }); }
export function verifyToken(token: string) { return jwt.verify(token, config.jwtSecret) as AuthUser; }
