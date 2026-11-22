import { Response } from 'express';

export interface ApiResponseData {
  success: boolean;
  message?: string;
  data?: any;
  errorCode?: string;
  errors?: any;
}

export const apiResponse = (
  success: boolean,
  message?: string,
  data?: any
): ApiResponseData => ({
  success,
  message,
  data,
});

// Backward compatibility or for specific status control
apiResponse.success = (res: Response, { data, message, status = 200 }: { data?: any; message?: string; status?: number }) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

apiResponse.error = (res: Response, { message, status = 500, errorCode, errors }: { message: string; status?: number; errorCode?: string; errors?: any }) => {
  return res.status(status).json({
    success: false,
    message,
    errorCode,
    errors,
  });
};
