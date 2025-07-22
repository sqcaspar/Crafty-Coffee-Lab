import { useState, useRef, useEffect } from 'react';
import { UseFiltersReturn } from '../hooks/useFilters';

interface FilterPanelProps {
  filters: UseFiltersReturn;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export default function FilterPanel({ filters, isOpen, onToggle, className = '' }: FilterPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['brewing', 'rating']));
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) && isOpen) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleOriginToggle = (origin: string) => {
    const newOrigins = filters.filterOptions.origins.includes(origin)
      ? filters.filterOptions.origins.filter((o: string) => o !== origin)
      : [...filters.filterOptions.origins, origin];
    filters.setOrigins(newOrigins);
  };

  const handleBrewingMethodToggle = (method: string) => {
    const newMethods = filters.filterOptions.brewingMethods.includes(method)
      ? filters.filterOptions.brewingMethods.filter((m: string) => m !== method)
      : [...filters.filterOptions.brewingMethods, method];
    filters.setBrewingMethods(newMethods);
  };

  const handleCollectionToggle = (collection: string) => {
    const newCollections = filters.filterOptions.collections.includes(collection)
      ? filters.filterOptions.collections.filter((c: string) => c !== collection)
      : [...filters.filterOptions.collections, collection];
    filters.setCollections(newCollections);
  };

  const formatBrewingMethod = (method: string) => {
    return method.split('_').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 ${className}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-25" onClick={onToggle} />
      
      {/* Panel */}
      <div 
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            {filters.activeFiltersCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {filters.activeFiltersCount} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {filters.activeFiltersCount > 0 && (
              <button
                onClick={filters.clearAllFilters}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Summary */}
        {filters.activeFiltersCount > 0 && (
          <div className="px-6 py-3 bg-blue-50 border-b border-gray-200">
            <p className="text-sm text-blue-800">{filters.getFilterSummary()}</p>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Quick Toggles */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Quick Filters</h3>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.filterOptions.favoritesOnly}
                  onChange={(e) => filters.setFavoritesOnly(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Favorites only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.filterOptions.hasRating}
                  onChange={(e) => filters.setHasRating(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Has rating</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.filterOptions.recentlyModified}
                  onChange={(e) => filters.setRecentlyModified(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Recently modified (7 days)</span>
              </label>
            </div>
          </div>

          {/* Rating Range Filter */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('rating')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-sm font-medium text-gray-900">Rating Range</h3>
              <svg 
                className={`w-4 h-4 text-gray-500 transform transition-transform ${
                  expandedSections.has('rating') ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.has('rating') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{filters.filterOptions.ratingRange.min}</span>
                  <span>{filters.filterOptions.ratingRange.max}</span>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Min Rating:</label>
                  <input
                    type="range"
                    min={filters.availableOptions.ratingRange.min}
                    max={filters.availableOptions.ratingRange.max}
                    value={filters.filterOptions.ratingRange.min}
                    onChange={(e) => filters.setRatingRange({
                      ...filters.filterOptions.ratingRange,
                      min: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Max Rating:</label>
                  <input
                    type="range"
                    min={filters.availableOptions.ratingRange.min}
                    max={filters.availableOptions.ratingRange.max}
                    value={filters.filterOptions.ratingRange.max}
                    onChange={(e) => filters.setRatingRange({
                      ...filters.filterOptions.ratingRange,
                      max: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Brewing Methods Filter */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('brewing')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-sm font-medium text-gray-900">Brewing Methods</h3>
              <svg 
                className={`w-4 h-4 text-gray-500 transform transition-transform ${
                  expandedSections.has('brewing') ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.has('brewing') && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filters.availableOptions.brewingMethods.map((method: string) => (
                  <label key={method} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.filterOptions.brewingMethods.includes(method)}
                      onChange={() => handleBrewingMethodToggle(method)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {formatBrewingMethod(method)}
                    </span>
                  </label>
                ))}
                {filters.availableOptions.brewingMethods.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No brewing methods found</p>
                )}
              </div>
            )}
          </div>

          {/* Origins Filter */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('origins')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-sm font-medium text-gray-900">Origins</h3>
              <svg 
                className={`w-4 h-4 text-gray-500 transform transition-transform ${
                  expandedSections.has('origins') ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.has('origins') && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filters.availableOptions.origins.map((origin: string) => (
                  <label key={origin} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.filterOptions.origins.includes(origin)}
                      onChange={() => handleOriginToggle(origin)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{origin}</span>
                  </label>
                ))}
                {filters.availableOptions.origins.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No origins found</p>
                )}
              </div>
            )}
          </div>

          {/* Collections Filter */}
          {filters.availableOptions.collections.length > 0 && (
            <div className="space-y-3">
              <button
                onClick={() => toggleSection('collections')}
                className="flex items-center justify-between w-full text-left"
              >
                <h3 className="text-sm font-medium text-gray-900">Collections</h3>
                <svg 
                  className={`w-4 h-4 text-gray-500 transform transition-transform ${
                    expandedSections.has('collections') ? 'rotate-180' : ''
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSections.has('collections') && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filters.availableOptions.collections.map((collection: string) => (
                    <label key={collection} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.filterOptions.collections.includes(collection)}
                        onChange={() => handleCollectionToggle(collection)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{collection}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Coffee Ratio Range Filter */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('ratio')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-sm font-medium text-gray-900">Coffee Ratio Range</h3>
              <svg 
                className={`w-4 h-4 text-gray-500 transform transition-transform ${
                  expandedSections.has('ratio') ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.has('ratio') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>1:{filters.filterOptions.ratioRange.min}</span>
                  <span>1:{filters.filterOptions.ratioRange.max}</span>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Min Ratio:</label>
                  <input
                    type="range"
                    min={filters.availableOptions.ratioRange.min}
                    max={filters.availableOptions.ratioRange.max}
                    value={filters.filterOptions.ratioRange.min}
                    onChange={(e) => filters.setRatioRange({
                      ...filters.filterOptions.ratioRange,
                      min: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Max Ratio:</label>
                  <input
                    type="range"
                    min={filters.availableOptions.ratioRange.min}
                    max={filters.availableOptions.ratioRange.max}
                    value={filters.filterOptions.ratioRange.max}
                    onChange={(e) => filters.setRatioRange({
                      ...filters.filterOptions.ratioRange,
                      max: parseInt(e.target.value)
                    })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Date Created Range Filter */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('dateCreated')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-sm font-medium text-gray-900">Date Created</h3>
              <svg 
                className={`w-4 h-4 text-gray-500 transform transition-transform ${
                  expandedSections.has('dateCreated') ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.has('dateCreated') && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">From:</label>
                  <input
                    type="date"
                    value={filters.filterOptions.dateCreatedRange.start?.toISOString().split('T')[0] || ''}
                    onChange={(e) => filters.setDateCreatedRange({
                      ...filters.filterOptions.dateCreatedRange,
                      start: e.target.value ? new Date(e.target.value) : null
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">To:</label>
                  <input
                    type="date"
                    value={filters.filterOptions.dateCreatedRange.end?.toISOString().split('T')[0] || ''}
                    onChange={(e) => filters.setDateCreatedRange({
                      ...filters.filterOptions.dateCreatedRange,
                      end: e.target.value ? new Date(e.target.value) : null
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {(filters.filterOptions.dateCreatedRange.start || filters.filterOptions.dateCreatedRange.end) && (
                  <button
                    onClick={() => filters.setDateCreatedRange({ start: null, end: null })}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear date range
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Date Modified Range Filter */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection('dateModified')}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-sm font-medium text-gray-900">Date Modified</h3>
              <svg 
                className={`w-4 h-4 text-gray-500 transform transition-transform ${
                  expandedSections.has('dateModified') ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.has('dateModified') && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">From:</label>
                  <input
                    type="date"
                    value={filters.filterOptions.dateModifiedRange.start?.toISOString().split('T')[0] || ''}
                    onChange={(e) => filters.setDateModifiedRange({
                      ...filters.filterOptions.dateModifiedRange,
                      start: e.target.value ? new Date(e.target.value) : null
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">To:</label>
                  <input
                    type="date"
                    value={filters.filterOptions.dateModifiedRange.end?.toISOString().split('T')[0] || ''}
                    onChange={(e) => filters.setDateModifiedRange({
                      ...filters.filterOptions.dateModifiedRange,
                      end: e.target.value ? new Date(e.target.value) : null
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {(filters.filterOptions.dateModifiedRange.start || filters.filterOptions.dateModifiedRange.end) && (
                  <button
                    onClick={() => filters.setDateModifiedRange({ start: null, end: null })}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Clear date range
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}