import { useState } from 'react';
import { formatShortcut } from '../hooks/useKeyboardShortcuts';

interface ShortcutCategory {
  name: string;
  shortcuts: {
    keys: string;
    description: string;
    context?: string;
  }[];
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcutCategories: ShortcutCategory[] = [
  {
    name: 'General',
    shortcuts: [
      { keys: 'Ctrl+S', description: 'Save current form or data', context: 'Form editing' },
      { keys: 'Ctrl+N', description: 'Create new recipe', context: 'Any tab' },
      { keys: 'Ctrl+E', description: 'Export current view', context: 'Recipe list' },
      { keys: 'Ctrl+B', description: 'Open backup & restore', context: 'Any tab' },
      { keys: 'Ctrl+K', description: 'Focus search bar', context: 'Recipe list' },
      { keys: 'Ctrl+/', description: 'Show keyboard shortcuts', context: 'Any tab' },
      { keys: 'Escape', description: 'Close modal or cancel action', context: 'Modal/form' },
      { keys: 'F1', description: 'Show help and shortcuts', context: 'Any tab' },
    ]
  },
  {
    name: 'Navigation',
    shortcuts: [
      { keys: '1', description: 'Go to Recipe Input tab', context: 'Any tab' },
      { keys: '2', description: 'Go to Recipes tab', context: 'Any tab' },
      { keys: '3', description: 'Go to Favorites tab', context: 'Any tab' },
      { keys: '4', description: 'Go to Collections tab', context: 'Any tab' },
      { keys: 'Tab', description: 'Navigate between form fields', context: 'Form editing' },
      { keys: 'Shift+Tab', description: 'Navigate backwards between fields', context: 'Form editing' },
    ]
  },
  {
    name: 'Recipe Management',
    shortcuts: [
      { keys: 'Ctrl+Enter', description: 'Submit form quickly', context: 'Form editing' },
      { keys: 'Ctrl+Shift+C', description: 'Clone selected recipe', context: 'Recipe list' },
      { keys: 'Ctrl+Shift+S', description: 'Share selected recipe', context: 'Recipe detail' },
      { keys: 'F', description: 'Toggle favorite status', context: 'Recipe card/detail' },
      { keys: 'E', description: 'Edit recipe', context: 'Recipe card/detail' },
      { keys: 'Delete', description: 'Delete selected recipe(s)', context: 'Recipe list' },
      { keys: 'Ctrl+A', description: 'Select all recipes', context: 'Recipe list' },
      { keys: 'Ctrl+D', description: 'Deselect all recipes', context: 'Recipe list' },
    ]
  },
  {
    name: 'Search & Filter',
    shortcuts: [
      { keys: 'Ctrl+F', description: 'Focus search input', context: 'Recipe list' },
      { keys: 'Ctrl+Shift+F', description: 'Open advanced filters', context: 'Recipe list' },
      { keys: 'Ctrl+Shift+R', description: 'Clear all filters', context: 'Recipe list' },
      { keys: 'Enter', description: 'Apply search/filter', context: 'Search/filter' },
      { keys: 'Escape', description: 'Clear search', context: 'Search active' },
    ]
  },
  {
    name: 'Comparison & Analysis',
    shortcuts: [
      { keys: 'Ctrl+Shift+C', description: 'Compare selected recipes', context: '2+ recipes selected' },
      { keys: 'Ctrl+Shift+A', description: 'Open analytics dashboard', context: 'Any tab' },
      { keys: 'Ctrl+Shift+G', description: 'Open recipe suggestions', context: 'Any tab' },
      { keys: 'R', description: 'Refresh suggestions', context: 'Suggestions panel' },
    ]
  },
  {
    name: 'Theme & Display',
    shortcuts: [
      { keys: 'Ctrl+Shift+T', description: 'Toggle dark/light theme', context: 'Any tab' },
      { keys: 'Ctrl+Shift+L', description: 'Toggle list/grid view', context: 'Recipe list' },
      { keys: 'Ctrl++', description: 'Zoom in', context: 'Any tab' },
      { keys: 'Ctrl+-', description: 'Zoom out', context: 'Any tab' },
      { keys: 'Ctrl+0', description: 'Reset zoom', context: 'Any tab' },
    ]
  }
];

export default function KeyboardShortcutsModal({
  isOpen,
  onClose
}: KeyboardShortcutsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter shortcuts based on search term
  const filteredCategories = shortcutCategories.map(category => ({
    ...category,
    shortcuts: category.shortcuts.filter(shortcut =>
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.keys.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shortcut.context && shortcut.context.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(category => category.shortcuts.length > 0);

  const categoriesToShow = selectedCategory
    ? filteredCategories.filter(cat => cat.name === selectedCategory)
    : filteredCategories;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Master these shortcuts to become a power user
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search shortcuts..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="sm:w-48">
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {shortcutCategories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {categoriesToShow.length > 0 ? (
              <div className="space-y-8">
                {categoriesToShow.map((category, categoryIndex) => (
                  <div key={category.name}>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {categoryIndex + 1}
                        </span>
                      </div>
                      {category.name}
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {category.shortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {shortcut.description}
                            </div>
                            {shortcut.context && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {shortcut.context}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <kbd className="inline-flex items-center px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono text-gray-600 dark:text-gray-300">
                              {shortcut.keys}
                            </kbd>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No shortcuts found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search term or selecting a different category.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="font-medium">Pro tip:</span> Most shortcuts work globally, but some are context-specific.
              </div>
              <div className="flex items-center space-x-2">
                <kbd className="inline-flex items-center px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-xs font-mono text-gray-600 dark:text-gray-300">
                  Ctrl+/
                </kbd>
                <span className="text-sm text-gray-500 dark:text-gray-400">to open this menu anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}