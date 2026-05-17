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

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return apiResponse.error(res, { message: 'Fayl tapılmadı', status: 400 });
  }
  const url = `/uploads/${req.file.filename}`;
  return apiResponse.success(res, { data: { url }, status: 201 });
});

export const generateSignature = asyncHandler(async (req: Request, res: Response) => {
  const paramsToSign = req.body;

  const signature = cloudinary.utils.api_sign_request(paramsToSign, env.CLOUDINARY_API_SECRET);

  return apiResponse.success(res, {
    data: {
      signature,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
    },
    status: 200,
  });
});
