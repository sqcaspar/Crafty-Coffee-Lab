import { useEffect } from 'react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function UnsavedChangesModal({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
  isLoading = false
}: UnsavedChangesModalProps) {
  
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-yellow-800">
                Unsaved Changes
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-700 mb-4">
            You have unsaved changes to your recipe. What would you like to do?
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> You can use <kbd className="px-1 py-0.5 bg-blue-200 rounded text-xs">Ctrl+S</kbd> to quickly save your changes.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={isLoading}
            className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Discard Changes
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{isLoading ? 'Saving...' : 'Save & Continue'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}