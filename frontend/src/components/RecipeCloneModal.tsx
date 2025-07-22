import { useState, useEffect } from 'react';
import { Recipe, RecipeSummary } from '../../../shared/src/types/recipe';
import { 
  recipeCloneService, 
  CloneOptions, 
  CloneTemplate, 
  CLONE_TEMPLATES 
} from '../services/recipeCloneService';
import { comparisonService } from '../services/comparisonService';
import { useToast } from './ui/ToastContainer';
import LoadingSpinner from './ui/LoadingSpinner';

interface RecipeCloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: RecipeSummary | Recipe | null;
  onCloneSuccess?: (clonedRecipe: Recipe) => void;
  onCloneCreated?: () => void;
}

export default function RecipeCloneModal({ 
  isOpen, 
  onClose, 
  recipe, 
  onCloneSuccess,
  onCloneCreated 
}: RecipeCloneModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CloneTemplate | null>(null);
  const [customName, setCustomName] = useState('');
  const [cloneOptions, setCloneOptions] = useState<CloneOptions>({
    addSuffix: true,
    suffixPattern: 'Copy',
    preserveCollections: true,
    preserveRatings: true,
    preserveFavorite: false,
    addToComparison: false
  });
  const [isCloning, setIsCloning] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [recentClones, setRecentClones] = useState<any[]>([]);
  const [suggestedTemplate, setSuggestedTemplate] = useState<CloneTemplate | null>(null);

  const { showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    if (isOpen && recipe) {
      // Load recent clones
      setRecentClones(recipeCloneService.getRecentClones());
      
      // Suggest template based on recipe characteristics
      if ('sensationRecord' in recipe) {
        const suggestion = recipeCloneService.suggestTemplate(recipe as Recipe);
        setSuggestedTemplate(suggestion);
        if (suggestion) {
          setSelectedTemplate(suggestion);
          setCloneOptions({ ...suggestion.options });
        }
      }
      
      // Reset form
      setCustomName('');
      setShowAdvanced(false);
    }
  }, [isOpen, recipe]);

  const handleTemplateSelect = (template: CloneTemplate | null) => {
    setSelectedTemplate(template);
    if (template) {
      setCloneOptions({ ...template.options });
    } else {
      // Reset to default options
      setCloneOptions({
        addSuffix: true,
        suffixPattern: 'Copy',
        preserveCollections: true,
        preserveRatings: true,
        preserveFavorite: false,
        addToComparison: false
      });
    }
  };

  const handleClone = async () => {
    if (!recipe) return;

    setIsCloning(true);
    try {
      const options: CloneOptions = {
        ...cloneOptions,
        newName: customName.trim() || undefined
      };

      const result = await recipeCloneService.cloneRecipe(
        recipe.recipeId,
        options,
        selectedTemplate || undefined
      );

      if (result.success && result.data) {
        // Add to comparison if requested
        if (options.addToComparison) {
          const added = comparisonService.addToComparison(result.data.recipeId);
          if (added) {
            showInfo('Added to Comparison', 'Cloned recipe added to comparison list');
          }
        }

        showSuccess(
          'Recipe Cloned Successfully!',
          `"${result.data.recipeName}" has been created as a new recipe.`
        );

        onCloneSuccess?.(result.data);
        onCloneCreated?.();
        onClose();
      } else {
        showError('Clone Failed', result.error || 'Failed to clone recipe');
      }
    } catch (error) {
      showError('Clone Failed', 'An unexpected error occurred');
    } finally {
      setIsCloning(false);
    }
  };

  const getPreviewName = (): string => {
    if (customName.trim()) {
      return customName.trim();
    }
    
    if (!recipe) return '';
    
    if (cloneOptions.addSuffix) {
      const suffix = cloneOptions.suffixPattern || 'Copy';
      const timestamp = new Date().toISOString().slice(0, 10);
      return `${recipe.recipeName} ${suffix} (${timestamp})`;
    }
    
    return `${recipe.recipeName} - Clone`;
  };

  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-6 py-6 shadow-xl transition-all w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Clone Recipe
            </h2>
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCloning}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Original Recipe Info */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                  {recipe.recipeName}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Original recipe • Created {new Date(recipe.dateCreated).toLocaleDateString()}
                </p>
                {suggestedTemplate && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    💡 Suggested: {suggestedTemplate.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Clone Templates */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Clone Template
            </h3>
            <div className="space-y-3">
              {/* Custom/No Template Option */}
              <label className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                !selectedTemplate
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
              }`}>
                <input
                  type="radio"
                  name="template"
                  checked={!selectedTemplate}
                  onChange={() => handleTemplateSelect(null)}
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  disabled={isCloning}
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Custom Clone
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Create a custom clone with your own settings
                  </div>
                </div>
              </label>

              {/* Template Options */}
              {CLONE_TEMPLATES.map((template) => (
                <label
                  key={template.id}
                  className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                  }`}
                >
                  <input
                    type="radio"
                    name="template"
                    checked={selectedTemplate?.id === template.id}
                    onChange={() => handleTemplateSelect(template)}
                    className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={isCloning}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </div>
                      {suggestedTemplate?.id === template.id && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full">
                          Suggested
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {template.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Clone Settings */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Clone Settings
            </h3>

            {/* Custom Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                Recipe Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={getPreviewName()}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isCloning}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Preview: "{getPreviewName()}"
              </p>
            </div>

            {/* Quick Options */}
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={cloneOptions.preserveCollections || false}
                  onChange={(e) => setCloneOptions(prev => ({ ...prev, preserveCollections: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isCloning}
                />
                <span className="text-sm text-gray-900 dark:text-white">Preserve collections</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={cloneOptions.preserveRatings || false}
                  onChange={(e) => setCloneOptions(prev => ({ ...prev, preserveRatings: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isCloning}
                />
                <span className="text-sm text-gray-900 dark:text-white">Keep tasting notes and ratings</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={cloneOptions.addToComparison || false}
                  onChange={(e) => setCloneOptions(prev => ({ ...prev, addToComparison: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isCloning || comparisonService.getComparisonCount() >= comparisonService.getMaxComparisonItems()}
                />
                <span className={`text-sm ${
                  comparisonService.getComparisonCount() >= comparisonService.getMaxComparisonItems()
                    ? 'text-gray-400 dark:text-gray-500'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  Add clone to comparison
                  {comparisonService.getComparisonCount() >= comparisonService.getMaxComparisonItems() && 
                    ' (comparison full)'}
                </span>
              </label>
            </div>

            {/* Advanced Options Toggle */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                disabled={isCloning}
              >
                <svg className={`w-4 h-4 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>Advanced Options</span>
              </button>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Name Suffix Pattern
                  </label>
                  <input
                    type="text"
                    value={cloneOptions.suffixPattern || ''}
                    onChange={(e) => setCloneOptions(prev => ({ ...prev, suffixPattern: e.target.value }))}
                    placeholder="Copy"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    disabled={isCloning}
                  />
                </div>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={cloneOptions.preserveFavorite || false}
                    onChange={(e) => setCloneOptions(prev => ({ ...prev, preserveFavorite: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isCloning}
                  />
                  <span className="text-sm text-gray-900 dark:text-white">Clone as favorite</span>
                </label>
              </div>
            )}
          </div>

          {/* Recent Clones */}
          {recentClones.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Recent Clones
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-2">
                {recentClones.slice(0, 5).map((clone, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                    <div>
                      <span className="text-gray-900 dark:text-white">{clone.cloneName}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        from "{clone.originalName}"
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(clone.clonedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isCloning}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleClone}
              disabled={isCloning || !recipe}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCloning ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="small" />
                  <span>Cloning...</span>
                </div>
              ) : (
                'Create Clone'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}