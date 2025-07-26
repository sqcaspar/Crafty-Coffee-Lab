import React, { useState, useEffect } from 'react';
import { 
  Collection, 
  CollectionSummary, 
  CollectionFilter,
  CollectionColor 
} from '../shared/types/collection';
import { collectionService, getCollectionColorOptions } from '../services/collectionService';
import { useToast } from '../components/ui/ToastContainer';
import CollectionManager from './CollectionManager';
import LoadingSpinner from './ui/LoadingSpinner';

interface CollectionsListProps {
  onCollectionSelect?: (collection: Collection) => void;
  showCreateButton?: boolean;
  compact?: boolean;
}

const CollectionsList: React.FC<CollectionsListProps> = ({
  onCollectionSelect,
  showCreateButton = true,
  compact = false
}) => {
  const { showToast } = useToast();
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [showManager, setShowManager] = useState(false);
  const [managerMode, setManagerMode] = useState<'create' | 'edit'>('create');
  const [filters, setFilters] = useState<CollectionFilter>({
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Load collections
  const loadCollections = async () => {
    setLoading(true);
    try {
      const result = await collectionService.getCollectionSummaries(filters);
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
  }, [filters]);

  const handleCreateCollection = () => {
    setSelectedCollection(null);
    setManagerMode('create');
    setShowManager(true);
  };

  const handleEditCollection = async (collectionId: string) => {
    try {
      const result = await collectionService.getCollection(collectionId);
      if (result.success && result.data) {
        setSelectedCollection(result.data);
        setManagerMode('edit');
        setShowManager(true);
      } else {
        showToast(result.error || 'Failed to load collection details', 'error');
      }
    } catch (error) {
      showToast('Failed to load collection details', 'error');
    }
  };

  const handleDeleteCollection = async (collectionId: string, collectionName: string) => {
    if (!confirm(`Are you sure you want to delete the collection "${collectionName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await collectionService.deleteCollection(collectionId);
      if (result.success) {
        showToast('Collection deleted successfully', 'success');
        await loadCollections();
      } else {
        showToast(result.error || 'Failed to delete collection', 'error');
      }
    } catch (error) {
      showToast('Failed to delete collection', 'error');
    }
  };

  const handleCollectionClick = async (collectionSummary: CollectionSummary) => {
    if (onCollectionSelect) {
      try {
        const result = await collectionService.getCollection(collectionSummary.collectionId);
        if (result.success && result.data) {
          onCollectionSelect(result.data);
        }
      } catch (error) {
        showToast('Failed to load collection details', 'error');
      }
    }
  };

  const handleManagerSuccess = (collection: Collection) => {
    loadCollections();
  };

  const handleFilterChange = (newFilters: Partial<CollectionFilter>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const getColorStyle = (color: CollectionColor) => {
    const colorOption = getCollectionColorOptions().find(opt => opt.value === color);
    return colorOption ? { backgroundColor: colorOption.color } : { backgroundColor: '#6B7280' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Collections</h2>
          <p className="text-gray-600">Organize your recipes into collections</p>
        </div>
        {showCreateButton && (
          <button
            onClick={handleCreateCollection}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Collection</span>
          </button>
        )}
      </div>

      {/* Filters */}
      {!compact && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={filters.searchQuery || ''}
                onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
                placeholder="Search collections..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Color Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <select
                value={filters.color || ''}
                onChange={(e) => handleFilterChange({ color: e.target.value as CollectionColor || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Colors</option>
                {getCollectionColorOptions().map(color => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy || 'name'}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="created-date">Created Date</option>
                <option value="modified-date">Modified Date</option>
                <option value="recipe-count">Recipe Count</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <select
                value={filters.sortOrder || 'asc'}
                onChange={(e) => handleFilterChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No collections found</h3>
          <p className="text-gray-600 mb-4">
            {filters.searchQuery ? 'No collections match your search criteria.' : 'Create your first collection to organize your recipes.'}
          </p>
          {showCreateButton && !filters.searchQuery && (
            <button
              onClick={handleCreateCollection}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Create Collection
            </button>
          )}
        </div>
      ) : (
        <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {collections.map((collection) => (
            <div
              key={collection.collectionId}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCollectionClick(collection)}
            >
              {/* Collection Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={getColorStyle(collection.color)}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{collection.name}</h3>
                    {collection.isPrivate && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Private
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCollection(collection.collectionId);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit collection"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {!collection.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(collection.collectionId, collection.name);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete collection"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              {collection.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {collection.description}
                </p>
              )}

              {/* Tags */}
              {collection.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {collection.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                  {collection.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{collection.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">Recipes</p>
                  <p className="font-semibold text-gray-900">{collection.recipeCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Rating</p>
                  <p className="font-semibold text-gray-900">
                    {collection.averageRating > 0 ? collection.averageRating.toFixed(1) : '—'}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Created {formatDate(collection.dateCreated)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Collection Manager Modal */}
      <CollectionManager
        isOpen={showManager}
        onClose={() => setShowManager(false)}
        collection={selectedCollection}
        onSuccess={handleManagerSuccess}
        mode={managerMode}
      />
    </div>
  );
};

export default CollectionsList;