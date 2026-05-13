import { Request, Response } from 'express';
import { env } from '../config/env.js';

export const getHealth = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '0.1.0'
  });
};
