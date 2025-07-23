import { useState, useEffect, useCallback } from 'react';
import { RecipeSummary } from '../../../shared/src/types/recipe';
import { recipeService } from '../services/recipeService';
import { useToast } from './ui/ToastContainer';
import { useSearch } from '../hooks/useSearch';
import { useFilters } from '../hooks/useFilters';
import RecipeCard from './RecipeCard';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import ExportModal from './ExportModal';
import ExportHistoryModal from './ExportHistoryModal';
import RecipeComparisonModal from './RecipeComparisonModal';
import { comparisonService } from '../services/comparisonService';
import LoadingSpinner from './ui/LoadingSpinner';

interface RecipeListProps {
  onEditRecipe?: (recipeId: string) => void;
  onViewRecipe?: (recipeId: string) => void;
  refreshTrigger?: number; // Used to trigger refresh from parent
}

type SortField = 'date' | 'name' | 'rating' | 'origin' | 'brewingMethod' | 'dateModified' | 'ratio';
type SortDirection = 'asc' | 'desc';

export default function RecipeList({ onEditRecipe, onViewRecipe, refreshTrigger }: RecipeListProps) {
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportHistoryModalOpen, setIsExportHistoryModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [comparisonCount, setComparisonCount] = useState(0);
  
  const { showSuccess, showError } = useToast();

  // Setup keyboard shortcuts for RecipeList
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'f',
        ctrlKey: true,
        callback: () => {
          // Focus the search input by dispatching a global focus event
          const searchInput = document.querySelector('input[placeholder*="Search recipes"]') as HTMLInputElement;
          searchInput?.focus();
        },
        description: 'Focus search input'
      },
      {
        key: 'k',
        ctrlKey: true,
        callback: () => {
          // Focus the search input by dispatching a global focus event
          const searchInput = document.querySelector('input[placeholder*="Search recipes"]') as HTMLInputElement;
          searchInput?.focus();
        },
        description: 'Focus search bar'
      },
      {
        key: 'f',
        ctrlKey: true,
        shiftKey: true,
        callback: () => {
          setIsFilterPanelOpen(true);
        },
        description: 'Open advanced filters'
      },
      {
        key: 'r',
        ctrlKey: true,
        shiftKey: true,
        callback: () => {
          filters.clearFilters();
          const searchInput = document.querySelector('input[placeholder*="Search recipes"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          }
        },
        description: 'Clear all filters'
      },
      {
        key: 'e',
        ctrlKey: true,
        callback: () => {
          setIsExportModalOpen(true);
        },
        description: 'Export current view'
      },
      {
        key: 'a',
        ctrlKey: true,
        callback: (e) => {
          e.preventDefault();
          const allRecipeIds = new Set(searchResults.map(r => r.recipeId));
          setSelectedRecipes(allRecipeIds);
        },
        description: 'Select all recipes'
      },
      {
        key: 'd',
        ctrlKey: true,
        callback: (e) => {
          e.preventDefault();
          setSelectedRecipes(new Set());
        },
        description: 'Deselect all recipes'
      },
      {
        key: 'c',
        ctrlKey: true,
        shiftKey: true,
        callback: () => {
          if (selectedRecipes.size >= 2) {
            setIsComparisonModalOpen(true);
          }
        },
        description: 'Compare selected recipes'
      }
    ]
  });

  // Initialize filtering functionality
  const filters = useFilters({
    recipes,
    persistFilters: true,
    storageKey: 'coffeeTracker_filters'
  });

  // Initialize search functionality (searches within filtered results)
  const {
    searchQuery,
    searchResults,
    isSearching,
    isLoading: isSearchLoading,
    resultCount,
    setSearchQuery,
    clearSearch,
    highlightText
  } = useSearch({
    recipes: filters.filteredRecipes, // Search within filtered recipes
    debounceMs: 300,
    minSearchLength: 1
  });

  // Update comparison count
  const updateComparisonCount = useCallback(() => {
    setComparisonCount(comparisonService.getComparisonCount());
  }, []);

  // Load recipes from API
  const loadRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await recipeService.getAllRecipes({}, { timeout: 10000, retries: 1 });
      
      if (response.success && response.data) {
        setRecipes(response.data);
      } else {
        setError(response.error || 'Failed to load recipes');
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      setError('An unexpected error occurred while loading recipes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load recipes on mount and when refresh is triggered
  useEffect(() => {
    loadRecipes();
    updateComparisonCount();
  }, [loadRecipes, refreshTrigger, updateComparisonCount]);

  // Sort recipes based on current sort settings (use search results if searching)
  const recipesToSort = isSearching ? searchResults : filters.filteredRecipes;
  const sortedRecipes = [...recipesToSort].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'date':
        comparison = new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
        break;
      case 'dateModified':
        comparison = new Date(a.dateModified).getTime() - new Date(b.dateModified).getTime();
        break;
      case 'name':
        comparison = a.recipeName.localeCompare(b.recipeName);
        break;
      case 'rating':
        const ratingA = a.overallImpression || 0;
        const ratingB = b.overallImpression || 0;
        comparison = ratingA - ratingB;
        break;
      case 'origin':
        comparison = (a.origin || '').localeCompare(b.origin || '');
        break;
      case 'brewingMethod':
        comparison = (a.brewingMethod || '').localeCompare(b.brewingMethod || '');
        break;
      case 'ratio':
        const ratioA = a.coffeeWaterRatio || 0;
        const ratioB = b.coffeeWaterRatio || 0;
        comparison = ratioA - ratioB;
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Handle sort change
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle recipe selection
  const handleRecipeSelect = (recipeId: string, selected: boolean) => {
    const newSelected = new Set(selectedRecipes);
    if (selected) {
      newSelected.add(recipeId);
    } else {
      newSelected.delete(recipeId);
    }
    setSelectedRecipes(newSelected);
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    if (selectedRecipes.size === sortedRecipes.length && sortedRecipes.length > 0) {
      setSelectedRecipes(new Set());
    } else {
      setSelectedRecipes(new Set(sortedRecipes.map(r => r.recipeId)));
    }
  };

  // Handle individual recipe actions
  const handleToggleFavorite = async (recipeId: string, isFavorite: boolean) => {
    try {
      const response = await recipeService.toggleFavorite(recipeId, isFavorite);
      
      if (response.success) {
        // Update local state optimistically
        setRecipes(prev => prev.map(recipe => 
          recipe.recipeId === recipeId 
            ? { ...recipe, isFavorite }
            : recipe
        ));
        
        showSuccess(
          'Recipe Updated',
          isFavorite ? 'Added to favorites' : 'Removed from favorites'
        );
      } else {
        showError('Failed to Update', response.error || 'Please try again');
      }
    } catch (error) {
      showError('Failed to Update', 'An unexpected error occurred');
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    try {
      const response = await recipeService.deleteRecipe(recipeId);
      
      if (response.success) {
        // Remove from local state
        setRecipes(prev => prev.filter(recipe => recipe.recipeId !== recipeId));
        setSelectedRecipes(prev => {
          const newSelected = new Set(prev);
          newSelected.delete(recipeId);
          return newSelected;
        });
        
        showSuccess('Recipe Deleted', 'Recipe has been permanently deleted');
      } else {
        showError('Failed to Delete', response.error || 'Please try again');
      }
    } catch (error) {
      showError('Failed to Delete', 'An unexpected error occurred');
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedRecipes.size === 0) return;
    
    const recipeIds = Array.from(selectedRecipes);
    const recipeNames = recipes
      .filter(r => selectedRecipes.has(r.recipeId))
      .map(r => r.recipeName)
      .join(', ');
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${recipeIds.length} recipe(s)?\n\n${recipeNames}\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      const response = await recipeService.batchDelete(recipeIds);
      
      if (response.success && response.data) {
        const { deleted, failed } = response.data;
        
        // Remove deleted recipes from local state
        setRecipes(prev => prev.filter(recipe => !deleted.includes(recipe.recipeId)));
        setSelectedRecipes(new Set());
        
        if (deleted.length > 0) {
          showSuccess(
            'Bulk Delete Complete',
            `${deleted.length} recipe(s) deleted successfully`
          );
        }
        
        if (failed.length > 0) {
          showError(
            'Some Deletions Failed',
            `${failed.length} recipe(s) could not be deleted`
          );
        }
      } else {
        showError('Bulk Delete Failed', response.error || 'Please try again');
      }
    } catch (error) {
      showError('Bulk Delete Failed', 'An unexpected error occurred');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="large" />
          <span className="ml-3 text-lg text-gray-600">Loading recipes...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Failed to Load Recipes
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadRecipes}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state for no recipes at all
  if (recipes.length === 0) {
    return (
      <div className="space-y-6">
        {/* Search bar (even with no recipes) */}
        <div className="bg-white rounded-lg shadow p-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={clearSearch}
            isLoading={isSearchLoading}
            resultCount={resultCount}
          />
        </div>

        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Recipes Found
              </h3>
              <p className="text-gray-600 mb-4">
                You haven't created any coffee brewing recipes yet.
              </p>
              <p className="text-sm text-gray-500">
                Switch to the Input tab to create your first recipe!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={clearSearch}
              isLoading={isSearchLoading}
              resultCount={resultCount}
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              title="Export all recipes"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">Export</span>
            </button>
            <button
              onClick={() => setIsExportHistoryModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="View export history"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">History</span>
            </button>
            <button
              onClick={() => setIsComparisonModalOpen(true)}
              className={`relative flex items-center space-x-2 px-4 py-2.5 border rounded-lg transition-colors ${
                comparisonCount > 0
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              title="View recipe comparison"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 002 2m0 0v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
              <span className="text-sm font-medium">Compare</span>
              {comparisonCount > 0 && (
                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-purple-600 rounded-full">
                  {comparisonCount}
                </span>
              )}
            </button>
          </div>
          <button
            onClick={() => setIsFilterPanelOpen(true)}
            className={`relative flex items-center space-x-2 px-4 py-2.5 border rounded-lg transition-colors ${
              filters.activeFiltersCount > 0
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            <span className="text-sm font-medium">Filters</span>
            {filters.activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                {filters.activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Empty search results state */}
      {isSearching && searchResults.length === 0 && !isSearchLoading && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Results Found
              </h3>
              <p className="text-gray-600 mb-4">
                No recipes match your search for "{searchQuery}"
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Try:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Different keywords or terms</li>
                  <li>• Checking for typos</li>
                  <li>• Using more general terms</li>
                  <li>• Searching by origin or brewing method</li>
                </ul>
              </div>
              <button
                onClick={clearSearch}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Clear Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content - only show if we have results or not searching */}
      {(!isSearching || searchResults.length > 0) && (
        <>
          {/* Header with sort controls and bulk actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {isSearching ? (
              <>Search Results ({resultCount})</>
            ) : filters.activeFiltersCount > 0 ? (
              <>Filtered Recipes ({filters.filteredRecipes.length} of {recipes.length})</>
            ) : (
              <>My Recipes ({recipes.length})</>
            )}
          </h2>
          
          {isSearching && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Searching for "{searchQuery}"
            </span>
          )}
          
          {!isSearching && filters.activeFiltersCount > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              {filters.activeFiltersCount} filter{filters.activeFiltersCount !== 1 ? 's' : ''} active
            </span>
          )}
          
          {selectedRecipes.size > 0 && (
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-sm text-gray-600">
                {selectedRecipes.size} selected
              </span>
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Export Selected
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Sort controls */}
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="text-sm text-gray-600 mr-2">Sort by:</span>
          <button
            onClick={() => handleSort('date')}
            className={`px-3 py-1 text-sm rounded ${
              sortField === 'date'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Created {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('dateModified')}
            className={`px-3 py-1 text-sm rounded ${
              sortField === 'dateModified'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Modified {sortField === 'dateModified' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('name')}
            className={`px-3 py-1 text-sm rounded ${
              sortField === 'name'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('rating')}
            className={`px-3 py-1 text-sm rounded ${
              sortField === 'rating'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rating {sortField === 'rating' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('origin')}
            className={`px-3 py-1 text-sm rounded ${
              sortField === 'origin'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Origin {sortField === 'origin' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSort('ratio')}
            className={`px-3 py-1 text-sm rounded ${
              sortField === 'ratio'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ratio {sortField === 'ratio' && (sortDirection === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Select all control */}
      {sortedRecipes.length > 1 && (
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedRecipes.size === sortedRecipes.length && sortedRecipes.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">
              Select all {isSearching ? 'search results' : 'recipes'}
            </span>
          </label>
        </div>
      )}

      {/* Recipe grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.recipeId}
            recipe={recipe}
            isSelected={selectedRecipes.has(recipe.recipeId)}
            onSelect={(selected) => handleRecipeSelect(recipe.recipeId, selected)}
            onEdit={() => onEditRecipe?.(recipe.recipeId)}
            onView={() => onViewRecipe?.(recipe.recipeId)}
            onToggleFavorite={(isFavorite) => handleToggleFavorite(recipe.recipeId, isFavorite)}
            onDelete={() => handleDeleteRecipe(recipe.recipeId)}
            searchQuery={isSearching ? searchQuery : undefined}
            highlightText={isSearching ? highlightText : undefined}
            onComparisonChange={updateComparisonCount}
            onCloneSuccess={loadRecipes}
          />
        ))}
      </div>
        </>
      )}

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        isOpen={isFilterPanelOpen}
        onToggle={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        recipes={isSearching ? searchResults : filters.filteredRecipes}
        selectedRecipes={selectedRecipes.size > 0 ? selectedRecipes : undefined}
        title={selectedRecipes.size > 0 ? "Export Selected Recipes" : "Export Recipes"}
      />

      {/* Export History Modal */}
      <ExportHistoryModal
        isOpen={isExportHistoryModalOpen}
        onClose={() => setIsExportHistoryModalOpen(false)}
      />

      {/* Recipe Comparison Modal */}
      <RecipeComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
      />
    </div>
  );
}