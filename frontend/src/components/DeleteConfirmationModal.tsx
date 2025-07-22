import { useState } from 'react';
import { RecipeSummary } from '../../../shared/src/types/recipe';
import { formatBrewingMethod } from '../utils/recipeFormatters';
import LoadingSpinner from './ui/LoadingSpinner';

interface DeleteConfirmationModalProps {
  recipe: RecipeSummary | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (recipeId: string) => Promise<void>;
  title?: string;
  warning?: string;
  isBulkDelete?: boolean;
  selectedCount?: number;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function DeleteConfirmationModal({
  recipe,
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Recipe",
  warning = "This action cannot be undone.",
  isBulkDelete = false,
  selectedCount = 0
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!recipe) return;
    
    setIsDeleting(true);
    try {
      await onConfirm(recipe.recipeId);
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Delete operation failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  // Handle escape key
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && !isDeleting) {
      onClose();
    }
  };

  if (!isOpen || !recipe) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-red-50 px-6 py-4 border-b border-red-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-red-800">
                {isBulkDelete ? `Delete ${selectedCount} Recipe${selectedCount !== 1 ? 's' : ''}` : title}
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {isBulkDelete ? (
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{selectedCount}</span> selected recipe{selectedCount !== 1 ? 's' : ''}?
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> {warning}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete this recipe?
              </p>
              
              {/* Recipe Details Card */}
              <div className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-coffee-brown rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.5 4a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2a.5.5 0 01.5-.5h2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                      {recipe.recipeName}
                    </h4>
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Origin:</span>
                        <span className="ml-1">{recipe.origin}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Method:</span>
                        <span className="ml-1">{formatBrewingMethod(recipe.brewingMethod)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Rating:</span>
                        <span className="ml-1">{recipe.overallImpression}/10</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Created:</span>
                        <span className="ml-1">{formatDate(recipe.dateCreated)}</span>
                      </div>
                      {recipe.collections && recipe.collections.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium">Collections:</span>
                          <span className="ml-1">{recipe.collections.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Collection Warning */}
              {recipe.collections && recipe.collections.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This recipe is part of {recipe.collections.length} collection{recipe.collections.length !== 1 ? 's' : ''} ({recipe.collections.join(', ')}). Deleting it will remove it from all collections.
                  </p>
                </div>
              )}

              {/* Warning */}
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> {warning}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isDeleting && <LoadingSpinner size="small" color="white" />}
            <span>
              {isDeleting 
                ? (isBulkDelete ? 'Deleting...' : 'Deleting...') 
                : (isBulkDelete ? `Delete ${selectedCount} Recipe${selectedCount !== 1 ? 's' : ''}` : 'Delete Recipe')
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}