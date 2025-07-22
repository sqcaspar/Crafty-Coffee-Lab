import { Recipe, RecipeSummary } from '../../../shared/src/types/recipe';
import { recipeService } from './recipeService';

export interface CloneOptions {
  newName?: string;
  addSuffix?: boolean;
  suffixPattern?: string;
  preserveCollections?: boolean;
  preserveRatings?: boolean;
  preserveFavorite?: boolean;
  addToComparison?: boolean;
}

export interface CloneTemplate {
  id: string;
  name: string;
  description: string;
  modifications: Partial<Recipe>;
  options: CloneOptions;
}

// Pre-defined clone templates for common use cases
export const CLONE_TEMPLATES: CloneTemplate[] = [
  {
    id: 'exact_copy',
    name: 'Exact Copy',
    description: 'Create an identical copy with a new name',
    modifications: {},
    options: {
      addSuffix: true,
      suffixPattern: 'Copy',
      preserveCollections: true,
      preserveRatings: true,
      preserveFavorite: false
    }
  },
  {
    id: 'experiment_base',
    name: 'Experiment Base',
    description: 'Copy as starting point for experimentation (clear ratings)',
    modifications: {},
    options: {
      addSuffix: true,
      suffixPattern: 'Experiment',
      preserveCollections: true,
      preserveRatings: false,
      preserveFavorite: false
    }
  },
  {
    id: 'grind_variation',
    name: 'Grind Variation',
    description: 'Copy for testing different grind sizes',
    modifications: {
      sensationRecord: {
        overallImpression: undefined,
        acidity: undefined,
        body: undefined,
        sweetness: undefined,
        flavor: undefined,
        aftertaste: undefined,
        balance: undefined,
        tastingNotes: 'Grind variation experiment - adjust grinder setting and compare results'
      }
    },
    options: {
      addSuffix: true,
      suffixPattern: 'Grind Test',
      preserveCollections: false,
      preserveRatings: false,
      preserveFavorite: false
    }
  },
  {
    id: 'ratio_variation',
    name: 'Ratio Variation',
    description: 'Copy for testing different coffee-to-water ratios',
    modifications: {
      measurements: {
        coffeeBeans: undefined,
        water: undefined,
        coffeeWaterRatio: undefined,
        tds: undefined,
        extractionYield: undefined
      },
      sensationRecord: {
        overallImpression: undefined,
        acidity: undefined,
        body: undefined,
        sweetness: undefined,
        flavor: undefined,
        aftertaste: undefined,
        balance: undefined,
        tastingNotes: 'Ratio variation experiment - adjust coffee-to-water ratio and compare'
      }
    },
    options: {
      addSuffix: true,
      suffixPattern: 'Ratio Test',
      preserveCollections: false,
      preserveRatings: false,
      preserveFavorite: false
    }
  },
  {
    id: 'temperature_variation',
    name: 'Temperature Variation',
    description: 'Copy for testing different water temperatures',
    modifications: {
      brewingParameters: {
        waterTemperature: undefined
      },
      sensationRecord: {
        overallImpression: undefined,
        acidity: undefined,
        body: undefined,
        sweetness: undefined,
        flavor: undefined,
        aftertaste: undefined,
        balance: undefined,
        tastingNotes: 'Temperature variation experiment - adjust water temperature and compare'
      }
    },
    options: {
      addSuffix: true,
      suffixPattern: 'Temp Test',
      preserveCollections: false,
      preserveRatings: false,
      preserveFavorite: false
    }
  },
  {
    id: 'method_variation',
    name: 'Method Variation',
    description: 'Copy for trying a different brewing method',
    modifications: {
      brewingParameters: {
        brewingMethod: undefined,
        filteringTools: undefined,
        turbulence: undefined,
        additionalNotes: 'Method variation - experimenting with different brewing technique'
      },
      sensationRecord: {
        overallImpression: undefined,
        acidity: undefined,
        body: undefined,
        sweetness: undefined,
        flavor: undefined,
        aftertaste: undefined,
        balance: undefined,
        tastingNotes: 'Brewing method experiment - compare results with original method'
      }
    },
    options: {
      addSuffix: true,
      suffixPattern: 'Method Test',
      preserveCollections: false,
      preserveRatings: false,
      preserveFavorite: false
    }
  }
];

class RecipeCloneService {
  private readonly RECENT_CLONES_KEY = 'coffeeTracker_recentClones';
  private readonly MAX_RECENT_CLONES = 10;

  // Clone a recipe with specified options
  async cloneRecipe(
    recipeId: string, 
    options: CloneOptions = {},
    template?: CloneTemplate
  ): Promise<{ success: boolean; data?: Recipe; error?: string }> {
    try {
      // First, get the original recipe
      const originalResponse = await recipeService.getRecipe(recipeId);
      if (!originalResponse.success || !originalResponse.data) {
        return { success: false, error: 'Could not load original recipe' };
      }

      const originalRecipe = originalResponse.data;

      // Apply template modifications if provided
      let clonedRecipe = { ...originalRecipe };
      if (template) {
        clonedRecipe = this.applyTemplateModifications(clonedRecipe, template);
        options = { ...template.options, ...options }; // Merge options
      }

      // Generate new name
      const newName = this.generateClonedName(originalRecipe.recipeName, options);
      
      // Create the cloned recipe data
      const cloneData = this.prepareCloneData(clonedRecipe, newName, options);

      // Create the new recipe
      const createResponse = await recipeService.createRecipe(cloneData);
      
      if (createResponse.success && createResponse.data) {
        // Add to recent clones history
        this.addToRecentClones({
          originalId: recipeId,
          originalName: originalRecipe.recipeName,
          cloneId: createResponse.data.recipeId,
          cloneName: createResponse.data.recipeName,
          templateUsed: template?.id,
          clonedAt: new Date().toISOString()
        });

        return { success: true, data: createResponse.data };
      } else {
        return { success: false, error: createResponse.error || 'Failed to create clone' };
      }
    } catch (error) {
      console.error('Recipe cloning failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unexpected error during cloning' 
      };
    }
  }

  // Batch clone multiple recipes
  async batchCloneRecipes(
    recipeIds: string[],
    options: CloneOptions = {}
  ): Promise<{ 
    success: boolean; 
    results: Array<{ 
      originalId: string; 
      success: boolean; 
      cloneId?: string; 
      error?: string 
    }>; 
    summary: { 
      total: number; 
      successful: number; 
      failed: number 
    } 
  }> {
    const results = [];
    let successful = 0;

    for (const recipeId of recipeIds) {
      try {
        const cloneResult = await this.cloneRecipe(recipeId, options);
        if (cloneResult.success && cloneResult.data) {
          results.push({
            originalId: recipeId,
            success: true,
            cloneId: cloneResult.data.recipeId
          });
          successful++;
        } else {
          results.push({
            originalId: recipeId,
            success: false,
            error: cloneResult.error || 'Unknown error'
          });
        }
      } catch (error) {
        results.push({
          originalId: recipeId,
          success: false,
          error: error instanceof Error ? error.message : 'Unexpected error'
        });
      }
    }

    return {
      success: true,
      results,
      summary: {
        total: recipeIds.length,
        successful,
        failed: recipeIds.length - successful
      }
    };
  }

  // Apply template modifications to recipe
  private applyTemplateModifications(recipe: Recipe, template: CloneTemplate): Recipe {
    const modified = { ...recipe };

    // Apply modifications from template
    Object.keys(template.modifications).forEach(key => {
      const modifications = template.modifications[key as keyof Recipe];
      if (modifications && typeof modifications === 'object') {
        modified[key as keyof Recipe] = {
          ...(modified[key as keyof Recipe] as any),
          ...modifications
        };
      } else {
        (modified as any)[key] = modifications;
      }
    });

    return modified;
  }

  // Generate a name for the cloned recipe
  private generateClonedName(originalName: string, options: CloneOptions): string {
    if (options.newName) {
      return options.newName;
    }

    if (options.addSuffix) {
      const suffix = options.suffixPattern || 'Copy';
      const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      
      // Check if name already has a suffix to avoid "Copy Copy Copy"
      const existingSuffixRegex = new RegExp(`\\s+(${suffix}|Copy|Experiment|Test)\\s*(\\d+|\\(\\d+\\))?$`, 'i');
      const cleanName = originalName.replace(existingSuffixRegex, '');
      
      return `${cleanName} ${suffix} (${timestamp})`;
    }

    return `${originalName} - Clone`;
  }

  // Prepare clone data with appropriate modifications
  private prepareCloneData(recipe: Recipe, newName: string, options: CloneOptions): any {
    const cloneData: any = {
      recipeName: newName,
      beanInfo: { ...recipe.beanInfo },
      brewingParameters: { ...recipe.brewingParameters },
      measurements: { ...recipe.measurements },
      sensationRecord: { ...recipe.sensationRecord }
    };

    // Handle collections
    if (options.preserveCollections) {
      cloneData.collections = [...(recipe.collections || [])];
    } else {
      cloneData.collections = [];
    }

    // Handle favorite status
    cloneData.isFavorite = options.preserveFavorite || false;

    // Handle ratings
    if (!options.preserveRatings) {
      cloneData.sensationRecord = {
        overallImpression: undefined,
        acidity: undefined,
        body: undefined,
        sweetness: undefined,
        flavor: undefined,
        aftertaste: undefined,
        balance: undefined,
        tastingNotes: cloneData.sensationRecord.tastingNotes || ''
      };
    }

    return cloneData;
  }

  // Get recent clone history
  getRecentClones(): Array<{
    originalId: string;
    originalName: string;
    cloneId: string;
    cloneName: string;
    templateUsed?: string;
    clonedAt: string;
  }> {
    try {
      const stored = localStorage.getItem(this.RECENT_CLONES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load recent clones:', error);
      return [];
    }
  }

  // Add to recent clones history
  private addToRecentClones(cloneInfo: {
    originalId: string;
    originalName: string;
    cloneId: string;
    cloneName: string;
    templateUsed?: string;
    clonedAt: string;
  }): void {
    try {
      const recent = this.getRecentClones();
      recent.unshift(cloneInfo);
      
      // Keep only the most recent clones
      if (recent.length > this.MAX_RECENT_CLONES) {
        recent.splice(this.MAX_RECENT_CLONES);
      }
      
      localStorage.setItem(this.RECENT_CLONES_KEY, JSON.stringify(recent));
    } catch (error) {
      console.error('Failed to save recent clone:', error);
    }
  }

  // Clear recent clones history
  clearRecentClones(): void {
    try {
      localStorage.removeItem(this.RECENT_CLONES_KEY);
    } catch (error) {
      console.error('Failed to clear recent clones:', error);
    }
  }

  // Get clone statistics
  getCloneStatistics(): {
    totalClones: number;
    mostUsedTemplate?: string;
    recentActivity: number;
    averageClonesPerWeek: number;
  } {
    const recent = this.getRecentClones();
    
    if (recent.length === 0) {
      return {
        totalClones: 0,
        recentActivity: 0,
        averageClonesPerWeek: 0
      };
    }

    // Count template usage
    const templateCounts = recent.reduce((acc, clone) => {
      if (clone.templateUsed) {
        acc[clone.templateUsed] = (acc[clone.templateUsed] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostUsedTemplate = Object.keys(templateCounts).reduce((a, b) => 
      templateCounts[a] > templateCounts[b] ? a : b, 
      Object.keys(templateCounts)[0]
    );

    // Calculate recent activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentActivity = recent.filter(clone => 
      new Date(clone.clonedAt) >= weekAgo
    ).length;

    // Calculate average per week (based on available data)
    const oldestClone = recent[recent.length - 1];
    const daysSinceFirst = oldestClone 
      ? (Date.now() - new Date(oldestClone.clonedAt).getTime()) / (1000 * 60 * 60 * 24)
      : 1;
    const weeksSinceFirst = Math.max(daysSinceFirst / 7, 1);
    const averageClonesPerWeek = recent.length / weeksSinceFirst;

    return {
      totalClones: recent.length,
      mostUsedTemplate,
      recentActivity,
      averageClonesPerWeek: Math.round(averageClonesPerWeek * 10) / 10
    };
  }

  // Suggest clone template based on recipe characteristics
  suggestTemplate(recipe: Recipe): CloneTemplate | null {
    // Simple heuristics for template suggestions
    const rating = recipe.sensationRecord?.overallImpression;
    const hasDetailedRatings = [
      recipe.sensationRecord?.acidity,
      recipe.sensationRecord?.body,
      recipe.sensationRecord?.sweetness
    ].some(r => r !== undefined);

    if (!rating || rating < 6) {
      // Low rating - suggest experiment base
      return CLONE_TEMPLATES.find(t => t.id === 'experiment_base') || null;
    }

    if (rating >= 8 && hasDetailedRatings) {
      // High rating - suggest exact copy to preserve
      return CLONE_TEMPLATES.find(t => t.id === 'exact_copy') || null;
    }

    // Default to experiment base for medium ratings
    return CLONE_TEMPLATES.find(t => t.id === 'experiment_base') || null;
  }
}

export const recipeCloneService = new RecipeCloneService();