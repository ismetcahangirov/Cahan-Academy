import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const UPLOAD_FOLDER = 'cahan-academy';

/** Parameters the upload widget is allowed to have signed. Anything else is refused. */
const SIGNABLE_PARAMS = new Set([
  'timestamp',
  'source',
  'folder',
  'upload_preset',
  'custom_coordinates',
  'use_filename',
  'unique_filename',
  'tags',
]);

const MAX_TIMESTAMP_SKEW_S = 60 * 60; // Cloudinary itself rejects signatures older than 1 hour

/**
 * Validates the params the widget asks us to sign. Returns an error message or null.
 * Without this, any admin session could get a signature for arbitrary upload options
 * (overwrite/public_id of existing assets, eval, notification_url, other folders...).
 */
export const validateSignParams = (params: unknown, nowS = Math.floor(Date.now() / 1000)): string | null => {
  if (!params || typeof params !== 'object' || Array.isArray(params)) return 'Yanlış parametrlər';
  const entries = Object.entries(params as Record<string, unknown>);

  for (const [key, value] of entries) {
    if (!SIGNABLE_PARAMS.has(key)) return `İcazəsiz parametr: ${key}`;
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
      return `Yanlış parametr dəyəri: ${key}`;
    }
  }

  const p = params as Record<string, unknown>;
  const ts = Number(p.timestamp);
  if (!Number.isFinite(ts) || Math.abs(nowS - ts) > MAX_TIMESTAMP_SKEW_S) return 'Yanlış timestamp';
  if (p.folder !== undefined && p.folder !== UPLOAD_FOLDER) return 'Yanlış qovluq';
  return null;
};

export const generateSignature = asyncHandler(async (req: Request, res: Response) => {
  const error = validateSignParams(req.body);
  if (error) {
    return apiResponse.error(res, { message: error, status: 400 });
  }

  const signature = cloudinary.utils.api_sign_request(req.body, env.CLOUDINARY_API_SECRET);

  return apiResponse.success(res, {
    data: {
      signature,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
    },
    status: 200,
  });
});
