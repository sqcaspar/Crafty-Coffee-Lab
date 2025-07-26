import { useState, useEffect } from 'react';
import { RecipeSummary } from '../shared/types/recipe';
import { formatBrewingMethod, formatRelativeDate } from '../utils/recipeFormatters';
import { comparisonService } from '../services/comparisonService';
import { useToast } from './ui/ToastContainer';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import RecipeCloneModal from './RecipeCloneModal';
import RecipeSharingModal from './RecipeSharingModal';

interface RecipeCardProps {
  recipe: RecipeSummary;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onEdit: () => void;
  onToggleFavorite: (isFavorite: boolean) => void;
  onDelete: () => void;
  onView?: () => void;
  searchQuery?: string;
  highlightText?: (text: string, query: string) => string;
  onComparisonChange?: () => void;
  onCloneSuccess?: () => void;
}


// Helper function to render rating stars
const renderRating = (rating: number | undefined): JSX.Element => {
  if (!rating) {
    return <span className="text-gray-400 text-sm">No rating</span>;
  }
  
  const stars = Math.round(rating / 2); // Convert 1-10 to 1-5 stars
  const fullStars = Math.floor(stars);
  const halfStar = stars - fullStars > 0;
  
  return (
    <div className="flex items-center space-x-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-sm ${
              i < fullStars 
                ? 'text-yellow-400' 
                : i === fullStars && halfStar
                ? 'text-yellow-300'
                : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-sm text-gray-600">
        {rating}/10
      </span>
    </div>
  );
};

export default function RecipeCard({
  recipe,
  isSelected,
  onSelect,
  onEdit,
  onToggleFavorite,
  onDelete,
  onView,
  searchQuery,
  highlightText,
  onComparisonChange,
  onCloneSuccess
}: RecipeCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isInComparison, setIsInComparison] = useState(false);
  const [comparisonCount, setComparisonCount] = useState(0);
  const { showSuccess, showError, showInfo } = useToast();

  // Check if recipe is in comparison on mount and when comparison changes
  useEffect(() => {
    setIsInComparison(comparisonService.isInComparison(recipe.recipeId));
    setComparisonCount(comparisonService.getComparisonCount());
  }, [recipe.recipeId]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleComparisonToggle = () => {
    const wasInComparison = isInComparison;
    
    if (wasInComparison) {
      // Remove from comparison
      const success = comparisonService.removeFromComparison(recipe.recipeId);
      if (success) {
        setIsInComparison(false);
        setComparisonCount(comparisonService.getComparisonCount());
        showInfo('Comparison Updated', 'Recipe removed from comparison');
        onComparisonChange?.();
      }
    } else {
      // Add to comparison
      const success = comparisonService.addToComparison(recipe.recipeId);
      if (success) {
        setIsInComparison(true);
        setComparisonCount(comparisonService.getComparisonCount());
        showSuccess('Added to Comparison', `Recipe added to comparison (${comparisonCount + 1}/${comparisonService.getMaxComparisonItems()})`);
        onComparisonChange?.();
      } else {
        if (comparisonService.getComparisonCount() >= comparisonService.getMaxComparisonItems()) {
          showError('Comparison Full', `You can only compare up to ${comparisonService.getMaxComparisonItems()} recipes at once`);
        } else {
          showError('Error', 'Failed to add recipe to comparison');
        }
      }
    }
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      // Remove from comparison if it's being compared
      if (isInComparison) {
        comparisonService.removeFromComparison(recipe.recipeId);
        onComparisonChange?.();
      }
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(!recipe.isFavorite);
  };

  const handleCardClick = () => {
    if (onView) {
      onView();
    }
  };

  const coffeeRatio = recipe.coffeeWaterRatio ? `1:${recipe.coffeeWaterRatio.toFixed(1)}` : 'N/A';

  // Helper function to render text with highlighting
  const renderHighlightedText = (text: string) => {
    if (searchQuery && highlightText) {
      const highlighted = highlightText(text, searchQuery);
      return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
    }
    return text;
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all duration-200 cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
      } ${isDeleting ? 'opacity-50' : ''} ${
        isInComparison ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''
      }`}
      onClick={handleCardClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Selection checkbox */}
      <div className="absolute top-3 left-3 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(e.target.checked);
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Top right indicators */}
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
        {/* Comparison indicator */}
        {isInComparison && (
          <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-medium">
            In Comparison
          </div>
        )}
        
        {/* Favorite button */}
        <button
          onClick={handleToggleFavorite}
          className={`p-1 rounded-full transition-colors ${
            recipe.isFavorite 
              ? 'text-yellow-400 hover:text-yellow-500' 
              : 'text-gray-300 dark:text-gray-500 hover:text-yellow-400'
          }`}
          title={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      </div>

      <div className="p-6 pt-12">
        {/* Recipe header */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate mb-1">
            {renderHighlightedText(recipe.recipeName)}
          </h3>
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-2">
            <span>{renderHighlightedText(recipe.origin || 'Unknown origin')}</span>
            <span>•</span>
            <span>{renderHighlightedText(formatBrewingMethod(recipe.brewingMethod))}</span>
          </div>
        </div>

        {/* Recipe details */}
        <div className="space-y-3 mb-4">
          {/* Rating */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Overall Rating:</span>
            {renderRating(recipe.overallImpression)}
          </div>

          {/* Coffee ratio */}
          {coffeeRatio !== 'N/A' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Ratio:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{coffeeRatio}</span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatRelativeDate(recipe.dateCreated)}
            </span>
          </div>
        </div>

        {/* Brewing method badge */}
        {recipe.brewingMethod && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {formatBrewingMethod(recipe.brewingMethod)}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className={`transition-all duration-200 ${showActions || 'ontouchstart' in window ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                disabled={isDeleting}
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleComparisonToggle();
                }}
                className={`text-sm font-medium transition-colors ${
                  isInComparison 
                    ? 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
                disabled={isDeleting || (!isInComparison && comparisonCount >= comparisonService.getMaxComparisonItems())}
                title={isInComparison ? 'Remove from comparison' : 
                       comparisonCount >= comparisonService.getMaxComparisonItems() ? 
                       `Comparison full (${comparisonService.getMaxComparisonItems()} max)` : 
                       'Add to comparison'}
              >
                {isInComparison ? 'Remove' : 'Compare'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCloneModal(true);
                }}
                className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors"
                disabled={isDeleting}
                title="Clone this recipe"
              >
                Clone
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShareModal(true);
                }}
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                disabled={isDeleting}
                title="Share this recipe"
              >
                Share
              </button>
              {onView && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView();
                  }}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
                  disabled={isDeleting}
                >
                  View
                </button>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick();
              }}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
              disabled={isDeleting}
            >
              Delete
            </button>
          </div>
        </div>

        {/* Loading indicator for deletion */}
        {isDeleting && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              <span className="text-sm text-gray-600">Deleting...</span>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        recipe={recipe}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Recipe Clone Modal */}
      <RecipeCloneModal
        recipe={recipe}
        isOpen={showCloneModal}
        onClose={() => setShowCloneModal(false)}
        onCloneSuccess={() => {
          setShowCloneModal(false);
          onCloneSuccess?.();
        }}
      />

      {/* Recipe Sharing Modal */}
      <RecipeSharingModal
        recipe={recipe}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </div>
  );
}