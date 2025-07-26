import React, { useState, useEffect } from 'react';
import { 
  Collection, 
  CollectionInput, 
  CollectionUpdate, 
  CollectionColor 
} from '../shared/types/collection';
import { 
  collectionService, 
  getCollectionColorOptions, 
  validateCollectionName 
} from '../services/collectionService';
import { useToast } from '../components/ui/ToastContainer';

interface CollectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  collection?: Collection | null;
  onSuccess?: (collection: Collection) => void;
  mode?: 'create' | 'edit';
}

interface FormData {
  name: string;
  description: string;
  color: CollectionColor;
  isPrivate: boolean;
  tags: string[];
}

const CollectionManager: React.FC<CollectionManagerProps> = ({
  isOpen,
  onClose,
  collection,
  onSuccess,
  mode = collection ? 'edit' : 'create'
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    color: 'blue' as CollectionColor,
    isPrivate: false,
    tags: []
  });
  
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Initialize form data when collection changes
  useEffect(() => {
    if (collection && mode === 'edit') {
      setFormData({
        name: collection.name,
        description: collection.description || '',
        color: collection.color,
        isPrivate: collection.isPrivate,
        tags: [...collection.tags]
      });
    } else {
      setFormData({
        name: '',
        description: '',
        color: 'blue' as CollectionColor,
        isPrivate: false,
        tags: []
      });
    }
    setErrors({});
    setTagInput('');
  }, [collection, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Validate name
    const nameError = validateCollectionName(formData.name);
    if (nameError) {
      newErrors.name = nameError;
    }

    // Validate description (optional but if provided, should be reasonable length)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      
      if (mode === 'edit' && collection) {
        const updateData: CollectionUpdate = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
          isPrivate: formData.isPrivate,
          tags: formData.tags
        };
        
        result = await collectionService.updateCollection(collection.collectionId, updateData);
      } else {
        const createData: CollectionInput = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          color: formData.color,
          isPrivate: formData.isPrivate,
          isDefault: false,
          tags: formData.tags
        };
        
        result = await collectionService.createCollection(createData);
      }

      if (result.success && result.data) {
        showToast(
          mode === 'edit' ? 'Collection updated successfully' : 'Collection created successfully',
          'success'
        );
        onSuccess?.(result.data);
        onClose();
      } else {
        showToast(result.error || 'Failed to save collection', 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const colorOptions = getCollectionColorOptions();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit Collection' : 'Create New Collection'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Collection Name */}
          <div>
            <label htmlFor="collection-name" className="block text-sm font-medium text-gray-700 mb-2">
              Collection Name *
            </label>
            <input
              id="collection-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter collection name"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="collection-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="collection-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Optional description for this collection"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {colorOptions.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => handleInputChange('color', colorOption.value)}
                  className={`flex items-center space-x-2 p-2 rounded-md border transition-colors ${
                    formData.color === colorOption.value
                      ? 'border-gray-400 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colorOption.color }}
                  />
                  <span className="text-sm">{colorOption.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Setting */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isPrivate}
                onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Private Collection</span>
            </label>
            <p className="mt-1 text-xs text-gray-500">
              Private collections are only visible to you
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Collection' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectionManager;