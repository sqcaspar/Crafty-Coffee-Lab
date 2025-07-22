import { useState, useEffect } from 'react';
import { RecipeSummary } from '../../../shared/src/types/recipe';
import { ShareOptions, recipeSharingService } from '../services/recipeSharingService';
import { useToast } from './ui/ToastContainer';
import LoadingSpinner from './ui/LoadingSpinner';

interface RecipeSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: RecipeSummary | null;
}

export default function RecipeSharingModal({
  isOpen,
  onClose,
  recipe
}: RecipeSharingModalProps) {
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    includeRatings: true,
    includeTastingNotes: true,
    includePersonalNotes: false,
    format: 'markdown',
    customMessage: ''
  });
  
  const [isSharing, setIsSharing] = useState(false);
  const [shareMethod, setShareMethod] = useState<'clipboard' | 'url' | 'download'>('clipboard');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [shareHistory, setShareHistory] = useState<any[]>([]);

  const { showSuccess, showError, showInfo } = useToast();

  // Load share history on open
  useEffect(() => {
    if (isOpen) {
      const history = recipeSharingService.getShareHistory();
      setShareHistory(history.slice(0, 5)); // Show last 5 shares
    }
  }, [isOpen]);

  // Generate preview when options change
  useEffect(() => {
    if (isOpen && recipe && showPreview) {
      generatePreview();
    }
  }, [isOpen, recipe, shareOptions, showPreview]);

  const generatePreview = async () => {
    if (!recipe) return;
    
    try {
      const shareableRecipe = await recipeSharingService.createShareableRecipe(recipe.recipeId, shareOptions);
      if (shareableRecipe) {
        const formatted = recipeSharingService.formatForSharing(shareableRecipe, shareOptions.format, shareOptions.customMessage);
        setPreviewContent(formatted);
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
    }
  };

  const handleShare = async () => {
    if (!recipe) return;

    setIsSharing(true);
    try {
      const result = await recipeSharingService.shareRecipe(recipe.recipeId, shareMethod, shareOptions);
      
      if (result.success) {
        showSuccess('Recipe Shared!', result.message || 'Recipe shared successfully');
        
        // Refresh share history
        const history = recipeSharingService.getShareHistory();
        setShareHistory(history.slice(0, 5));

        // Close modal after successful share
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        showError('Share Failed', result.message || 'Failed to share recipe');
      }
    } catch (error) {
      console.error('Share error:', error);
      showError('Share Failed', 'An unexpected error occurred');
    } finally {
      setIsSharing(false);
    }
  };

  if (!isOpen || !recipe) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-6 py-6 shadow-xl transition-all w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Share Recipe
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Share "{recipe.recipeName}" with others
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSharing}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Options */}
            <div className="space-y-6">
              {/* Share Method */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Share Method
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { 
                      value: 'clipboard', 
                      label: 'Copy to Clipboard', 
                      icon: '📋',
                      description: 'Copy formatted recipe to your clipboard'
                    },
                    { 
                      value: 'url', 
                      label: 'Generate Share Link', 
                      icon: '🔗',
                      description: 'Create a shareable URL (copied to clipboard)'
                    },
                    { 
                      value: 'download', 
                      label: 'Download File', 
                      icon: '💾',
                      description: 'Download recipe as a file'
                    }
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        shareMethod === method.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shareMethod"
                        value={method.value}
                        checked={shareMethod === method.value}
                        onChange={(e) => setShareMethod(e.target.value as any)}
                        className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        disabled={isSharing}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{method.icon}</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {method.label}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {method.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Format Options */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'markdown', label: 'Markdown', icon: '📝' },
                    { value: 'text', label: 'Plain Text', icon: '📄' },
                    { value: 'json', label: 'JSON', icon: '⚙️' },
                    { value: 'url', label: 'Share Link', icon: '🔗' }
                  ].map((format) => (
                    <label
                      key={format.value}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        shareOptions.format === format.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'
                      }`}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={format.value}
                        checked={shareOptions.format === format.value}
                        onChange={(e) => setShareOptions(prev => ({ ...prev, format: e.target.value as any }))}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        disabled={isSharing}
                      />
                      <span className="text-lg">{format.icon}</span>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {format.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Content Options */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Include in Share
                </label>
                <div className="space-y-3">
                  {[
                    { 
                      key: 'includeRatings', 
                      label: 'Ratings & Scores',
                      description: 'Include taste ratings and overall impression'
                    },
                    { 
                      key: 'includeTastingNotes', 
                      label: 'Tasting Notes',
                      description: 'Include detailed flavor descriptions'
                    },
                    { 
                      key: 'includePersonalNotes', 
                      label: 'Personal Notes',
                      description: 'Include private brewing notes'
                    }
                  ].map((option) => (
                    <label key={option.key} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={shareOptions[option.key as keyof ShareOptions] as boolean}
                        onChange={(e) => setShareOptions(prev => ({ ...prev, [option.key]: e.target.checked }))}
                        className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        disabled={isSharing}
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={shareOptions.customMessage}
                  onChange={(e) => setShareOptions(prev => ({ ...prev, customMessage: e.target.value }))}
                  placeholder="Add a personal message to include with your recipe..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                  disabled={isSharing}
                />
              </div>

              {/* Share History */}
              {shareHistory.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Recent Shares
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {shareHistory.map((share, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded text-sm">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {share.recipeName}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400 ml-2">
                            via {share.method}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(share.sharedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-4">
              {/* Preview Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Preview
                </label>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  disabled={isSharing}
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>

              {/* Preview Content */}
              {showPreview && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {shareOptions.format.toUpperCase()} Preview
                      </span>
                      <button
                        onClick={() => navigator.clipboard?.writeText(previewContent)}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        title="Copy preview to clipboard"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <pre className="text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                      {previewContent}
                    </pre>
                  </div>
                </div>
              )}

              {/* Recipe Summary */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Recipe Summary
                </h3>
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <div>📍 Origin: {recipe.origin || 'Not specified'}</div>
                  <div>☕ Method: {recipe.brewingMethod?.replace('_', ' ') || 'Not specified'}</div>
                  {recipe.overallImpression && (
                    <div>⭐ Rating: {recipe.overallImpression}/10</div>
                  )}
                  {recipe.coffeeWaterRatio && (
                    <div>⚖️ Ratio: 1:{recipe.coffeeWaterRatio.toFixed(1)}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={isSharing}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSharing && <LoadingSpinner size="small" color="white" />}
              <span>
                {isSharing ? 'Sharing...' : 
                 shareMethod === 'clipboard' ? 'Copy to Clipboard' :
                 shareMethod === 'url' ? 'Generate Link' :
                 'Download File'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}