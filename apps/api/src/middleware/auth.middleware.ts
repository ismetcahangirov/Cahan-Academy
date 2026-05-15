import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import { apiResponse } from '../utils/apiResponse.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    isSuperAdmin?: boolean;
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
    const { payload } = await verifyAccessToken(token);

    req.user = {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
      isSuperAdmin: payload.isSuperAdmin as boolean,
    };

    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json(apiResponse(false, 'Unauthorized: Invalid or expired token'));
  }
};
