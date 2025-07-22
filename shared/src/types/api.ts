// API-related TypeScript interfaces

import type { Recipe, RecipeId, RecipeSummary } from './recipe.js';
import type { Collection, CollectionId } from './collection.js';

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

/**
 * API Error response
 */
export interface ApiError {
  success: false;
  error: string;
  message?: string;
  details?: Record<string, any>;
  timestamp: string;
}

/**
 * Pagination interface for list responses
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: Pagination;
}

/**
 * Recipe API responses
 */
export interface RecipeResponse extends ApiResponse<Recipe> {}
export interface RecipeListResponse extends ApiResponse<Recipe[]> {}
export interface RecipeSummaryListResponse extends ApiResponse<RecipeSummary[]> {}

/**
 * Collection API responses
 */
export interface CollectionResponse extends ApiResponse<Collection> {}
export interface CollectionListResponse extends ApiResponse<Collection[]> {}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Validation error response
 */
export interface ValidationErrorResponse extends ApiError {
  errors: ValidationError[];
}

/**
 * Health check response
 */
export interface HealthCheckResponse extends ApiResponse {
  data: {
    status: 'ok' | 'error';
    message: string;
    timestamp: string;
    environment: string;
    database: {
      connected: boolean;
      recipes: number;
      collections: number;
    };
  };
}

/**
 * Bulk operation request
 */
export interface BulkOperationRequest {
  recipeIds: RecipeId[];
  operation: 'delete' | 'favorite' | 'unfavorite' | 'add_to_collection' | 'remove_from_collection';
  collectionId?: CollectionId; // Required for collection operations
}

/**
 * Bulk operation response
 */
export interface BulkOperationResponse extends ApiResponse {
  data: {
    successful: RecipeId[];
    failed: Array<{
      recipeId: RecipeId;
      error: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  };
}