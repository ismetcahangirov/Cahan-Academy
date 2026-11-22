import { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { apiResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

/** JSON 404 for unknown API routes (Express' default is an HTML page). */
export const notFoundHandler: RequestHandler = (_req, res) => {
  apiResponse.error(res, { status: 404, message: 'Tapılmadı', errorCode: 'NOT_FOUND' });
};

export const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Validation errors thrown by schema.parse() inside asyncHandler routes used to surface as 500.
  if (err instanceof ZodError || err?.name === 'ZodError') {
    return apiResponse.error(res, {
      status: 400,
      message: err.errors?.[0]?.message ?? 'Yanlış məlumat',
      errorCode: 'VALIDATION_ERROR',
    });
  }

  // body-parser errors (malformed JSON, payload too large) are client errors.
  if (err?.type === 'entity.parse.failed') {
    return apiResponse.error(res, { status: 400, message: 'Yanlış JSON', errorCode: 'BAD_JSON' });
  }
  if (err?.type === 'entity.too.large') {
    return apiResponse.error(res, { status: 413, message: 'Sorğu çox böyükdür', errorCode: 'PAYLOAD_TOO_LARGE' });
  }

  const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500;
  const message    = err?.isOperational ? err.message : 'Xidmət müvəqqəti əlçatmazdır';

  // Always log unexpected errors (Vercel logs are the only place to see them in production).
  if (statusCode >= 500) {
    console.error(err);
  }

  return apiResponse.error(res, {
    status:    statusCode,
    message:   message,
    errorCode: err?.errorCode,
    errors:    env.NODE_ENV === 'development' ? err?.stack : undefined,
  });
};
