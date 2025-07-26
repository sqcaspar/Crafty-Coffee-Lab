import { z } from 'zod';
import { SearchFiltersSchema } from './searchSchema.js';

// Export Format enum schema
export const ExportFormatSchema = z.enum(['csv', 'excel']);

// Export Scope enum schema
export const ExportScopeSchema = z.enum(['all', 'filtered', 'selected']);

// Export Job Status enum schema
export const ExportJobStatusSchema = z.enum(['pending', 'processing', 'completed', 'failed']);

// Format-specific options schema
export const FormatOptionsSchema = z.object({
  // CSV options
  delimiter: z.string().length(1, 'Delimiter must be a single character').default(','),
  quoteChar: z.string().length(1, 'Quote character must be a single character').default('"'),
  includeHeaders: z.boolean().default(true),
  
  // Excel options
  worksheetName: z.string().min(1).max(31, 'Worksheet name must be 1-31 characters').default('Recipes'),
  includeFormatting: z.boolean().default(true),
  includeSummarySheet: z.boolean().default(false)
}).partial();

// Export Options validation schema
export const ExportOptionsSchema = z.object({
  format: ExportFormatSchema,
  scope: ExportScopeSchema,
  
  // For selected recipes export
  selectedRecipeIds: z.array(z.string().uuid()).optional(),
  
  // For filtered export
  filters: SearchFiltersSchema.optional(),
  
  // Field selection
  includeFields: z.array(z.string().min(1)).optional(),
  excludeFields: z.array(z.string().min(1)).optional(),
  
  // Format-specific options
  formatOptions: FormatOptionsSchema.optional(),
  
  // File options
  filename: z.string().min(1).max(100, 'Filename must be 1-100 characters').optional(),
  includeTimestamp: z.boolean().default(true)
}).refine(data => {
  // Validate that selected scope has recipe IDs
  if (data.scope === 'selected' && (!data.selectedRecipeIds || data.selectedRecipeIds.length === 0)) {
    return false;
  }
  // Validate that filtered scope has filters
  if (data.scope === 'filtered' && !data.filters) {
    return false;
  }
  // Validate that include/exclude fields don't overlap
  if (data.includeFields && data.excludeFields) {
    const overlap = data.includeFields.some(field => data.excludeFields?.includes(field));
    if (overlap) {
      return false;
    }
  }
  return true;
}, {
  message: 'Export options validation failed'
});

// Export Request validation schema
export const ExportRequestSchema = z.object({
  options: ExportOptionsSchema,
  metadata: z.object({
    exportedBy: z.string().max(100).optional(),
    exportReason: z.string().max(200).optional(),
    notes: z.string().max(500).optional()
  }).optional()
});

// Export Response validation schema
export const ExportResponseSchema = z.object({
  success: z.boolean(),
  downloadUrl: z.string().url('Download URL must be a valid URL').optional(),
  filename: z.string().min(1),
  fileSize: z.number().int().min(0, 'File size must be non-negative'),
  recordCount: z.number().int().min(0, 'Record count must be non-negative'),
  format: ExportFormatSchema,
  expiresAt: z.string().datetime('Expires at must be a valid datetime'),
  error: z.string().optional()
});

// Export Job validation schema
export const ExportJobSchema = z.object({
  id: z.string().uuid('Export job ID must be a valid UUID'),
  status: ExportJobStatusSchema,
  progress: z.number().min(0, 'Progress must be at least 0').max(100, 'Progress must be at most 100'),
  createdAt: z.string().datetime('Created at must be a valid datetime'),
  completedAt: z.string().datetime('Completed at must be a valid datetime').optional(),
  options: ExportOptionsSchema,
  result: ExportResponseSchema.optional(),
  error: z.string().optional()
});

// Export Field Mapping schema
export const ExportFieldMappingSchema = z.record(
  z.string(),
  z.object({
    header: z.string().min(1, 'Header is required'),
    description: z.string().optional(),
    dataType: z.enum(['string', 'number', 'boolean', 'date']),
    required: z.boolean()
  })
);

// Export Statistics schema
export const ExportStatsSchema = z.object({
  totalExports: z.number().int().min(0),
  exportsByFormat: z.record(ExportFormatSchema, z.number().int().min(0)),
  exportsByScope: z.record(ExportScopeSchema, z.number().int().min(0)),
  averageRecordsPerExport: z.number().min(0),
  mostExportedFields: z.array(z.string()),
  recentExports: z.array(z.object({
    timestamp: z.string().datetime(),
    format: ExportFormatSchema,
    scope: ExportScopeSchema,
    recordCount: z.number().int().min(0)
  })).max(10, 'Too many recent exports')
});

// Custom validation functions
export const validateExportOptions = (data: unknown) => {
  return ExportOptionsSchema.safeParse(data);
};

export const validateExportRequest = (data: unknown) => {
  return ExportRequestSchema.safeParse(data);
};

export const validateExportJob = (data: unknown) => {
  return ExportJobSchema.safeParse(data);
};

// Export options validation with business rules
export const validateExportOptionsWithRules = (options: z.infer<typeof ExportOptionsSchema>) => {
  const errors: string[] = [];
  
  // Check selected recipes limit
  if (options.scope === 'selected' && options.selectedRecipeIds) {
    if (options.selectedRecipeIds.length > 1000) {
      errors.push('Cannot export more than 1000 selected recipes at once');
    }
  }
  
  // Check filename restrictions
  if (options.filename) {
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(options.filename)) {
      errors.push('Filename contains invalid characters');
    }
  }
  
  // Check format-specific constraints
  if (options.format === 'excel' && options.formatOptions?.worksheetName) {
    const invalidSheetChars = /[\\\/\*\?\[\]\:]/;
    if (invalidSheetChars.test(options.formatOptions.worksheetName)) {
      errors.push('Excel worksheet name contains invalid characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Transform function for export options
export const transformExportOptions = (options: z.infer<typeof ExportOptionsSchema>) => {
  return {
    ...options,
    filename: options.filename?.trim(),
    selectedRecipeIds: options.selectedRecipeIds?.filter(Boolean),
    formatOptions: {
      ...options.formatOptions,
      worksheetName: options.formatOptions?.worksheetName?.trim()
    }
  };
};

// Export type inference helpers
export type ExportOptionsSchemaType = z.infer<typeof ExportOptionsSchema>;
export type ExportRequestSchemaType = z.infer<typeof ExportRequestSchema>;
export type ExportJobSchemaType = z.infer<typeof ExportJobSchema>;