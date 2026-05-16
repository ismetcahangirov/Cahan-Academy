import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    return apiResponse.error(res, { message: 'Fayl tapılmadı', status: 400 });
  }
  const url = `/uploads/${req.file.filename}`;
  return apiResponse.success(res, { data: { url }, status: 201 });
});
