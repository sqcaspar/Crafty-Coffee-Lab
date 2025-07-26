// Search and filtering related TypeScript interfaces

import type { RoastingLevel, BrewingMethod, SortOption } from './recipe.js';

/**
 * Search filters interface
 */
export interface SearchFilters {
  // Text search
  searchTerm?: string; // Search in recipe names and tasting notes
  
  // Category filters
  origins?: string[]; // Filter by origin countries
  roastingLevels?: RoastingLevel[]; // Filter by roasting levels
  brewingMethods?: BrewingMethod[]; // Filter by brewing methods
  
  // Numeric range filters
  overallImpressionRange?: [number, number]; // Min/max overall impression (1-10)
  altitudeRange?: [number, number]; // Min/max altitude in meters
  
  // Date filters
  dateRange?: {
    start: string; // ISO date string
    end: string; // ISO date string
    field: 'dateCreated' | 'dateModified' | 'roastingDate'; // Which date field to filter
  };
  
  // Boolean filters
  favoritesOnly?: boolean; // Show only favorites
  
  // Collection filters
  collections?: string[]; // Filter by collection names
  includeUncollected?: boolean; // Include recipes not in any collection
}

/**
 * Sort configuration
 */
export interface SortConfig {
  field: SortOption;
  direction: 'asc' | 'desc';
}

/**
 * Search request interface
 */
export interface SearchRequest {
  filters?: SearchFilters;
  sort?: SortConfig;
  pagination?: {
    page: number;
    limit: number;
  };
}

/**
 * Search results interface
 */
export interface SearchResults<T = any> {
  results: T[];
  totalCount: number;
  appliedFilters: SearchFilters;
  sort: SortConfig;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
  };
  facets?: SearchFacets; // Available filter options based on current results
}

/**
 * Search facets for dynamic filter options
 */
export interface SearchFacets {
  origins: Array<{
    value: string;
    count: number;
  }>;
  roastingLevels: Array<{
    value: RoastingLevel;
    count: number;
  }>;
  brewingMethods: Array<{
    value: BrewingMethod;
    count: number;
  }>;
  collections: Array<{
    value: string;
    count: number;
  }>;
  overallImpressionRange: {
    min: number;
    max: number;
  };
  altitudeRange: {
    min: number;
    max: number;
  };
}

/**
 * Saved search interface
 */
export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  sort: SortConfig;
  createdDate: string;
  lastUsed: string;
}

/**
 * Search suggestion interface
 */
export interface SearchSuggestion {
  type: 'recipe' | 'origin' | 'collection' | 'term';
  value: string;
  label: string;
  count?: number; // How many times this appears
}