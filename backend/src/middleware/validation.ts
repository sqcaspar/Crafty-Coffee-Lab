import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { ApiResponse, ValidationErrorResponse } from '../shared/index.js';

/**
 * Generic validation middleware factory
 */
export const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const validationError: ValidationErrorResponse = {
          success: false,
          error: 'Validation failed',
          message: 'The request contains invalid data',
          timestamp: new Date().toISOString(),
          errors: result.error.errors.map(err => ({
            field: err.path.join('.') || 'root',
            message: err.message,
            code: err.code,
            value: err.path.reduce((obj: any, key: string | number) => obj?.[key], req.body)
          }))
        };
        
        return res.status(400).json(validationError);
      }
      
      // Attach validated data to request
      req.body = result.data;
      next();
    } catch (error) {
      const apiError: ApiResponse = {
        success: false,
        error: 'Internal validation error',
        message: 'An error occurred during validation'
      };
      
      res.status(500).json(apiError);
    }
  };
};

/**
 * Validate query parameters
 */
export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const validationError: ValidationErrorResponse = {
          success: false,
          error: 'Query validation failed',
          message: 'Invalid query parameters',
          timestamp: new Date().toISOString(),
          errors: result.error.errors.map(err => ({
            field: err.path.join('.') || 'root',
            message: err.message,
            code: err.code,
            value: err.path.reduce((obj: any, key: string | number) => obj?.[key], req.query)
          }))
        };
        
        return res.status(400).json(validationError);
      }
      
      req.query = result.data as any;
      next();
    } catch (error) {
      const apiError: ApiResponse = {
        success: false,
        error: 'Internal validation error',
        message: 'An error occurred during query validation'
      };
      
      res.status(500).json(apiError);
    }
  };
};

/**
 * Validate URL parameters
 */
export const validateParams = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.params);
      
      if (!result.success) {
        const validationError: ValidationErrorResponse = {
          success: false,
          error: 'Parameter validation failed',
          message: 'Invalid URL parameters',
          timestamp: new Date().toISOString(),
          errors: result.error.errors.map(err => ({
            field: err.path.join('.') || 'root',
            message: err.message,
            code: err.code,
            value: err.path.reduce((obj: any, key: string | number) => obj?.[key], req.params)
          }))
        };
        
        return res.status(400).json(validationError);
      }
      
      req.params = result.data as any;
      next();
    } catch (error) {
      const apiError: ApiResponse = {
        success: false,
        error: 'Internal validation error',
        message: 'An error occurred during parameter validation'
      };
      
      res.status(500).json(apiError);
    }
  };
};

/**
 * UUID parameter validation schema
 */
export const UUIDParamSchema = z.object({
  id: z.string().uuid('ID must be a valid UUID')
});

/**
 * Common middleware for UUID validation
 */
export const validateUUIDParam = validateParams(UUIDParamSchema);