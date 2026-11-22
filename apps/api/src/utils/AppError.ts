export class AppError extends Error {
  constructor(
    public message:    string,
    public statusCode: number,
    public errorCode:  string = 'INTERNAL_ERROR',
    public isOperational = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
