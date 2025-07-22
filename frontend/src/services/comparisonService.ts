import { Recipe, RecipeSummary } from '../../../shared/src/types/recipe';
import { recipeService } from './recipeService';

export interface ComparisonItem {
  recipe: Recipe;
  selected: boolean;
}

export interface ComparisonAnalysis {
  commonOrigins: string[];
  commonMethods: string[];
  averageRatio: number;
  ratioRange: { min: number; max: number };
  averageRating: number;
  ratingRange: { min: number; max: number };
  averageTDS: number | null;
  tdsRange: { min: number; max: number } | null;
  commonGrinders: string[];
  strengthComparison: 'similar' | 'varied' | 'wide_range';
  recommendations: string[];
}

class RecipeComparisonService {
  private readonly STORAGE_KEY = 'coffeeTracker_comparison';
  private readonly MAX_COMPARISON_ITEMS = 4;

  // Get current comparison list
  getComparisonList(): string[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load comparison list:', error);
      return [];
    }
  }

  // Add recipe to comparison
  addToComparison(recipeId: string): boolean {
    try {
      const currentList = this.getComparisonList();
      
      if (currentList.includes(recipeId)) {
        return false; // Already in comparison
      }
      
      if (currentList.length >= this.MAX_COMPARISON_ITEMS) {
        return false; // Max items reached
      }
      
      const updatedList = [...currentList, recipeId];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedList));
      return true;
    } catch (error) {
      console.error('Failed to add to comparison:', error);
      return false;
    }
  }

  // Remove recipe from comparison
  removeFromComparison(recipeId: string): boolean {
    try {
      const currentList = this.getComparisonList();
      const updatedList = currentList.filter(id => id !== recipeId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedList));
      return true;
    } catch (error) {
      console.error('Failed to remove from comparison:', error);
      return false;
    }
  }

  // Clear all comparisons
  clearComparison(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear comparison:', error);
    }
  }

  // Check if recipe is in comparison
  isInComparison(recipeId: string): boolean {
    return this.getComparisonList().includes(recipeId);
  }

  // Get comparison count
  getComparisonCount(): number {
    return this.getComparisonList().length;
  }

  // Get max comparison items
  getMaxComparisonItems(): number {
    return this.MAX_COMPARISON_ITEMS;
  }

  // Load full recipe data for comparison
  async loadComparisonRecipes(): Promise<ComparisonItem[]> {
    const recipeIds = this.getComparisonList();
    const comparisonItems: ComparisonItem[] = [];

    for (const recipeId of recipeIds) {
      try {
        const response = await recipeService.getRecipe(recipeId);
        if (response.success && response.data) {
          comparisonItems.push({
            recipe: response.data,
            selected: true
          });
        }
      } catch (error) {
        console.error(`Failed to load recipe ${recipeId} for comparison:`, error);
      }
    }

    return comparisonItems;
  }

  // Analyze comparison data
  analyzeComparison(recipes: Recipe[]): ComparisonAnalysis {
    if (recipes.length === 0) {
      return this.getEmptyAnalysis();
    }

    // Extract data for analysis
    const origins = recipes.map(r => r.beanInfo?.origin).filter(Boolean) as string[];
    const methods = recipes.map(r => r.brewingParameters?.brewingMethod).filter(Boolean) as string[];
    const ratios = recipes.map(r => r.measurements?.coffeeWaterRatio).filter(Boolean) as number[];
    const ratings = recipes.map(r => r.sensationRecord?.overallImpression).filter(Boolean) as number[];
    const tdsValues = recipes.map(r => r.measurements?.tds).filter(Boolean) as number[];
    const grinders = recipes.map(r => r.brewingParameters?.grinderModel).filter(Boolean) as string[];

    // Common origins and methods
    const commonOrigins = this.findCommonItems(origins);
    const commonMethods = this.findCommonItems(methods);
    const commonGrinders = this.findCommonItems(grinders);

    // Statistical analysis
    const averageRatio = ratios.length > 0 ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;
    const ratioRange = ratios.length > 0 ? { min: Math.min(...ratios), max: Math.max(...ratios) } : { min: 0, max: 0 };

    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const ratingRange = ratings.length > 0 ? { min: Math.min(...ratings), max: Math.max(...ratings) } : { min: 0, max: 0 };

    const averageTDS = tdsValues.length > 0 ? tdsValues.reduce((a, b) => a + b, 0) / tdsValues.length : null;
    const tdsRange = tdsValues.length > 0 ? { min: Math.min(...tdsValues), max: Math.max(...tdsValues) } : null;

    // Strength comparison analysis
    const strengthComparison = this.analyzeStrengthVariation(ratios, tdsValues);

    // Generate recommendations
    const recommendations = this.generateRecommendations(recipes, {
      commonOrigins,
      commonMethods,
      ratioRange,
      ratingRange,
      strengthComparison
    });

    return {
      commonOrigins,
      commonMethods,
      averageRatio: Math.round(averageRatio * 100) / 100,
      ratioRange,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingRange,
      averageTDS,
      tdsRange,
      commonGrinders,
      strengthComparison,
      recommendations
    };
  }

  // Find common items in arrays
  private findCommonItems(items: string[]): string[] {
    const counts = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .filter(([, count]) => count > 1)
      .map(([item]) => item);
  }

  // Analyze strength variation
  private analyzeStrengthVariation(ratios: number[], tdsValues: number[]): 'similar' | 'varied' | 'wide_range' {
    if (ratios.length < 2) return 'similar';

    const ratioVariation = Math.max(...ratios) - Math.min(...ratios);
    const tdsVariation = tdsValues.length > 1 ? Math.max(...tdsValues) - Math.min(...tdsValues) : 0;

    if (ratioVariation <= 2 && tdsVariation <= 0.2) {
      return 'similar';
    } else if (ratioVariation <= 5 && tdsVariation <= 0.5) {
      return 'varied';
    } else {
      return 'wide_range';
    }
  }

  // Generate recommendations based on analysis
  private generateRecommendations(
    recipes: Recipe[], 
    analysis: Partial<ComparisonAnalysis>
  ): string[] {
    const recommendations: string[] = [];

    // Rating-based recommendations
    if (analysis.ratingRange && analysis.ratingRange.max - analysis.ratingRange.min > 2) {
      const topRecipe = recipes.find(r => r.sensationRecord?.overallImpression === analysis.ratingRange?.max);
      if (topRecipe) {
        recommendations.push(`Try replicating the parameters from "${topRecipe.recipeName}" - it has the highest rating.`);
      }
    }

    // Ratio recommendations
    if (analysis.ratioRange && analysis.ratioRange.max - analysis.ratioRange.min > 3) {
      recommendations.push(`Consider experimenting with ratios between ${analysis.ratioRange.min}:1 and ${analysis.ratioRange.max}:1 to find your sweet spot.`);
    }

    // Origin recommendations
    if (analysis.commonOrigins && analysis.commonOrigins.length > 0) {
      recommendations.push(`You seem to enjoy ${analysis.commonOrigins[0]} coffees - consider exploring different processing methods from this region.`);
    }

    // Method recommendations
    if (analysis.commonMethods && analysis.commonMethods.length > 0) {
      recommendations.push(`Your ${analysis.commonMethods[0]} brews show consistency - try fine-tuning grind size and timing.`);
    }

    // Strength recommendations
    if (analysis.strengthComparison === 'wide_range') {
      recommendations.push(`Your recipes vary widely in strength - consider standardizing your ratio for more consistent results.`);
    } else if (analysis.strengthComparison === 'similar') {
      recommendations.push(`Your brewing strength is consistent - experiment with different origins or processing methods for flavor variety.`);
    }

    return recommendations.slice(0, 3); // Limit to 3 recommendations
  }

  // Get empty analysis structure
  private getEmptyAnalysis(): ComparisonAnalysis {
    return {
      commonOrigins: [],
      commonMethods: [],
      averageRatio: 0,
      ratioRange: { min: 0, max: 0 },
      averageRating: 0,
      ratingRange: { min: 0, max: 0 },
      averageTDS: null,
      tdsRange: null,
      commonGrinders: [],
      strengthComparison: 'similar',
      recommendations: []
    };
  }

  // Export comparison data
  exportComparison(recipes: Recipe[], format: 'csv' | 'json' = 'csv'): string {
    if (format === 'json') {
      return JSON.stringify({
        comparison: recipes,
        analysis: this.analyzeComparison(recipes),
        exportDate: new Date().toISOString()
      }, null, 2);
    }

    // CSV format
    const headers = [
      'Recipe Name', 'Origin', 'Brewing Method', 'Ratio', 'Rating', 'TDS',
      'Grinder', 'Water Temp', 'Roast Level', 'Overall Impression'
    ];

    const rows = recipes.map(recipe => [
      recipe.recipeName,
      recipe.beanInfo?.origin || '',
      recipe.brewingParameters?.brewingMethod || '',
      recipe.measurements?.coffeeWaterRatio?.toString() || '',
      recipe.sensationRecord?.overallImpression?.toString() || '',
      recipe.measurements?.tds?.toString() || '',
      recipe.brewingParameters?.grinderModel || '',
      recipe.brewingParameters?.waterTemperature?.toString() || '',
      recipe.beanInfo?.roastingLevel || '',
      recipe.sensationRecord?.overallImpression?.toString() || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }
}

export const comparisonService = new RecipeComparisonService();