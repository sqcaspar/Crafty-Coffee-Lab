import React, { useState, useEffect } from 'react';
import { Collection, CollectionSummary } from '../../../shared/src/types/collection';
import { collectionService, getCollectionColorOptions } from '../services/collectionService';
import { useToast } from '../components/ui/ToastContainer';

interface CollectionSelectorProps {
  selectedCollections: string[];
  onCollectionsChange: (collectionIds: string[]) => void;
  allowCreate?: boolean;
  compact?: boolean;
  className?: string;
}

const CollectionSelector: React.FC<CollectionSelectorProps> = ({
  selectedCollections,
  onCollectionsChange,
  allowCreate = true,
  compact = false,
  className = ''
}) => {
  const { showToast } = useToast();
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load available collections
  const loadCollections = async () => {
    setLoading(true);
    try {
      const result = await collectionService.getCollectionSummaries({
        sortBy: 'name',
        sortOrder: 'asc'
      });
      if (result.success && result.data) {
        setCollections(result.data);
      } else {
        showToast(result.error || 'Failed to load collections', 'error');
      }
    } catch (error) {
      showToast('Failed to load collections', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  // Filter collections based on search term
  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (collection.description && collection.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle collection toggle
  const handleCollectionToggle = (collectionId: string) => {
    const isSelected = selectedCollections.includes(collectionId);
    if (isSelected) {
      onCollectionsChange(selectedCollections.filter(id => id !== collectionId));
    } else {
      onCollectionsChange([...selectedCollections, collectionId]);
    }
  };

  // Handle creating new collection
  const handleCreateCollection = async () => {
    if (!searchTerm.trim()) return;

    try {
      const result = await collectionService.createCollection({
        name: searchTerm.trim(),
        color: 'blue',
        isPrivate: false,
        isDefault: false,
        tags: []
      });

      if (result.success && result.data) {
        showToast('Collection created successfully', 'success');
        await loadCollections();
        // Auto-select the new collection
        onCollectionsChange([...selectedCollections, result.data.collectionId]);
        setSearchTerm('');
      } else {
        showToast(result.error || 'Failed to create collection', 'error');
      }
    } catch (error) {
      showToast('Failed to create collection', 'error');
    }
  };

  // Get selected collection details for display
  const selectedCollectionDetails = collections.filter(c => 
    selectedCollections.includes(c.collectionId)
  );

  const colorOptions = getCollectionColorOptions();
  const getColorStyle = (color: string) => {
    const colorOption = colorOptions.find(opt => opt.value === color);
    return colorOption ? { backgroundColor: colorOption.color } : { backgroundColor: '#6B7280' };
  };

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
        >
          {selectedCollections.length === 0 ? (
            <span className="text-gray-500">Select collections...</span>
          ) : (
            <span>{selectedCollections.length} collection(s) selected</span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {/* Search */}
            <div className="p-2 border-b">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search collections..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Collection list */}
            <div className="max-h-40 overflow-y-auto">
              {loading ? (
                <div className="p-2 text-center text-gray-500">Loading...</div>
              ) : filteredCollections.length === 0 ? (
                <div className="p-2">
                  <div className="text-gray-500 text-sm mb-2">No collections found</div>
                  {allowCreate && searchTerm.trim() && (
                    <button
                      type="button"
                      onClick={handleCreateCollection}
                      className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      Create "{searchTerm.trim()}"
                    </button>
                  )}
                </div>
              ) : (
                filteredCollections.map((collection) => (
                  <button
                    key={collection.collectionId}
                    type="button"
                    onClick={() => handleCollectionToggle(collection.collectionId)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCollections.includes(collection.collectionId)}
                      onChange={() => {}} // Handled by button click
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={getColorStyle(collection.color)}
                    />
                    <span className="text-sm">{collection.name}</span>
                    <span className="text-xs text-gray-500">({collection.recipeCount})</span>
                  </button>
                ))
              )}
            </div>

            {/* Create new option */}
            {allowCreate && searchTerm.trim() && !filteredCollections.some(c => c.name.toLowerCase() === searchTerm.toLowerCase()) && (
              <div className="border-t p-2">
                <button
                  type="button"
                  onClick={handleCreateCollection}
                  className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                >
                  Create "{searchTerm.trim()}"
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selected Collections Display */}
      {selectedCollectionDetails.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Collections</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCollectionDetails.map((collection) => (
              <span
                key={collection.collectionId}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                <div
                  className="w-2 h-2 rounded-full mr-2"
                  style={getColorStyle(collection.color)}
                />
                {collection.name}
                <button
                  type="button"
                  onClick={() => handleCollectionToggle(collection.collectionId)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Collection Selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Add to Collections</h4>
        
        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search collections..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Collection Grid */}
        {loading ? (
          <div className="text-center py-4">
            <div className="text-gray-500">Loading collections...</div>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-gray-500 mb-2">No collections found</div>
            {allowCreate && searchTerm.trim() && (
              <button
                type="button"
                onClick={handleCreateCollection}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
              >
                Create "{searchTerm.trim()}"
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {filteredCollections.map((collection) => (
              <label
                key={collection.collectionId}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(collection.collectionId)}
                  onChange={() => handleCollectionToggle(collection.collectionId)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={getColorStyle(collection.color)}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{collection.name}</div>
                  {collection.description && (
                    <div className="text-xs text-gray-500">{collection.description}</div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {collection.recipeCount} recipe{collection.recipeCount !== 1 ? 's' : ''}
                </div>
              </label>
            ))}
          </div>
        )}

        {/* Create new collection option */}
        {allowCreate && searchTerm.trim() && !filteredCollections.some(c => c.name.toLowerCase() === searchTerm.toLowerCase()) && (
          <div className="mt-3 pt-3 border-t">
            <button
              type="button"
              onClick={handleCreateCollection}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors"
            >
              Create collection "{searchTerm.trim()}"
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionSelector;