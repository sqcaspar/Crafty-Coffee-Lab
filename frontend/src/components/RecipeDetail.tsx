import { useState, useEffect } from 'react';
import { Recipe, RoastingLevel, BrewingMethod } from '../shared/types/recipe';
import { recipeService } from '../services/recipeService';
import { exportService, ExportFormat } from '../services/exportService';
import { useToast } from './ui/ToastContainer';
import LoadingSpinner from './ui/LoadingSpinner';

interface RecipeDetailProps {
  recipeId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (recipeId: string) => void;
  onDelete?: (recipeId: string) => void;
}

// Helper functions for formatting display values
const formatBrewingMethod = (method: BrewingMethod | undefined): string => {
  if (!method) return 'Not specified';
  
  const methodMap: Record<BrewingMethod, string> = {
    [BrewingMethod.POUR_OVER]: 'Pour-over',
    [BrewingMethod.FRENCH_PRESS]: 'French Press',
    [BrewingMethod.AEROPRESS]: 'Aeropress',
    [BrewingMethod.COLD_BREW]: 'Cold Brew',
  };
  
  return methodMap[method] || 'Unknown';
};

const formatRoastingLevel = (level: RoastingLevel | undefined): string => {
  if (!level) return 'Not specified';
  
  const levelMap: Record<RoastingLevel, string> = {
    [RoastingLevel.LIGHT]: 'Light',
    [RoastingLevel.MEDIUM]: 'Medium',
    [RoastingLevel.DARK]: 'Dark',
    [RoastingLevel.CUSTOM]: 'Custom',
  };
  
  return levelMap[level] || 'Unknown';
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Not specified';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const calculateRatio = (coffeeBeans: number | undefined, water: number | undefined): string => {
  if (!coffeeBeans || !water || water === 0) return 'Not calculated';
  const ratio = water / coffeeBeans;
  return `1:${ratio.toFixed(1)}`;
};

const renderRatingScale = (rating: number | undefined, label: string): JSX.Element => {
  if (!rating) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{label}:</span>
        <span className="text-sm text-gray-400">Not rated</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <div className="w-20 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(rating / 10) * 100}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-900 w-8 text-right">
            {rating}/10
          </span>
        </div>
      </div>
    </div>
  );
};

export default function RecipeDetail({
  recipeId,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: RecipeDetailProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const { showSuccess, showError } = useToast();

  // Load recipe details when modal opens
  useEffect(() => {
    const loadRecipe = async () => {
      if (!recipeId || !isOpen) return;
      
      setLoading(true);
      setError(null);

      try {
        const response = await recipeService.getRecipe(recipeId);
        
        if (response.success && response.data) {
          setRecipe(response.data);
        } else {
          setError(response.error || 'Failed to load recipe details');
        }
      } catch (error) {
        console.error('Error loading recipe details:', error);
        setError('An unexpected error occurred while loading recipe details');
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [recipeId, isOpen]);

  // Handle delete action
  const handleDelete = async () => {
    if (!recipe) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${recipe.recipeName}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    setIsDeleting(true);
    
    try {
      const response = await recipeService.deleteRecipe(recipe.recipeId);
      
      if (response.success) {
        showSuccess('Recipe Deleted', 'Recipe has been permanently deleted');
        onDelete?.(recipe.recipeId);
        onClose();
      } else {
        showError('Failed to Delete', response.error || 'Please try again');
      }
    } catch (error) {
      showError('Failed to Delete', 'An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle recipe export
  const handleExport = async (format: ExportFormat) => {
    if (!recipe) return;

    setIsExporting(true);
    try {
      await exportService.exportSingleRecipe(recipe, {
        format,
        includeFullDetails: true
      });
      
      showSuccess('Export Complete', `Recipe exported as ${format.toUpperCase()}`);
    } catch (error) {
      showError('Export Failed', error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    if (!recipe) return;
    
    try {
      const newFavoriteStatus = !recipe.isFavorite;
      const response = await recipeService.toggleFavorite(recipe.recipeId, newFavoriteStatus);
      
      if (response.success) {
        setRecipe(prev => prev ? { ...prev, isFavorite: newFavoriteStatus } : null);
        showSuccess(
          'Recipe Updated',
          newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites'
        );
      } else {
        showError('Failed to Update', response.error || 'Please try again');
      }
    } catch (error) {
      showError('Failed to Update', 'An unexpected error occurred');
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Recipe Details</h2>
              {recipe && (
                <button
                  onClick={handleToggleFavorite}
                  className={`p-2 rounded-full transition-colors ${
                    recipe.isFavorite 
                      ? 'text-yellow-400 hover:text-yellow-500' 
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                  title={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {recipe && (
                <>
                  <div className="relative">
                    <button
                      onClick={() => handleExport(ExportFormat.PRINT)}
                      disabled={isExporting}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Print recipe"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </button>
                  </div>
                  <div className="relative group">
                    <button
                      disabled={isExporting}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Export recipe"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    {/* Export dropdown */}
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => handleExport(ExportFormat.PDF)}
                          disabled={isExporting}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span>Export as PDF</span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleExport(ExportFormat.CSV)}
                          disabled={isExporting}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Export as CSV</span>
                          </div>
                        </button>
                        <button
                          onClick={() => handleExport(ExportFormat.JSON)}
                          disabled={isExporting}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            <span>Export as JSON</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {recipe && onEdit && (
                <button
                  onClick={() => {
                    onEdit(recipe.recipeId);
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isDeleting}
                >
                  Edit Recipe
                </button>
              )}
              {recipe && onDelete && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                disabled={isDeleting}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="large" />
              <span className="ml-3 text-lg text-gray-600">Loading recipe details...</span>
            </div>
          )}

          {error && (
            <div className="p-6 text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  Failed to Load Recipe
                </h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          )}

          {recipe && (
            <div className="p-6 space-y-8">
              {/* Recipe Header */}
              <div className="text-center border-b border-gray-200 pb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {recipe.recipeName}
                </h1>
                <p className="text-gray-600">
                  Created {formatDate(recipe.dateCreated)}
                </p>
                {recipe.dateModified !== recipe.dateCreated && (
                  <p className="text-sm text-gray-500">
                    Last updated {formatDate(recipe.dateModified)}
                  </p>
                )}
              </div>

              {/* Bean Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bean Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Origin:</span>
                      <span className="text-sm text-gray-900">{recipe.beanInfo.origin || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Processing Method:</span>
                      <span className="text-sm text-gray-900">{recipe.beanInfo.processingMethod || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Altitude:</span>
                      <span className="text-sm text-gray-900">
                        {recipe.beanInfo.altitude ? `${recipe.beanInfo.altitude}m` : 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Roasting Date:</span>
                      <span className="text-sm text-gray-900">
                        {recipe.beanInfo.roastingDate 
                          ? new Date(recipe.beanInfo.roastingDate).toLocaleDateString() 
                          : 'Not specified'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Roasting Level:</span>
                      <span className="text-sm text-gray-900">
                        {formatRoastingLevel(recipe.beanInfo.roastingLevel)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brewing Parameters */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Brewing Parameters</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Water Temperature:</span>
                      <span className="text-sm text-gray-900">
                        {recipe.brewingParameters.waterTemperature ? `${recipe.brewingParameters.waterTemperature}°C` : 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Brewing Method:</span>
                      <span className="text-sm text-gray-900">
                        {formatBrewingMethod(recipe.brewingParameters.brewingMethod)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Grinder Model:</span>
                      <span className="text-sm text-gray-900">{recipe.brewingParameters.grinderModel || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Grinder Setting:</span>
                      <span className="text-sm text-gray-900">{recipe.brewingParameters.grinderUnit || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Filtering Tools:</span>
                      <span className="text-sm text-gray-900">{recipe.brewingParameters.filteringTools || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Turbulence:</span>
                      <span className="text-sm text-gray-900">{recipe.brewingParameters.turbulence || 'Not specified'}</span>
                    </div>
                  </div>
                  
                  {recipe.brewingParameters.additionalNotes && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-start justify-between">
                        <span className="text-sm font-medium text-gray-600">Additional Notes:</span>
                        <div className="max-w-md text-right">
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">
                            {recipe.brewingParameters.additionalNotes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Measurements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Measurements</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Coffee Beans:</span>
                      <span className="text-sm text-gray-900">
                        {recipe.measurements.coffeeBeans ? `${recipe.measurements.coffeeBeans}g` : 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Water:</span>
                      <span className="text-sm text-gray-900">
                        {recipe.measurements.water ? `${recipe.measurements.water}g` : 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Coffee-to-Water Ratio:</span>
                      <span className="text-sm font-semibold text-blue-600">
                        {calculateRatio(recipe.measurements.coffeeBeans, recipe.measurements.water)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">TDS:</span>
                      <span className="text-sm text-gray-900">
                        {recipe.measurements.tds ? `${recipe.measurements.tds}%` : 'Not measured'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Extraction Yield:</span>
                      <span className="text-sm text-gray-900">
                        {recipe.measurements.extractionYield ? `${recipe.measurements.extractionYield}%` : 'Not measured'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sensation Record */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sensation Record</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  {renderRatingScale(recipe.sensationRecord.overallImpression, 'Overall Impression')}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                    {renderRatingScale(recipe.sensationRecord.acidity, 'Acidity')}
                    {renderRatingScale(recipe.sensationRecord.body, 'Body')}
                    {renderRatingScale(recipe.sensationRecord.sweetness, 'Sweetness')}
                    {renderRatingScale(recipe.sensationRecord.flavor, 'Flavor')}
                    {renderRatingScale(recipe.sensationRecord.aftertaste, 'Aftertaste')}
                    {renderRatingScale(recipe.sensationRecord.balance, 'Balance')}
                  </div>
                  
                  {recipe.sensationRecord.tastingNotes && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-start justify-between">
                        <span className="text-sm font-medium text-gray-600">Tasting Notes:</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {recipe.sensationRecord.tastingNotes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}