import { 
  Collection, 
  CollectionSummary, 
  CollectionInput, 
  CollectionUpdate, 
  CollectionFilter,
  BatchCollectionOperation,
  CollectionAssignment
} from '../shared/types/collection';
import { apiClient, ApiResponse } from './api';

export interface CollectionServiceOptions {
  timeout?: number;
  retries?: number;
}

export class CollectionService {
  private readonly baseEndpoint = '/api/collections';

  // Create a new collection
  async createCollection(
    collectionInput: CollectionInput, 
    options: CollectionServiceOptions = {}
  ): Promise<ApiResponse<Collection>> {
    const { timeout = 15000, retries = 2 } = options;

    try {
      if (retries > 0) {
        return await apiClient.requestWithRetry(
          this.baseEndpoint,
          {
            method: 'POST',
            body: JSON.stringify(collectionInput),
            timeout,
          },
          retries
        );
      } else {
        return await apiClient.post<Collection>(this.baseEndpoint, collectionInput, { timeout });
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create collection. Please check your connection and try again.',
      };
    }
  }

  // Update an existing collection
  async updateCollection(
    id: string, 
    collectionUpdate: CollectionUpdate,
    options: CollectionServiceOptions = {}
  ): Promise<ApiResponse<Collection>> {
    const { timeout = 15000, retries = 2 } = options;

    if (!id) {
      return {
        success: false,
        error: 'Collection ID is required for update',
      };
    }

    try {
      if (retries > 0) {
        return await apiClient.requestWithRetry(
          `${this.baseEndpoint}/${id}`,
          {
            method: 'PUT',
            body: JSON.stringify(collectionUpdate),
            timeout,
          },
          retries
        );
      } else {
        return await apiClient.put<Collection>(`${this.baseEndpoint}/${id}`, collectionUpdate, { timeout });
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update collection. Please check your connection and try again.',
      };
    }
  }

  // Get a specific collection by ID
  async getCollection(
    id: string,
    options: CollectionServiceOptions = {}
  ): Promise<ApiResponse<Collection>> {
    const { timeout = 10000, retries = 1 } = options;

    if (!id) {
      return {
        success: false,
        error: 'Collection ID is required',
      };
    }

    try {
      if (retries > 0) {
        return await apiClient.requestWithRetry(
          `${this.baseEndpoint}/${id}`,
          { method: 'GET', timeout },
          retries
        );
      } else {
        return await apiClient.get<Collection>(`${this.baseEndpoint}/${id}`, { timeout });
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load collection. Please check your connection and try again.',
      };
    }
  }

  // Get all collections with optional filtering
  async getAllCollections(
    filters: CollectionFilter = {},
    options: CollectionServiceOptions = {}
  ): Promise<ApiResponse<Collection[]>> {
    const { timeout = 10000, retries = 1 } = options;

    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });

      const endpoint = queryParams.toString() 
        ? `${this.baseEndpoint}?${queryParams.toString()}`
        : this.baseEndpoint;

      if (retries > 0) {
        return await apiClient.requestWithRetry(
          endpoint,
          { method: 'GET', timeout },
          retries
        );
      } else {
        return await apiClient.get<Collection[]>(endpoint, { timeout });
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load collections. Please check your connection and try again.',
      };
    }
  }

  // Get collection summaries for efficient display
  async getCollectionSummaries(
    filters: CollectionFilter = {},
    options: CollectionServiceOptions = {}
  ): Promise<ApiResponse<CollectionSummary[]>> {
    const { timeout = 10000, retries = 1 } = options;

    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });

      const endpoint = queryParams.toString() 
        ? `${this.baseEndpoint}/summaries?${queryParams.toString()}`
        : `${this.baseEndpoint}/summaries`;

      if (retries > 0) {
        return await apiClient.requestWithRetry(
          endpoint,
          { method: 'GET', timeout },
          retries
        );
      } else {
        return await apiClient.get<CollectionSummary[]>(endpoint, { timeout });
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load collection summaries. Please check your connection and try again.',
      };
    }
  }

  // Delete a collection
  async deleteCollection(
    id: string,
    options: CollectionServiceOptions = {}
  ): Promise<ApiResponse<void>> {
    const { timeout = 10000, retries = 1 } = options;

    if (!id) {
      return {
        success: false,
        error: 'Collection ID is required for deletion',
      };
    }

    try {
      if (retries > 0) {
        return await apiClient.requestWithRetry(
          `${this.baseEndpoint}/${id}`,
          { method: 'DELETE', timeout },
          retries
        );
      } else {
        return await apiClient.delete<void>(`${this.baseEndpoint}/${id}`, { timeout });
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete collection. Please check your connection and try again.',
      };
    }
  }

  // Add recipe to collection
  async addRecipeToCollection(
    collectionId: string,
    recipeId: string,
    options: CollectionServiceOptions = {}
  ): Promise<ApiResponse<void>> {
    const { timeout = 10000 } = options;

    if (!collectionId || !recipeId) {
      return {
        success: false,
        error: 'Collection ID and Recipe ID are required',
      };
    }

    try {
      return await apiClient.post<void>(
        `${this.baseEndpoint}/${collectionId}/recipes/${recipeId}`,
        {},
        { timeout }
      );
    } catch (error) {
      return {
        success: false,
        error: 'Failed to add recipe to collection. Please try again.',
      };
    }
  }

  // Remove recipe from collection
  async removeRecipeFromCollection(
    collectionId: string,
    recipeId: string,
    options: CollectionServiceOptions = {}
  ): Promise<ApiResponse<void>> {
    const { timeout = 10000 } = options;

    if (!collectionId || !recipeId) {
      return {
        success: false,
        error: 'Collection ID and Recipe ID are required',
      };
    }

    try {
      return await apiClient.delete<void>(
        `${this.baseEndpoint}/${collectionId}/recipes/${recipeId}`,
        { timeout }
      );
    } catch (error) {
      return {
        success: false,
        error: 'Failed to remove recipe from collection. Please try again.',
      };
    }
  }

  // Batch operations for collections
  async batchOperation(
    operation: BatchCollectionOperation,
    options: CollectionServiceOptions = {}
  ): Promise<ApiResponse<{ success: string[], failed: string[] }>> {
    const { timeout = 30000 } = options;

    if (!operation.collectionId || !operation.recipeIds.length) {
      return {
        success: false,
        error: 'Collection ID and recipe IDs are required',
      };
    }

    try {
      return await apiClient.post<{ success: string[], failed: string[] }>(
        `${this.baseEndpoint}/${operation.collectionId}/recipes/batch`,
        {
          operation: operation.operation,
          recipeIds: operation.recipeIds,
        },
        { timeout }
      );
    } catch (error) {
      return {
        success: false,
        error: 'Failed to perform batch operation. Please try again.',
      };
    }
  }

  // Get recipes in a collection
  async getCollectionRecipes(
    collectionId: string,
    options: CollectionServiceOptions = {}
  ): Promise<ApiResponse<{ recipeIds: string[] }>> {
    const { timeout = 10000 } = options;

    if (!collectionId) {
      return {
        success: false,
        error: 'Collection ID is required',
      };
    }

    try {
      return await apiClient.get<{ recipeIds: string[] }>(
        `${this.baseEndpoint}/${collectionId}/recipes`,
        { timeout }
      );
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load collection recipes. Please try again.',
      };
    }
  }

  // Get collections for a specific recipe
  async getRecipeCollections(
    recipeId: string,
    options: CollectionServiceOptions = {}
  ): Promise<ApiResponse<Collection[]>> {
    const { timeout = 10000 } = options;

    if (!recipeId) {
      return {
        success: false,
        error: 'Recipe ID is required',
      };
    }

    try {
      return await apiClient.get<Collection[]>(
        `${this.baseEndpoint}/recipe/${recipeId}`,
        { timeout }
      );
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load recipe collections. Please try again.',
      };
    }
  }

  // Search collections
  async searchCollections(
    query: string,
    options: CollectionServiceOptions = {}
  ): Promise<ApiResponse<CollectionSummary[]>> {
    const { timeout = 10000 } = options;

    if (!query.trim()) {
      return this.getCollectionSummaries({}, options);
    }

    try {
      const endpoint = `${this.baseEndpoint}/search?q=${encodeURIComponent(query.trim())}`;
      return await apiClient.get<CollectionSummary[]>(endpoint, { timeout });
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search collections. Please try again.',
      };
    }
  }

  // Get collection statistics
  async getCollectionStats(
    collectionId: string,
    options: CollectionServiceOptions = {}
  ): Promise<ApiResponse<Collection['stats']>> {
    const { timeout = 10000 } = options;

    if (!collectionId) {
      return {
        success: false,
        error: 'Collection ID is required',
      };
    }

    try {
      return await apiClient.get<Collection['stats']>(
        `${this.baseEndpoint}/${collectionId}/stats`,
        { timeout }
      );
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load collection statistics. Please try again.',
      };
    }
  }

  // Health check for collection service
  async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get(`${this.baseEndpoint}/health`);
      return response.success;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const collectionService = new CollectionService();

// Utility functions for collection operations
export const formatCollectionForSave = (collectionInput: CollectionInput): CollectionInput => {
  // Clean up empty optional fields
  const cleaned = { ...collectionInput };
  
  // Remove empty strings and convert to undefined
  Object.keys(cleaned).forEach(key => {
    const value = (cleaned as any)[key];
    if (typeof value === 'string' && value.trim() === '') {
      (cleaned as any)[key] = undefined;
    }
  });

  // Ensure tags is an array
  if (!cleaned.tags) {
    cleaned.tags = [];
  }

  return cleaned;
};

export const generateCollectionId = (): string => {
  return crypto.randomUUID?.() || `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to get collection color options
export const getCollectionColorOptions = () => [
  { value: 'blue', label: 'Blue', color: '#3B82F6' },
  { value: 'green', label: 'Green', color: '#10B981' },
  { value: 'orange', label: 'Orange', color: '#F59E0B' },
  { value: 'red', label: 'Red', color: '#EF4444' },
  { value: 'purple', label: 'Purple', color: '#8B5CF6' },
  { value: 'teal', label: 'Teal', color: '#14B8A6' },
  { value: 'pink', label: 'Pink', color: '#EC4899' },
  { value: 'indigo', label: 'Indigo', color: '#6366F1' },
  { value: 'gray', label: 'Gray', color: '#6B7280' },
];

// Helper function to validate collection name
export const validateCollectionName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return 'Collection name is required';
  }
  
  if (name.trim().length < 2) {
    return 'Collection name must be at least 2 characters long';
  }
  
  if (name.trim().length > 100) {
    return 'Collection name must be less than 100 characters';
  }
  
  return null;
};