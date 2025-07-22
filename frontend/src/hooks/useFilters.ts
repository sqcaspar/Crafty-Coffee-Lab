import { useState, useCallback, useMemo, useEffect } from 'react';
import { RecipeSummary } from '../../../shared/src/types/recipe';

export interface FilterOptions {
  // Origin filter
  origins: string[];
  
  // Brewing method filter
  brewingMethods: string[];
  
  // Rating range filter (1-10)
  ratingRange: {
    min: number;
    max: number;
  };
  
  // Coffee-to-water ratio range filter
  ratioRange: {
    min: number;
    max: number;
  };
  
  // Date range filters
  dateCreatedRange: {
    start: Date | null;
    end: Date | null;
  };
  
  dateModifiedRange: {
    start: Date | null;
    end: Date | null;
  };
  
  // Favorites filter
  favoritesOnly: boolean;
  
  // Collections filter
  collections: string[];
  
  // Additional filters
  hasRating: boolean; // Only show recipes with ratings
  recentlyModified: boolean; // Show recipes modified in last 7 days
}

interface UseFiltersOptions {
  recipes: RecipeSummary[];
  persistFilters?: boolean; // Save filters to localStorage
  storageKey?: string;
}

export interface UseFiltersReturn {
  filterOptions: FilterOptions;
  filteredRecipes: RecipeSummary[];
  activeFiltersCount: number;
  availableOptions: {
    origins: string[];
    brewingMethods: string[];
    collections: string[];
    ratingRange: { min: number; max: number };
    ratioRange: { min: number; max: number };
  };
  
  // Filter setters
  setOrigins: (origins: string[]) => void;
  setBrewingMethods: (methods: string[]) => void;
  setRatingRange: (range: { min: number; max: number }) => void;
  setRatioRange: (range: { min: number; max: number }) => void;
  setDateCreatedRange: (range: { start: Date | null; end: Date | null }) => void;
  setDateModifiedRange: (range: { start: Date | null; end: Date | null }) => void;
  setFavoritesOnly: (enabled: boolean) => void;
  setCollections: (collections: string[]) => void;
  setHasRating: (enabled: boolean) => void;
  setRecentlyModified: (enabled: boolean) => void;
  
  // Utility functions
  clearAllFilters: () => void;
  resetFilters: () => void;
  applyFilterPreset: (preset: Partial<FilterOptions>) => void;
  getFilterSummary: () => string;
}

const DEFAULT_FILTERS: FilterOptions = {
  origins: [],
  brewingMethods: [],
  ratingRange: { min: 1, max: 10 },
  ratioRange: { min: 1, max: 30 },
  dateCreatedRange: { start: null, end: null },
  dateModifiedRange: { start: null, end: null },
  favoritesOnly: false,
  collections: [],
  hasRating: false,
  recentlyModified: false,
};

export function useFilters({
  recipes,
  persistFilters = true,
  storageKey = 'coffeeTracker_filters'
}: UseFiltersOptions): UseFiltersReturn {
  
  // Initialize filters from localStorage or defaults
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(() => {
    if (persistFilters) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Convert date strings back to Date objects
          if (parsed.dateCreatedRange.start) {
            parsed.dateCreatedRange.start = new Date(parsed.dateCreatedRange.start);
          }
          if (parsed.dateCreatedRange.end) {
            parsed.dateCreatedRange.end = new Date(parsed.dateCreatedRange.end);
          }
          if (parsed.dateModifiedRange.start) {
            parsed.dateModifiedRange.start = new Date(parsed.dateModifiedRange.start);
          }
          if (parsed.dateModifiedRange.end) {
            parsed.dateModifiedRange.end = new Date(parsed.dateModifiedRange.end);
          }
          return { ...DEFAULT_FILTERS, ...parsed };
        }
      } catch (error) {
        console.error('Failed to load saved filters:', error);
      }
    }
    return DEFAULT_FILTERS;
  });

  // Save filters to localStorage when they change
  useEffect(() => {
    if (persistFilters) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(filterOptions));
      } catch (error) {
        console.error('Failed to save filters:', error);
      }
    }
  }, [filterOptions, persistFilters, storageKey]);

  // Calculate available filter options from recipes
  const availableOptions = useMemo(() => {
    const origins = [...new Set(recipes.map(r => r.origin).filter(Boolean))].sort();
    const brewingMethods = [...new Set(recipes.map(r => r.brewingMethod).filter(Boolean))].map(String).sort();
    const collections = [...new Set(recipes.flatMap(r => r.collections || []))].sort();
    
    const ratings = recipes.map(r => r.overallImpression || 0).filter(r => r > 0);
    const ratios = recipes.map(r => r.coffeeWaterRatio || 0).filter(r => r > 0);
    
    const ratingRange = ratings.length > 0 
      ? { min: Math.min(...ratings), max: Math.max(...ratings) }
      : { min: 1, max: 10 };
    
    const ratioRange = ratios.length > 0
      ? { min: Math.floor(Math.min(...ratios)), max: Math.ceil(Math.max(...ratios)) }
      : { min: 1, max: 30 };

    return {
      origins,
      brewingMethods,
      collections,
      ratingRange,
      ratioRange
    };
  }, [recipes]);

  // Apply filters to recipes
  const filteredRecipes = useMemo(() => {
    let filtered = [...recipes];

    // Origin filter
    if (filterOptions.origins.length > 0) {
      filtered = filtered.filter(recipe => 
        filterOptions.origins.includes(recipe.origin)
      );
    }

    // Brewing method filter
    if (filterOptions.brewingMethods.length > 0) {
      filtered = filtered.filter(recipe => 
        recipe.brewingMethod && filterOptions.brewingMethods.includes(recipe.brewingMethod)
      );
    }

    // Rating range filter
    filtered = filtered.filter(recipe => {
      const rating = recipe.overallImpression || 0;
      if (filterOptions.hasRating && rating === 0) return false;
      return rating >= filterOptions.ratingRange.min && rating <= filterOptions.ratingRange.max;
    });

    // Ratio range filter
    filtered = filtered.filter(recipe => {
      const ratio = recipe.coffeeWaterRatio || 0;
      return ratio >= filterOptions.ratioRange.min && ratio <= filterOptions.ratioRange.max;
    });

    // Date created range filter
    if (filterOptions.dateCreatedRange.start || filterOptions.dateCreatedRange.end) {
      filtered = filtered.filter(recipe => {
        const createdDate = new Date(recipe.dateCreated);
        const start = filterOptions.dateCreatedRange.start;
        const end = filterOptions.dateCreatedRange.end;
        
        if (start && createdDate < start) return false;
        if (end && createdDate > end) return false;
        return true;
      });
    }

    // Date modified range filter
    if (filterOptions.dateModifiedRange.start || filterOptions.dateModifiedRange.end) {
      filtered = filtered.filter(recipe => {
        const modifiedDate = new Date(recipe.dateModified);
        const start = filterOptions.dateModifiedRange.start;
        const end = filterOptions.dateModifiedRange.end;
        
        if (start && modifiedDate < start) return false;
        if (end && modifiedDate > end) return false;
        return true;
      });
    }

    // Favorites only filter
    if (filterOptions.favoritesOnly) {
      filtered = filtered.filter(recipe => recipe.isFavorite);
    }

    // Collections filter
    if (filterOptions.collections.length > 0) {
      filtered = filtered.filter(recipe => 
        recipe.collections?.some(collection => 
          filterOptions.collections.includes(collection)
        )
      );
    }

    // Recently modified filter (last 7 days)
    if (filterOptions.recentlyModified) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      filtered = filtered.filter(recipe => 
        new Date(recipe.dateModified) >= sevenDaysAgo
      );
    }

    return filtered;
  }, [recipes, filterOptions]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    
    if (filterOptions.origins.length > 0) count++;
    if (filterOptions.brewingMethods.length > 0) count++;
    if (filterOptions.ratingRange.min > 1 || filterOptions.ratingRange.max < 10) count++;
    if (filterOptions.ratioRange.min > 1 || filterOptions.ratioRange.max < 30) count++;
    if (filterOptions.dateCreatedRange.start || filterOptions.dateCreatedRange.end) count++;
    if (filterOptions.dateModifiedRange.start || filterOptions.dateModifiedRange.end) count++;
    if (filterOptions.favoritesOnly) count++;
    if (filterOptions.collections.length > 0) count++;
    if (filterOptions.hasRating) count++;
    if (filterOptions.recentlyModified) count++;
    
    return count;
  }, [filterOptions]);

  // Filter setters
  const setOrigins = useCallback((origins: string[]) => {
    setFilterOptions(prev => ({ ...prev, origins }));
  }, []);

  const setBrewingMethods = useCallback((brewingMethods: string[]) => {
    setFilterOptions(prev => ({ ...prev, brewingMethods }));
  }, []);

  const setRatingRange = useCallback((ratingRange: { min: number; max: number }) => {
    setFilterOptions(prev => ({ ...prev, ratingRange }));
  }, []);

  const setRatioRange = useCallback((ratioRange: { min: number; max: number }) => {
    setFilterOptions(prev => ({ ...prev, ratioRange }));
  }, []);

  const setDateCreatedRange = useCallback((dateCreatedRange: { start: Date | null; end: Date | null }) => {
    setFilterOptions(prev => ({ ...prev, dateCreatedRange }));
  }, []);

  const setDateModifiedRange = useCallback((dateModifiedRange: { start: Date | null; end: Date | null }) => {
    setFilterOptions(prev => ({ ...prev, dateModifiedRange }));
  }, []);

  const setFavoritesOnly = useCallback((favoritesOnly: boolean) => {
    setFilterOptions(prev => ({ ...prev, favoritesOnly }));
  }, []);

  const setCollections = useCallback((collections: string[]) => {
    setFilterOptions(prev => ({ ...prev, collections }));
  }, []);

  const setHasRating = useCallback((hasRating: boolean) => {
    setFilterOptions(prev => ({ ...prev, hasRating }));
  }, []);

  const setRecentlyModified = useCallback((recentlyModified: boolean) => {
    setFilterOptions(prev => ({ ...prev, recentlyModified }));
  }, []);

  // Utility functions
  const clearAllFilters = useCallback(() => {
    setFilterOptions(DEFAULT_FILTERS);
  }, []);

  const resetFilters = useCallback(() => {
    clearAllFilters();
  }, [clearAllFilters]);

  const applyFilterPreset = useCallback((preset: Partial<FilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...preset }));
  }, []);

  const getFilterSummary = useCallback(() => {
    const summaryParts: string[] = [];
    
    if (filterOptions.origins.length > 0) {
      summaryParts.push(`Origins: ${filterOptions.origins.join(', ')}`);
    }
    if (filterOptions.brewingMethods.length > 0) {
      summaryParts.push(`Methods: ${filterOptions.brewingMethods.join(', ')}`);
    }
    if (filterOptions.ratingRange.min > 1 || filterOptions.ratingRange.max < 10) {
      summaryParts.push(`Rating: ${filterOptions.ratingRange.min}-${filterOptions.ratingRange.max}`);
    }
    if (filterOptions.favoritesOnly) {
      summaryParts.push('Favorites only');
    }
    if (filterOptions.recentlyModified) {
      summaryParts.push('Recently modified');
    }
    
    return summaryParts.length > 0 ? summaryParts.join(' • ') : 'No filters applied';
  }, [filterOptions]);

  return {
    filterOptions,
    filteredRecipes,
    activeFiltersCount,
    availableOptions,
    
    // Setters
    setOrigins,
    setBrewingMethods,
    setRatingRange,
    setRatioRange,
    setDateCreatedRange,
    setDateModifiedRange,
    setFavoritesOnly,
    setCollections,
    setHasRating,
    setRecentlyModified,
    
    // Utilities
    clearAllFilters,
    resetFilters,
    applyFilterPreset,
    getFilterSummary
  };
}

// Filter preset definitions
export const FILTER_PRESETS: Record<string, Partial<FilterOptions>> = {
  favorites: {
    favoritesOnly: true
  },
  highRated: {
    ratingRange: { min: 8, max: 10 }
  },
  recentlyAdded: {
    recentlyModified: true
  },
  espresso: {
    brewingMethods: ['espresso']
  },
  pourOver: {
    brewingMethods: ['pour_over', 'v60', 'chemex']
  }
};