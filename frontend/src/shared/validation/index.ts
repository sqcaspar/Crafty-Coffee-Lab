// Main validation index - re-export all validation schemas

// Recipe validation
export * from './recipeSchema.js';

// Collection validation
export * from './collectionSchema.js';

// Search validation
export * from './searchSchema.js';

// Export validation
export * from './exportSchema.js';

// Common validation utilities
import { z } from 'zod';

// UUID validation schema
export const UUIDSchema = z.string().uuid('Must be a valid UUID');

// Timestamp validation schema
export const TimestampSchema = z.string().datetime('Must be a valid datetime string');

// Non-empty string schema
export const NonEmptyStringSchema = z.string().min(1, 'Cannot be empty');

// Positive number schema
export const PositiveNumberSchema = z.number().positive('Must be a positive number');

// Common validation helper functions
export const isValidUUID = (value: string): boolean => {
  return UUIDSchema.safeParse(value).success;
};

export const isValidTimestamp = (value: string): boolean => {
  return TimestampSchema.safeParse(value).success;
};

export const sanitizeString = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

export const formatZodValidationErrors = (error: z.ZodError): string[] => {
  return error.errors.map(err => {
    const path = err.path.length > 0 ? `${err.path.join('.')}: ` : '';
    return `${path}${err.message}`;
  });
};

// Generic validation result type
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

// Generic validation function
export const validateData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  } else {
    return {
      success: false,
      errors: formatZodValidationErrors(result.error)
    };
  }
};