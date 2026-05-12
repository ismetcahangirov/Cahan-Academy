import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { env } from '../config/env.js';
import { apiResponse } from '../utils/apiResponse.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiResponse.error(res, { message: 'İcazə yoxdur. Token tapılmadı.', status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    
    const { payload } = await jwtVerify(token, secret);
    
    if (payload && typeof payload.id === 'string' && typeof payload.email === 'string') {
      (req as AuthRequest).user = {
        id: payload.id,
        email: payload.email,
      };
      return next();
    }

    return apiResponse.error(res, { message: 'Yanlış token formatı.', status: 401 });
  } catch (error: unknown) {
    return apiResponse.error(res, { message: 'Yanlış və ya vaxtı keçmiş token.', status: 401 });
  }
};
