import { useState, useEffect, useCallback, useRef } from 'react';
import { RecipeSummary } from '../../../shared/src/types/recipe';
import { recipeService } from '../services/recipeService';

interface UseSearchOptions {
  recipes: RecipeSummary[];
  debounceMs?: number;
  minSearchLength?: number;
  searchFields?: SearchField[];
  caseSensitive?: boolean;
  useServerSearch?: boolean; // Use server-side search API when available
}

interface UseSearchReturn {
  searchQuery: string;
  searchResults: RecipeSummary[];
  isSearching: boolean;
  isLoading: boolean;
  hasSearched: boolean;
  resultCount: number;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  highlightText: (text: string, query: string) => string;
}

interface SearchField {
  path: string;
  weight: number; // Higher weight = more important for ranking
}

const DEFAULT_SEARCH_FIELDS: SearchField[] = [
  { path: 'recipeName', weight: 10 },
  { path: 'origin', weight: 8 },
  { path: 'brewingMethod', weight: 6 },
  // Note: tasting notes would need to be added to RecipeSummary type for full text search
];

export function useSearch({
  recipes,
  debounceMs = 300,
  minSearchLength = 1,
  searchFields = DEFAULT_SEARCH_FIELDS,
  caseSensitive = false,
  useServerSearch = true
}: UseSearchOptions): UseSearchReturn {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<RecipeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Debounce search query
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, debounceMs]);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Clear results if query is too short
      if (debouncedQuery.length < minSearchLength) {
        setSearchResults([]);
        setHasSearched(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);
      
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        let results: RecipeSummary[];
        
        if (useServerSearch) {
          // Use server-side search API
          const response = await recipeService.searchRecipes(debouncedQuery, { timeout: 10000 });
          if (response.success && response.data) {
            results = response.data;
          } else {
            // Fallback to client-side search if server search fails
            console.warn('Server search failed, falling back to client-side:', response.error);
            results = performClientSideSearch(recipes, debouncedQuery, searchFields, caseSensitive);
          }
        } else {
          // Use client-side search
          results = performClientSideSearch(recipes, debouncedQuery, searchFields, caseSensitive);
        }
        
        if (!abortControllerRef.current.signal.aborted) {
          setSearchResults(results);
        }
      } catch (error) {
        if (!abortControllerRef.current?.signal.aborted) {
          console.error('Search error:', error);
          setSearchResults([]);
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    performSearch();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, recipes, minSearchLength, searchFields, caseSensitive]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setIsLoading(false);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const highlightText = useCallback((text: string, query: string): string => {
    if (!query || !text) return text;
    
    const regex = new RegExp(`(${escapeRegExp(query)})`, caseSensitive ? 'g' : 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>');
  }, [caseSensitive]);

  return {
    searchQuery,
    searchResults: hasSearched ? searchResults : recipes,
    isSearching: hasSearched,
    isLoading,
    hasSearched,
    resultCount: hasSearched ? searchResults.length : recipes.length,
    setSearchQuery,
    clearSearch,
    highlightText
  };
}

// Client-side search implementation
function performClientSideSearch(
  recipes: RecipeSummary[], 
  query: string, 
  searchFields: SearchField[],
  caseSensitive: boolean
): RecipeSummary[] {
  const searchTerm = caseSensitive ? query : query.toLowerCase();
  const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);

  const results = recipes
    .map(recipe => {
      let totalScore = 0;
      let hasMatch = false;

      searchFields.forEach(field => {
        const fieldValue = getNestedValue(recipe, field.path);
        if (fieldValue) {
          const value = caseSensitive ? String(fieldValue) : String(fieldValue).toLowerCase();
          
          searchWords.forEach(word => {
            if (value.includes(word)) {
              hasMatch = true;
              // Exact word match gets higher score
              const isExactWord = new RegExp(`\\b${escapeRegExp(word)}\\b`).test(value);
              const wordScore = isExactWord ? field.weight * 2 : field.weight;
              
              // Bonus for matches at the beginning
              const isAtStart = value.startsWith(word);
              const positionBonus = isAtStart ? field.weight * 0.5 : 0;
              
              totalScore += wordScore + positionBonus;
            }
          });
        }
      });

      return { recipe, score: totalScore, hasMatch };
    })
    .filter(item => item.hasMatch)
    .sort((a, b) => b.score - a.score)
    .map(item => item.recipe);

  return results;
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Helper function to escape regex special characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Hook for managing search history
export function useSearchHistory(maxItems: number = 10) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('coffeeTracker_searchHistory');
    if (saved) {
      try {
        setSearchHistory(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
  }, []);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim() || query.length < 2) return;

    setSearchHistory(prev => {
      const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, maxItems);
      localStorage.setItem('coffeeTracker_searchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  }, [maxItems]);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('coffeeTracker_searchHistory');
  }, []);

  return {
    searchHistory,
    addToHistory,
    clearHistory
  };
}