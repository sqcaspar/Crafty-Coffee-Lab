import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create standardized API errors
 */
export const createApiError = {
  badRequest: (message: string = 'Bad request') => new ApiError(400, message),
  unauthorized: (message: string = 'Unauthorized') => new ApiError(401, message),
  forbidden: (message: string = 'Forbidden') => new ApiError(403, message),
  notFound: (message: string = 'Resource not found') => new ApiError(404, message),
  conflict: (message: string = 'Resource conflict') => new ApiError(409, message),
  unprocessableEntity: (message: string = 'Unprocessable entity') => new ApiError(422, message),
  tooManyRequests: (message: string = 'Too many requests') => new ApiError(429, message),
  internalServer: (message: string = 'Internal server error') => new ApiError(500, message),
};

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging
  console.error('API Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Default error values
  let statusCode = 500;
  let message = 'Internal server error';
  let isOperational = false;

  // Handle API errors
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }
  // Handle specific error types
  else if (err.message && err.message.includes('SQLITE_CONSTRAINT_UNIQUE')) {
    statusCode = 409;
    message = 'Resource with this identifier already exists';
    isOperational = true;
  }
  else if (err.message && err.message.includes('SQLITE_CONSTRAINT_FOREIGNKEY')) {
    statusCode = 400;
    message = 'Invalid reference to related resource';
    isOperational = true;
  }
  else if (err.message && (err.message.includes('ENOTFOUND') || err.message.includes('ECONNREFUSED'))) {
    statusCode = 503;
    message = 'Service temporarily unavailable';
    isOperational = true;
  }

  // Create API error response
  const errorResponse = {
    success: false,
    error: message,
    message: getErrorMessage(statusCode),
    timestamp: new Date().toISOString()
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    (errorResponse as any).stack = err.stack;
    (errorResponse as any).details = {
      originalMessage: err.message,
      isOperational,
      url: req.originalUrl,
      method: req.method
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Get user-friendly error message based on status code
 */
const getErrorMessage = (statusCode: number): string => {
  const messages: Record<number, string> = {
    400: 'The request contains invalid or missing information.',
    401: 'Authentication is required to access this resource.',
    403: 'You do not have permission to access this resource.',
    404: 'The requested resource could not be found.',
    409: 'The request conflicts with the current state of the resource.',
    422: 'The request contains invalid data that cannot be processed.',
    429: 'Too many requests. Please try again later.',
    500: 'An internal server error occurred. Please try again later.',
    503: 'The service is temporarily unavailable. Please try again later.'
  };

  return messages[statusCode] || 'An unexpected error occurred.';
};

/**
 * Async error wrapper to catch async errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};