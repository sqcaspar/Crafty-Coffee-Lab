import { Recipe, RecipeSummary } from '../shared/types/recipe';
import { Collection } from '../../../shared/src/types/collection';
import { recipeService } from './recipeService';
import { collectionService } from './collectionService';

export interface BackupData {
  version: string;
  timestamp: string;
  metadata: {
    totalRecipes: number;
    totalCollections: number;
    appVersion: string;
    exportedBy: string;
  };
  recipes: Recipe[];
  collections: Collection[];
  userPreferences: {
    theme: string;
    favoriteOrigins: string[];
    recentSearches: string[];
    dismissedSuggestions: string[];
  };
  statistics: {
    totalExports: number;
    totalClones: number;
    averageRating: number;
    mostUsedOrigin: string;
    mostUsedMethod: string;
  };
}

export interface RestoreOptions {
  includeRecipes: boolean;
  includeCollections: boolean;
  includeUserPreferences: boolean;
  overwriteExisting: boolean;
  createBackupBeforeRestore: boolean;
}

export interface RestoreResult {
  success: boolean;
  message: string;
  statistics: {
    recipesRestored: number;
    collectionsRestored: number;
    recipesSkipped: number;
    collectionsSkipped: number;
    errors: number;
  };
  errors?: string[];
}

class BackupService {
  private readonly BACKUP_VERSION = '1.0';
  private readonly BACKUP_HISTORY_KEY = 'coffeeTracker_backupHistory';
  private readonly MAX_BACKUP_HISTORY = 10;

  // Create a complete backup of all user data
  async createBackup(): Promise<{ success: boolean; data?: BackupData; error?: string }> {
    try {
      // Fetch all recipes
      const recipesResponse = await recipeService.getAllRecipes();
      if (!recipesResponse.success) {
        throw new Error(recipesResponse.error || 'Failed to fetch recipes');
      }

      // Fetch detailed recipe data
      const recipes: Recipe[] = [];
      const recipePromises = (recipesResponse.data || []).map(summary => 
        recipeService.getRecipe(summary.recipeId)
      );
      
      const detailedResponses = await Promise.all(recipePromises);
      for (const response of detailedResponses) {
        if (response.success && response.data) {
          recipes.push(response.data);
        }
      }

      // Fetch all collections
      let collections: Collection[] = [];
      try {
        const collectionsResponse = await collectionService.getAllCollections();
        if (collectionsResponse.success && collectionsResponse.data) {
          collections = collectionsResponse.data;
        }
      } catch (error) {
        console.warn('Could not fetch collections:', error);
      }

      // Gather user preferences from localStorage
      const userPreferences = {
        theme: localStorage.getItem('coffeeTracker_theme') || 'light',
        favoriteOrigins: this.getLocalStorageArray('coffeeTracker_favoriteOrigins'),
        recentSearches: this.getLocalStorageArray('coffeeTracker_recentSearches'),
        dismissedSuggestions: this.getLocalStorageArray('coffeeTracker_dismissedSuggestions')
      };

      // Calculate statistics
      const statistics = this.calculateStatistics(recipes);

      // Create backup data structure
      const backupData: BackupData = {
        version: this.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        metadata: {
          totalRecipes: recipes.length,
          totalCollections: collections.length,
          appVersion: '1.0.0',
          exportedBy: 'Coffee Recipe Tracker'
        },
        recipes,
        collections,
        userPreferences,
        statistics
      };

      // Add to backup history
      this.addToBackupHistory({
        timestamp: backupData.timestamp,
        recipesCount: recipes.length,
        collectionsCount: collections.length,
        size: JSON.stringify(backupData).length
      });

      return { success: true, data: backupData };
    } catch (error) {
      console.error('Backup creation failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unexpected error during backup'
      };
    }
  }

  // Restore data from backup
  async restoreFromBackup(
    backupData: BackupData, 
    options: RestoreOptions
  ): Promise<RestoreResult> {
    const result: RestoreResult = {
      success: false,
      message: '',
      statistics: {
        recipesRestored: 0,
        collectionsRestored: 0,
        recipesSkipped: 0,
        collectionsSkipped: 0,
        errors: 0
      },
      errors: []
    };

    try {
      // Validate backup data
      if (!this.validateBackupData(backupData)) {
        result.message = 'Invalid backup data format';
        result.errors = ['Backup file is corrupted or incompatible'];
        return result;
      }

      // Create backup before restore if requested
      if (options.createBackupBeforeRestore) {
        const currentBackup = await this.createBackup();
        if (!currentBackup.success) {
          result.message = 'Failed to create safety backup before restore';
          result.errors = ['Could not create backup before restore'];
          return result;
        }
      }

      // Restore recipes
      if (options.includeRecipes && backupData.recipes) {
        const recipeResults = await this.restoreRecipes(backupData.recipes, options.overwriteExisting);
        result.statistics.recipesRestored = recipeResults.restored;
        result.statistics.recipesSkipped = recipeResults.skipped;
        result.statistics.errors += recipeResults.errors.length;
        result.errors?.push(...recipeResults.errors);
      }

      // Restore collections
      if (options.includeCollections && backupData.collections) {
        const collectionResults = await this.restoreCollections(backupData.collections, options.overwriteExisting);
        result.statistics.collectionsRestored = collectionResults.restored;
        result.statistics.collectionsSkipped = collectionResults.skipped;
        result.statistics.errors += collectionResults.errors.length;
        result.errors?.push(...collectionResults.errors);
      }

      // Restore user preferences
      if (options.includeUserPreferences && backupData.userPreferences) {
        this.restoreUserPreferences(backupData.userPreferences);
      }

      // Generate result message
      const totalRestored = result.statistics.recipesRestored + result.statistics.collectionsRestored;
      const totalSkipped = result.statistics.recipesSkipped + result.statistics.collectionsSkipped;
      
      if (totalRestored > 0) {
        result.success = true;
        result.message = `Successfully restored ${totalRestored} items`;
        if (totalSkipped > 0) {
          result.message += ` (${totalSkipped} items skipped)`;
        }
        if (result.statistics.errors > 0) {
          result.message += ` with ${result.statistics.errors} errors`;
        }
      } else if (totalSkipped > 0) {
        result.success = true;
        result.message = `All ${totalSkipped} items already exist (skipped)`;
      } else {
        result.message = 'No items were restored';
      }

      return result;
    } catch (error) {
      console.error('Restore failed:', error);
      result.message = 'Restore operation failed';
      result.errors = [error instanceof Error ? error.message : 'Unexpected error during restore'];
      return result;
    }
  }

  // Export backup to file
  async exportBackupToFile(backupData: BackupData): Promise<void> {
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `coffee-recipes-backup-${timestamp}.json`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Import backup from file
  async importBackupFromFile(file: File): Promise<{ success: boolean; data?: BackupData; error?: string }> {
    try {
      const text = await file.text();
      const backupData = JSON.parse(text) as BackupData;
      
      if (!this.validateBackupData(backupData)) {
        return { success: false, error: 'Invalid backup file format' };
      }

      return { success: true, data: backupData };
    } catch (error) {
      console.error('Backup import failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to parse backup file'
      };
    }
  }

  // Validate backup data structure
  private validateBackupData(data: any): data is BackupData {
    if (!data || typeof data !== 'object') return false;
    if (!data.version || !data.timestamp || !data.metadata) return false;
    if (!Array.isArray(data.recipes)) return false;
    
    return true;
  }

  // Restore recipes from backup
  private async restoreRecipes(
    recipes: Recipe[], 
    overwrite: boolean
  ): Promise<{ restored: number; skipped: number; errors: string[] }> {
    const result = { restored: 0, skipped: 0, errors: [] as string[] };

    for (const recipe of recipes) {
      try {
        // Check if recipe already exists
        const existingResponse = await recipeService.getRecipe(recipe.recipeId);
        
        if (existingResponse.success && !overwrite) {
          result.skipped++;
          continue;
        }

        // Create or update recipe
        const response = existingResponse.success && overwrite
          ? await recipeService.updateRecipe(recipe.recipeId, recipe)
          : await recipeService.createRecipe(recipe);

        if (response.success) {
          result.restored++;
        } else {
          result.errors.push(`Failed to restore recipe "${recipe.recipeName}": ${response.error}`);
        }
      } catch (error) {
        result.errors.push(`Error restoring recipe "${recipe.recipeName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return result;
  }

  // Restore collections from backup
  private async restoreCollections(
    collections: Collection[], 
    overwrite: boolean
  ): Promise<{ restored: number; skipped: number; errors: string[] }> {
    const result = { restored: 0, skipped: 0, errors: [] as string[] };

    for (const collection of collections) {
      try {
        // Check if collection already exists
        const existingResponse = await collectionService.getCollection(collection.collectionId);
        
        if (existingResponse.success && !overwrite) {
          result.skipped++;
          continue;
        }

        // Create or update collection
        const response = existingResponse.success && overwrite
          ? await collectionService.updateCollection(collection.collectionId, collection)
          : await collectionService.createCollection(collection);

        if (response.success) {
          result.restored++;
        } else {
          result.errors.push(`Failed to restore collection "${collection.name}": ${response.error}`);
        }
      } catch (error) {
        result.errors.push(`Error restoring collection "${collection.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return result;
  }

  // Restore user preferences
  private restoreUserPreferences(preferences: BackupData['userPreferences']): void {
    try {
      if (preferences.theme) {
        localStorage.setItem('coffeeTracker_theme', preferences.theme);
      }
      
      if (preferences.favoriteOrigins?.length) {
        localStorage.setItem('coffeeTracker_favoriteOrigins', JSON.stringify(preferences.favoriteOrigins));
      }
      
      if (preferences.recentSearches?.length) {
        localStorage.setItem('coffeeTracker_recentSearches', JSON.stringify(preferences.recentSearches));
      }
      
      if (preferences.dismissedSuggestions?.length) {
        localStorage.setItem('coffeeTracker_dismissedSuggestions', JSON.stringify(preferences.dismissedSuggestions));
      }
    } catch (error) {
      console.warn('Failed to restore user preferences:', error);
    }
  }

  // Calculate statistics for backup
  private calculateStatistics(recipes: Recipe[]) {
    const ratedRecipes = recipes.filter(r => r.sensationRecord?.overallImpression);
    const averageRating = ratedRecipes.length > 0
      ? ratedRecipes.reduce((sum, r) => sum + (r.sensationRecord.overallImpression || 0), 0) / ratedRecipes.length
      : 0;

    const originCounts: { [key: string]: number } = {};
    const methodCounts: { [key: string]: number } = {};

    recipes.forEach(recipe => {
      if (recipe.beanInfo.origin) {
        originCounts[recipe.beanInfo.origin] = (originCounts[recipe.beanInfo.origin] || 0) + 1;
      }
      if (recipe.brewingParameters.brewingMethod) {
        methodCounts[recipe.brewingParameters.brewingMethod] = (methodCounts[recipe.brewingParameters.brewingMethod] || 0) + 1;
      }
    });

    const mostUsedOrigin = Object.keys(originCounts).length > 0
      ? Object.keys(originCounts).reduce((a, b) => originCounts[a] > originCounts[b] ? a : b)
      : 'None';

    const mostUsedMethod = Object.keys(methodCounts).length > 0
      ? Object.keys(methodCounts).reduce((a, b) => methodCounts[a] > methodCounts[b] ? a : b)
      : 'None';

    return {
      totalExports: this.getLocalStorageNumber('coffeeTracker_totalExports'),
      totalClones: this.getLocalStorageNumber('coffeeTracker_totalClones'),
      averageRating,
      mostUsedOrigin,
      mostUsedMethod
    };
  }

  // Helper methods
  private getLocalStorageArray(key: string): string[] {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getLocalStorageNumber(key: string): number {
    try {
      const stored = localStorage.getItem(key);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  }

  // Backup history management
  private addToBackupHistory(backup: {
    timestamp: string;
    recipesCount: number;
    collectionsCount: number;
    size: number;
  }): void {
    try {
      const history = this.getBackupHistory();
      history.unshift(backup);
      
      if (history.length > this.MAX_BACKUP_HISTORY) {
        history.splice(this.MAX_BACKUP_HISTORY);
      }
      
      localStorage.setItem(this.BACKUP_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.warn('Failed to save backup history:', error);
    }
  }

  // Get backup history
  getBackupHistory(): Array<{
    timestamp: string;
    recipesCount: number;
    collectionsCount: number;
    size: number;
  }> {
    try {
      const stored = localStorage.getItem(this.BACKUP_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Clear backup history
  clearBackupHistory(): void {
    try {
      localStorage.removeItem(this.BACKUP_HISTORY_KEY);
    } catch (error) {
      console.warn('Failed to clear backup history:', error);
    }
  }
}

export const backupService = new BackupService();