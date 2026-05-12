import { Response } from 'express';

export const apiResponse = {
  success: (res: Response, { data, message, status = 200 }: { data?: any; message?: string; status?: number }) => {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  },

  error: (res: Response, { message, status = 500, errorCode, errors }: { message: string; status?: number; errorCode?: string; errors?: any }) => {
    return res.status(status).json({
      success: false,
      message,
      errorCode,
      errors,
    });
  },
};
