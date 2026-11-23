import { timingSafeEqual } from 'crypto';
import { Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { apiResponse } from '../utils/apiResponse.js';
import { authMiddleware, AuthRequest } from './auth.middleware.js';

const tokenMatches = (given: string, expected: string) => {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

/**
 * Admin JWT, or the shared server-to-server token of the LMS (header `X-Service-Token`, env CATEGORY_SERVICE_TOKEN).
 * The LMS server manages the course categories through it; the token never reaches a browser.
 * A request that carries the header is judged by the token alone (no fallback to the JWT).
 */
export const adminOrService = (req: AuthRequest, res: Response, next: NextFunction) => {
  const given = req.get('x-service-token');
  if (given === undefined) return authMiddleware(req, res, next);
  const expected = env.CATEGORY_SERVICE_TOKEN;
  if (!expected || !tokenMatches(given, expected)) {
    res.status(401).json(apiResponse(false, 'Unauthorized: Invalid service token'));
    return;
  }
  req.user = { id: 'service:lms', email: '', role: 'service' };
  next();
};
