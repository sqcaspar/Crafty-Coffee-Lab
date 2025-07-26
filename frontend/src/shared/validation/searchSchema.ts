import { z } from 'zod';
import { RoastingLevelSchema, BrewingMethodSchema } from './recipeSchema.js';

// Sort Option enum schema
export const SortOptionSchema = z.enum(['date-created', 'date-modified', 'overall-impression', 'recipe-name']);

// Sort Direction schema
export const SortDirectionSchema = z.enum(['asc', 'desc']);

// Date range schema
export const DateRangeSchema = z.object({
  start: z.string().datetime('Start date must be a valid datetime'),
  end: z.string().datetime('End date must be a valid datetime'),
  field: z.enum(['dateCreated', 'dateModified', 'roastingDate'])
}).refine(data => new Date(data.start) <= new Date(data.end), {
  message: 'Start date must be before or equal to end date'
});

// Numeric range schema
export const NumericRangeSchema = z.tuple([
  z.number().min(0, 'Minimum value must be non-negative'),
  z.number().max(10000, 'Maximum value must be reasonable')
]).refine(([min, max]) => min <= max, {
  message: 'Minimum value must be less than or equal to maximum value'
});

// Search Filters validation schema
export const SearchFiltersSchema = z.object({
  // Text search
  searchTerm: z.string().max(200, 'Search term must be 200 characters or less').optional(),
  
  // Category filters
  origins: z.array(z.string().min(1).max(100)).max(50, 'Too many origins selected').optional(),
  roastingLevels: z.array(RoastingLevelSchema).max(10, 'Too many roasting levels selected').optional(),
  brewingMethods: z.array(BrewingMethodSchema).max(10, 'Too many brewing methods selected').optional(),
  
  // Numeric range filters
  overallImpressionRange: z.tuple([
    z.number().int().min(1, 'Minimum impression must be at least 1').max(10, 'Minimum impression must be at most 10'),
    z.number().int().min(1, 'Maximum impression must be at least 1').max(10, 'Maximum impression must be at most 10')
  ]).refine(([min, max]) => min <= max, {
    message: 'Minimum impression must be less than or equal to maximum impression'
  }).optional(),
  
  altitudeRange: NumericRangeSchema.optional(),
  
  // Date filters
  dateRange: DateRangeSchema.optional(),
  
  // Boolean filters
  favoritesOnly: z.boolean().optional(),
  
  // Collection filters
  collections: z.array(z.string().min(1).max(100)).max(20, 'Too many collections selected').optional(),
  includeUncollected: z.boolean().optional()
});

// Sort Configuration schema
export const SortConfigSchema = z.object({
  field: SortOptionSchema,
  direction: SortDirectionSchema
});

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1'),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(1000, 'Limit must be at most 1000')
});

// Search Request validation schema
export const SearchRequestSchema = z.object({
  filters: SearchFiltersSchema.optional(),
  sort: SortConfigSchema.default({ field: 'date-modified', direction: 'desc' }),
  pagination: PaginationSchema.default({ page: 1, limit: 20 })
});

// Search Facets schema
export const SearchFacetsSchema = z.object({
  origins: z.array(z.object({
    value: z.string(),
    count: z.number().int().min(0)
  })),
  roastingLevels: z.array(z.object({
    value: RoastingLevelSchema,
    count: z.number().int().min(0)
  })),
  brewingMethods: z.array(z.object({
    value: BrewingMethodSchema,
    count: z.number().int().min(0)
  })),
  collections: z.array(z.object({
    value: z.string(),
    count: z.number().int().min(0)
  })),
  overallImpressionRange: z.object({
    min: z.number().int().min(1).max(10),
    max: z.number().int().min(1).max(10)
  }),
  altitudeRange: z.object({
    min: z.number().min(0),
    max: z.number().max(10000)
  })
});

// Saved Search schema
export const SavedSearchSchema = z.object({
  id: z.string().uuid('Saved search ID must be a valid UUID'),
  name: z.string().min(1, 'Search name is required').max(100, 'Search name must be 100 characters or less'),
  filters: SearchFiltersSchema,
  sort: SortConfigSchema,
  createdDate: z.string().datetime(),
  lastUsed: z.string().datetime()
});

// Search Suggestion schema
export const SearchSuggestionSchema = z.object({
  type: z.enum(['recipe', 'origin', 'collection', 'term']),
  value: z.string().min(1),
  label: z.string().min(1),
  count: z.number().int().min(0).optional()
});

// Custom validation functions
export const validateSearchFilters = (data: unknown) => {
  return SearchFiltersSchema.safeParse(data);
};

export const validateSearchRequest = (data: unknown) => {
  return SearchRequestSchema.safeParse(data);
};

export const validateSortConfig = (data: unknown) => {
  return SortConfigSchema.safeParse(data);
};

// Filter combination validation
export const validateFilterCombination = (filters: z.infer<typeof SearchFiltersSchema>) => {
  const errors: string[] = [];
  
  // Check for conflicting filters
  if (filters.favoritesOnly && filters.collections?.length === 0) {
    errors.push('Cannot show favorites only with no collections selected');
  }
  
  // Check date range validity
  if (filters.dateRange) {
    const start = new Date(filters.dateRange.start);
    const end = new Date(filters.dateRange.end);
    const now = new Date();
    
    if (start > now) {
      errors.push('Start date cannot be in the future');
    }
    
    if (end > now) {
      errors.push('End date cannot be in the future');
    }
  }
  
  // Check numeric ranges
  if (filters.altitudeRange) {
    const [min, max] = filters.altitudeRange;
    if (min < 0) {
      errors.push('Altitude minimum cannot be negative');
    }
    if (max > 10000) {
      errors.push('Altitude maximum seems unrealistic');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Transform function for search filters
export const transformSearchFilters = (filters: z.infer<typeof SearchFiltersSchema>) => {
  return {
    ...filters,
    searchTerm: filters.searchTerm?.trim(),
    origins: filters.origins?.filter(Boolean),
    collections: filters.collections?.filter(Boolean)
  };
};

// Export type inference helpers
export type SearchFiltersSchemaType = z.infer<typeof SearchFiltersSchema>;
export type SearchRequestSchemaType = z.infer<typeof SearchRequestSchema>;
export type SortConfigSchemaType = z.infer<typeof SortConfigSchema>;