import { useState, useEffect, useCallback } from 'react';
import { RecipeSuggestion, recipeSuggestionService } from '../services/recipeSuggestionService';
import { recipeService } from '../services/recipeService';
import { useToast } from './ui/ToastContainer';
import LoadingSpinner from './ui/LoadingSpinner';
import RecipeCloneModal from './RecipeCloneModal';

interface RecipeSuggestionsPanelProps {
  onCreateRecipe?: () => void;
  onEditRecipe?: (recipeId: string) => void;
  refreshTrigger?: number;
}

export default function RecipeSuggestionsPanel({ 
  onCreateRecipe, 
  onEditRecipe,
  refreshTrigger 
}: RecipeSuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<RecipeSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<RecipeSuggestion | null>(null);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [relatedRecipe, setRelatedRecipe] = useState<any>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  const { showSuccess, showInfo, showError } = useToast();

  // Load suggestions
  const loadSuggestions = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await recipeSuggestionService.generateSuggestions(forceRefresh);
      setSuggestions(result.filter(s => !dismissedSuggestions.has(s.id)));
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      showError('Error', 'Failed to load recipe suggestions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dismissedSuggestions, showError]);

  // Load suggestions on mount and when refresh is triggered
  useEffect(() => {
    // First, try to load from cache
    const cached = recipeSuggestionService.loadCachedSuggestions();
    if (cached.length > 0) {
      setSuggestions(cached.filter(s => !dismissedSuggestions.has(s.id)));
      setLoading(false);
    }
    
    // Then load fresh suggestions
    loadSuggestions();
  }, [loadSuggestions, refreshTrigger]);

  // Load dismissed suggestions from localStorage
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('coffeeTracker_dismissedSuggestions');
      if (dismissed) {
        setDismissedSuggestions(new Set(JSON.parse(dismissed)));
      }
    } catch (e) {
      console.warn('Failed to load dismissed suggestions:', e);
    }
  }, []);

  // Handle suggestion actions
  const handleSuggestionAction = async (suggestion: RecipeSuggestion) => {
    setSelectedSuggestion(suggestion);

    if (suggestion.relatedRecipeId && (suggestion.type === 'clone_template' || suggestion.type === 'improvement')) {
      // Load the related recipe for cloning or editing
      try {
        const response = await recipeService.getRecipe(suggestion.relatedRecipeId);
        if (response.success && response.data) {
          setRelatedRecipe(response.data);
          if (suggestion.type === 'clone_template') {
            setShowCloneModal(true);
          } else {
            // For improvements, navigate to edit mode
            onEditRecipe?.(suggestion.relatedRecipeId);
          }
        } else {
          showError('Error', 'Could not load related recipe');
        }
      } catch (error) {
        showError('Error', 'Failed to load recipe details');
      }
    } else if (suggestion.type === 'new_recipe') {
      // Navigate to create new recipe
      onCreateRecipe?.();
    } else {
      // Generic action - show info
      showInfo(
        suggestion.title,
        `${suggestion.description} ${suggestion.actionable ? 'Click the action button to proceed.' : ''}`
      );
    }
  };

  // Dismiss a suggestion
  const dismissSuggestion = (suggestionId: string) => {
    const newDismissed = new Set(dismissedSuggestions);
    newDismissed.add(suggestionId);
    setDismissedSuggestions(newDismissed);

    // Update localStorage
    try {
      localStorage.setItem('coffeeTracker_dismissedSuggestions', JSON.stringify([...newDismissed]));
    } catch (e) {
      console.warn('Failed to save dismissed suggestions:', e);
    }

    // Remove from current suggestions
    setSuggestions(suggestions.filter(s => s.id !== suggestionId));
  };

  // Clear all dismissed suggestions
  const clearDismissed = () => {
    setDismissedSuggestions(new Set());
    localStorage.removeItem('coffeeTracker_dismissedSuggestions');
    loadSuggestions(true); // Reload with fresh suggestions
  };

  // Get icon for suggestion category
  const getCategoryIcon = (category: string) => {
    const iconClass = "w-5 h-5";
    switch (category) {
      case 'brewing_method':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V5L8 4z" />
        </svg>;
      case 'grind_size':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>;
      case 'ratio':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>;
      case 'temperature':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>;
      case 'origin':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
      case 'timing':
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>;
      default:
        return <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Suggestions Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Create a few more recipes with ratings to get personalized suggestions for improvements and variations.
        </p>
        {dismissedSuggestions.size > 0 && (
          <button
            onClick={clearDismissed}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Show dismissed suggestions
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recipe Suggestions
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Personalized recommendations based on your brewing patterns
          </p>
        </div>
        <button
          onClick={() => loadSuggestions(true)}
          disabled={refreshing}
          className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {refreshing ? (
            <>
              <LoadingSpinner size="small" color="white" />
              <span className="ml-2">Refreshing...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={`rounded-lg border p-6 transition-all hover:shadow-md ${getPriorityColor(suggestion.priority)}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${
                  suggestion.priority === 'high' 
                    ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400'
                    : suggestion.priority === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400'
                    : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                }`}>
                  {getCategoryIcon(suggestion.category)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {suggestion.title}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      suggestion.priority === 'high'
                        ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                        : suggestion.priority === 'medium'
                        ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                        : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    }`}>
                      {suggestion.priority} priority
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => dismissSuggestion(suggestion.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                title="Dismiss suggestion"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {suggestion.description}
            </p>

            {/* Suggested Changes */}
            {suggestion.suggestedChanges && suggestion.suggestedChanges.length > 0 && (
              <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Suggested Changes:
                </h4>
                <div className="space-y-2">
                  {suggestion.suggestedChanges.slice(0, 2).map((change, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {change.parameter}:
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-1">
                        {change.currentValue} → {change.suggestedValue}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {change.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {suggestion.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Impact:</span> {suggestion.estimatedImpact}
              </div>
              {suggestion.actionable && (
                <button
                  onClick={() => handleSuggestionAction(suggestion)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    suggestion.priority === 'high'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : suggestion.priority === 'medium'
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {suggestion.type === 'clone_template' ? 'Clone Recipe' :
                   suggestion.type === 'improvement' ? 'Edit Recipe' :
                   suggestion.type === 'new_recipe' ? 'Create Recipe' : 'Try It'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Clone Modal */}
      {showCloneModal && relatedRecipe && (
        <RecipeCloneModal
          recipe={relatedRecipe}
          isOpen={showCloneModal}
          onClose={() => {
            setShowCloneModal(false);
            setRelatedRecipe(null);
            setSelectedSuggestion(null);
          }}
          onCloneSuccess={() => {
            setShowCloneModal(false);
            setRelatedRecipe(null);
            setSelectedSuggestion(null);
            showSuccess('Recipe Cloned!', 'Your recipe has been cloned successfully. You can now experiment with the suggested changes.');
          }}
        />
      )}
    </div>
  );
}