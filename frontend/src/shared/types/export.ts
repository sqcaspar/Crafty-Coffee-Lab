// Export functionality related TypeScript interfaces

import type { SearchFilters } from './search.js';
import type { RecipeId } from './recipe.js';

/**
 * Export format options
 */
export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'excel'
}

/**
 * Export scope options
 */
export enum ExportScope {
  ALL = 'all',
  FILTERED = 'filtered',
  SELECTED = 'selected'
}

/**
 * Export configuration interface
 */
export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  
  // For selected recipes export
  selectedRecipeIds?: RecipeId[];
  
  // For filtered export
  filters?: SearchFilters;
  
  // Field selection
  includeFields?: string[]; // Specific fields to include
  excludeFields?: string[]; // Specific fields to exclude
  
  // Format-specific options
  formatOptions?: {
    // CSV options
    delimiter?: string; // Default: ','
    quoteChar?: string; // Default: '"'
    includeHeaders?: boolean; // Default: true
    
    // Excel options
    worksheetName?: string; // Default: 'Recipes'
    includeFormatting?: boolean; // Default: true
    includeSummarySheet?: boolean; // Default: false
  };
  
  // File options
  filename?: string; // Custom filename (without extension)
  includeTimestamp?: boolean; // Add timestamp to filename
}

/**
 * Export request interface
 */
export interface ExportRequest {
  options: ExportOptions;
  metadata?: {
    exportedBy?: string;
    exportReason?: string;
    notes?: string;
  };
}

/**
 * Export response interface
 */
export interface ExportResponse {
  success: boolean;
  downloadUrl?: string; // URL to download the generated file
  filename: string;
  fileSize: number; // Size in bytes
  recordCount: number; // Number of recipes exported
  format: ExportFormat;
  expiresAt: string; // ISO timestamp when download link expires
  error?: string;
}

/**
 * Export job status (for async exports)
 */
export enum ExportJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Export job interface for tracking async exports
 */
export interface ExportJob {
  id: string;
  status: ExportJobStatus;
  progress: number; // 0-100 percentage
  createdAt: string;
  completedAt?: string;
  options: ExportOptions;
  result?: ExportResponse;
  error?: string;
}

/**
 * Export field mapping for column headers
 */
export interface ExportFieldMapping {
  [key: string]: {
    header: string;
    description?: string;
    dataType: 'string' | 'number' | 'boolean' | 'date';
    required: boolean;
  };
}

/**
 * Export statistics
 */
export interface ExportStats {
  totalExports: number;
  exportsByFormat: Record<ExportFormat, number>;
  exportsByScope: Record<ExportScope, number>;
  averageRecordsPerExport: number;
  mostExportedFields: string[];
  recentExports: Array<{
    timestamp: string;
    format: ExportFormat;
    scope: ExportScope;
    recordCount: number;
  }>;
}