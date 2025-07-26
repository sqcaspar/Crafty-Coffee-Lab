import { Recipe, RecipeInput, RecipeSummary } from '../shared/types/recipe';
import { apiClient, ApiResponse } from './api';

export interface RecipeServiceOptions {
  timeout?: number;
  retries?: number;
}

export class RecipeService {
  private readonly baseEndpoint = '/api/recipes';

  // Create a new recipe
  async createRecipe(
    recipeInput: RecipeInput, 
    options: RecipeServiceOptions = {}
  ): Promise<ApiResponse<Recipe>> {
    const { timeout = 15000, retries = 2 } = options;

    try {
      if (retries > 0) {
        return await apiClient.requestWithRetry(
          this.baseEndpoint,
          {
            method: 'POST',
            body: JSON.stringify(recipeInput),
            timeout,
          },
          retries
        );
      } else {
        return await apiClient.post<Recipe>(this.baseEndpoint, recipeInput, { timeout });
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create recipe. Please check your connection and try again.',
      };
    }
  }

  // Update an existing recipe
  async updateRecipe(
    id: string, 
    recipeInput: RecipeInput,
    options: RecipeServiceOptions = {}
  ): Promise<ApiResponse<Recipe>> {
    const { timeout = 15000, retries = 2 } = options;

    if (!id) {
      return {
        success: false,
        error: 'Recipe ID is required for update',
      };
    }

    try {
      if (retries > 0) {
        return await apiClient.requestWithRetry(
          `${this.baseEndpoint}/${id}`,
          {
            method: 'PUT',
            body: JSON.stringify(recipeInput),
            timeout,
          },
          retries
        );
      } else {
        return await apiClient.put<Recipe>(`${this.baseEndpoint}/${id}`, recipeInput, { timeout });
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update recipe. Please check your connection and try again.',
      };
    }
  }

  // Get a specific recipe by ID
  async getRecipe(
    id: string,
    options: RecipeServiceOptions = {}
  ): Promise<ApiResponse<Recipe>> {
    const { timeout = 10000, retries = 1 } = options;

    if (!id) {
      return {
        success: false,
        error: 'Recipe ID is required',
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
        return await apiClient.get<Recipe>(`${this.baseEndpoint}/${id}`, { timeout });
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load recipe. Please check your connection and try again.',
      };
    }
  }

  // Get all recipes with optional filtering
  async getAllRecipes(
    filters: Record<string, any> = {},
    options: RecipeServiceOptions = {}
  ): Promise<ApiResponse<RecipeSummary[]>> {
    const { timeout = 10000, retries = 1 } = options;

    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
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
        return await apiClient.get<RecipeSummary[]>(endpoint, { timeout });
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load recipes. Please check your connection and try again.',
      };
    }
  }

  // Delete a recipe
  async deleteRecipe(
    id: string,
    options: RecipeServiceOptions = {}
  ): Promise<ApiResponse<void>> {
    const { timeout = 10000, retries = 1 } = options;

    if (!id) {
      return {
        success: false,
        error: 'Recipe ID is required for deletion',
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
        error: 'Failed to delete recipe. Please check your connection and try again.',
      };
    }
  }

  // Toggle favorite status
  async toggleFavorite(
    id: string,
    isFavorite: boolean,
    options: RecipeServiceOptions = {}
  ): Promise<ApiResponse<Recipe>> {
    const { timeout = 5000 } = options;

    if (!id) {
      return {
        success: false,
        error: 'Recipe ID is required',
      };
    }

    try {
      return await apiClient.put<Recipe>(
        `${this.baseEndpoint}/${id}`, 
        { isFavorite },
        { timeout }
      );
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update favorite status. Please try again.',
      };
    }
  }

  // Batch operations
  async batchDelete(
    ids: string[],
    options: RecipeServiceOptions = {}
  ): Promise<ApiResponse<{ deleted: string[], failed: string[] }>> {
    const { timeout = 30000 } = options;

    if (!ids.length) {
      return {
        success: false,
        error: 'No recipe IDs provided for deletion',
      };
    }

    try {
      return await apiClient.delete<{ deleted: string[], failed: string[] }>(
        `${this.baseEndpoint}/batch`,
        {
          body: JSON.stringify({ ids }),
          timeout,
        }
      );
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete recipes. Please try again.',
      };
    }
  }

  // Search recipes
  async searchRecipes(
    query: string,
    options: RecipeServiceOptions = {}
  ): Promise<ApiResponse<RecipeSummary[]>> {
    const { timeout = 10000 } = options;

    if (!query.trim()) {
      return this.getAllRecipes({}, options);
    }

    try {
      const endpoint = `${this.baseEndpoint}/search?q=${encodeURIComponent(query.trim())}`;
      return await apiClient.get<RecipeSummary[]>(endpoint, { timeout });
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search recipes. Please try again.',
      };
    }
  }

  // Health check for recipe service
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
export const recipeService = new RecipeService();

// Utility functions for recipe operations
export const formatRecipeForSave = (recipeInput: RecipeInput): RecipeInput => {
  // Clean up empty optional fields and ensure proper types
  const cleaned = { ...recipeInput };
  
  // Ensure sensation record numbers are properly typed
  if (cleaned.sensationRecord) {
    const sensation = cleaned.sensationRecord;
    
    // Convert string numbers to actual numbers for rating fields
    const numericFields = [
      'overallImpression', 'acidity', 'body', 'sweetness', 
      'flavor', 'aftertaste', 'balance'
    ];
    
    numericFields.forEach(field => {
      const value = (sensation as any)[field];
      if (typeof value === 'string' && value !== '') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          (sensation as any)[field] = numValue;
        }
      } else if (value === '' || value === null) {
        (sensation as any)[field] = undefined;
      }
    });
    
    // Handle evaluation system sub-objects
    ['traditionalSCA', 'cvaDescriptive', 'cvaAffective', 'quickTasting'].forEach(systemKey => {
      const system = (sensation as any)[systemKey];
      if (system && typeof system === 'object') {
        Object.keys(system).forEach(subKey => {
          const subValue = system[subKey];
          if (typeof subValue === 'string' && subValue !== '') {
            const numValue = parseFloat(subValue);
            if (!isNaN(numValue)) {
              system[subKey] = numValue;
            }
          } else if (subValue === '' || subValue === null) {
            system[subKey] = undefined;
          }
        });
      }
    });
  }
  
  // Handle roasting date conversion
  if (cleaned.beanInfo?.roastingDate) {
    const dateValue = cleaned.beanInfo.roastingDate;
    // If it's a date string (YYYY-MM-DD), convert to ISO datetime
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      cleaned.beanInfo.roastingDate = `${dateValue}T00:00:00.000Z`;
    }
  }
  
  // Remove empty strings and convert to undefined for other fields
  Object.keys(cleaned).forEach(key => {
    const value = (cleaned as any)[key];
    if (typeof value === 'object' && value !== null) {
      Object.keys(value).forEach(subKey => {
        if (value[subKey] === '' || value[subKey] === null) {
          value[subKey] = undefined;
        }
      });
    } else if (value === '' || value === null) {
      (cleaned as any)[key] = undefined;
    }
  });

  return cleaned;
};

export const generateRecipeId = (): string => {
  return crypto.randomUUID?.() || `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};