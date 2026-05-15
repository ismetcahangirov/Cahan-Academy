import { ErrorRequestHandler } from 'express';
import { apiResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

export const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.isOperational ? err.message : 'Xidmət müvəqqəti əlçatmazdır';

  if (env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return apiResponse.error(res, {
    status:    statusCode,
    message:   message,
    errorCode: err.errorCode,
    errors:    env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
