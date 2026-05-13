import { Request, Response, NextFunction } from 'express';
import * as jose from 'jose';
import { env } from '../config/env.js';
import { apiResponse } from '../utils/apiResponse.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
       res.status(401).json(apiResponse(false, 'Unauthorized: Missing token'));
       return;
    }

    const token = authHeader.split(' ')[1];
    const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET || 'super-secret');

    const { payload } = await jose.jwtVerify(token, secret);

    req.user = {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
    };

    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json(apiResponse(false, 'Unauthorized: Invalid or expired token'));
  }
};
