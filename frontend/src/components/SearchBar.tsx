import { useState, useRef, useEffect } from 'react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  resultCount?: number;
  showShortcut?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search recipes by name, origin, tasting notes...",
  isLoading = false,
  resultCount,
  showShortcut = true,
  autoFocus = false,
  className = ""
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut to focus search (Ctrl+K)
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'k',
        ctrlKey: true,
        callback: (e) => {
          e.preventDefault();
          inputRef.current?.focus();
        },
        description: 'Focus search (Ctrl+K)'
      }
    ],
    enabled: true
  });

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  const handleClear = () => {
    onChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const hasValue = value.length > 0;
  const showResultCount = typeof resultCount === 'number' && hasValue;

  return (
    <div className={`relative ${className}`}>
      <div className={`relative flex items-center bg-white border rounded-lg transition-all duration-200 ${
        isFocused 
          ? 'border-blue-500 ring-2 ring-blue-100' 
          : 'border-gray-300 hover:border-gray-400'
      }`}>
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            <svg 
              className="w-4 h-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          )}
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-2.5 bg-transparent focus:outline-none text-gray-900 placeholder-gray-500"
        />

        {/* Right Side Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {/* Clear Button */}
          {hasValue && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Keyboard Shortcut Hint */}
          {showShortcut && !hasValue && !isFocused && (
            <div className="hidden sm:flex items-center space-x-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border">
              <span>⌘K</span>
            </div>
          )}
        </div>
      </div>

      {/* Search Results Count */}
      {showResultCount && (
        <div className="absolute top-full left-0 right-0 mt-1 px-3 py-1 bg-white border border-gray-200 rounded-md shadow-sm text-xs text-gray-600">
          {resultCount === 0 ? (
            <span>No recipes found</span>
          ) : (
            <span>
              {resultCount} recipe{resultCount !== 1 ? 's' : ''} found
            </span>
          )}
        </div>
      )}
    </div>
  );
}