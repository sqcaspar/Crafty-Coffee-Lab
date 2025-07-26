import { Recipe, RecipeSummary, BrewingMethod, RoastingLevel } from '../shared/types/recipe';
import { recipeService } from './recipeService';
import { recipeCloneService } from './recipeCloneService';

export interface RecipeSuggestion {
  id: string;
  type: 'improvement' | 'variation' | 'new_recipe' | 'clone_template';
  title: string;
  description: string;
  confidence: number; // 0-1, how confident we are in this suggestion
  category: 'brewing_method' | 'grind_size' | 'ratio' | 'temperature' | 'origin' | 'timing';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedChanges?: {
    parameter: string;
    currentValue?: any;
    suggestedValue: any;
    reason: string;
  }[];
  relatedRecipeId?: string;
  estimatedImpact: string;
  tags: string[];
}

export interface UserPreferences {
  favoriteOrigins: string[];
  favoriteBrewingMethods: BrewingMethod[];
  averageRating: number;
  preferredRoastLevels: RoastingLevel[];
  ratingTrends: {
    improving: boolean;
    avgChange: number;
  };
  brewingFrequency: number; // recipes per week
  experimentation: {
    level: 'conservative' | 'moderate' | 'adventurous';
    recentVariations: number;
  };
  tastingPatterns: {
    prefersHighAcidity: boolean;
    prefersFullBody: boolean;
    sweetnessSeeking: boolean;
    balanceFocused: boolean;
  };
}

class RecipeSuggestionService {
  private readonly SUGGESTION_CACHE_KEY = 'coffeeTracker_suggestions';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private cachedSuggestions: RecipeSuggestion[] | null = null;
  private cacheTimestamp: number = 0;

  // Analyze user's recipe collection and generate personalized suggestions
  async generateSuggestions(forceRefresh = false): Promise<RecipeSuggestion[]> {
    // Check cache first
    if (!forceRefresh && this.cachedSuggestions && (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cachedSuggestions;
    }

    try {
      // Load all recipes
      const response = await recipeService.getAllRecipes();
      if (!response.success || !response.data || response.data.length === 0) {
        return [];
      }

      const recipes = response.data;

      // Load detailed recipes for analysis (limit to recent ones for performance)
      const recentRecipes = recipes
        .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
        .slice(0, 30);

      const detailedPromises = recentRecipes.map(r => recipeService.getRecipe(r.recipeId));
      const detailedResponses = await Promise.all(detailedPromises);
      const detailedRecipes = detailedResponses
        .filter(res => res.success && res.data)
        .map(res => res.data as Recipe);

      // Analyze user preferences
      const preferences = this.analyzeUserPreferences(recipes, detailedRecipes);

      // Generate different types of suggestions
      const suggestions: RecipeSuggestion[] = [];

      // 1. Recipe improvement suggestions
      suggestions.push(...this.generateImprovementSuggestions(detailedRecipes, preferences));

      // 2. Recipe variation suggestions
      suggestions.push(...this.generateVariationSuggestions(detailedRecipes, preferences));

      // 3. New recipe suggestions
      suggestions.push(...this.generateNewRecipeSuggestions(detailedRecipes, preferences));

      // 4. Clone template suggestions
      suggestions.push(...this.generateCloneTemplateSuggestions(detailedRecipes, preferences));

      // 5. Technique improvement suggestions
      suggestions.push(...this.generateTechniqueSuggestions(detailedRecipes, preferences));

      // Sort by priority and confidence
      const sortedSuggestions = suggestions
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return b.confidence - a.confidence;
        })
        .slice(0, 10); // Limit to top 10 suggestions

      // Cache the results
      this.cachedSuggestions = sortedSuggestions;
      this.cacheTimestamp = Date.now();

      // Persist to localStorage for next session
      try {
        localStorage.setItem(this.SUGGESTION_CACHE_KEY, JSON.stringify({
          suggestions: sortedSuggestions,
          timestamp: this.cacheTimestamp
        }));
      } catch (e) {
        console.warn('Failed to cache suggestions:', e);
      }

      return sortedSuggestions;
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      return [];
    }
  }

  // Analyze user's brewing patterns and preferences
  private analyzeUserPreferences(recipes: RecipeSummary[], detailedRecipes: Recipe[]): UserPreferences {
    const ratedRecipes = recipes.filter(r => r.overallImpression);
    const averageRating = ratedRecipes.length > 0
      ? ratedRecipes.reduce((sum, r) => sum + (r.overallImpression || 0), 0) / ratedRecipes.length
      : 6;

    // Analyze favorite origins
    const originCounts: { [key: string]: number } = {};
    recipes.forEach(r => {
      if (r.origin) {
        originCounts[r.origin] = (originCounts[r.origin] || 0) + 1;
      }
    });
    const favoriteOrigins = Object.entries(originCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([origin]) => origin);

    // Analyze favorite brewing methods
    const methodCounts: { [key: string]: number } = {};
    recipes.forEach(r => {
      if (r.brewingMethod) {
        methodCounts[r.brewingMethod] = (methodCounts[r.brewingMethod] || 0) + 1;
      }
    });
    const favoriteBrewingMethods = Object.entries(methodCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([method]) => method as BrewingMethod);

    // Analyze rating trends
    const sortedRatedRecipes = ratedRecipes
      .sort((a, b) => new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime());
    
    let ratingTrends = { improving: false, avgChange: 0 };
    if (sortedRatedRecipes.length >= 5) {
      const firstHalf = sortedRatedRecipes.slice(0, Math.floor(sortedRatedRecipes.length / 2));
      const secondHalf = sortedRatedRecipes.slice(Math.floor(sortedRatedRecipes.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, r) => sum + (r.overallImpression || 0), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, r) => sum + (r.overallImpression || 0), 0) / secondHalf.length;
      
      ratingTrends = {
        improving: secondAvg > firstAvg,
        avgChange: secondAvg - firstAvg
      };
    }

    // Analyze tasting patterns from detailed recipes
    const tastingRecipes = detailedRecipes.filter(r => 
      r.sensationRecord?.acidity !== undefined || 
      r.sensationRecord?.body !== undefined ||
      r.sensationRecord?.sweetness !== undefined ||
      r.sensationRecord?.balance !== undefined
    );

    let tastingPatterns = {
      prefersHighAcidity: false,
      prefersFullBody: false,
      sweetnessSeeking: false,
      balanceFocused: false
    };

    if (tastingRecipes.length > 0) {
      const avgAcidity = tastingRecipes.reduce((sum, r) => sum + (r.sensationRecord.acidity || 0), 0) / tastingRecipes.length;
      const avgBody = tastingRecipes.reduce((sum, r) => sum + (r.sensationRecord.body || 0), 0) / tastingRecipes.length;
      const avgSweetness = tastingRecipes.reduce((sum, r) => sum + (r.sensationRecord.sweetness || 0), 0) / tastingRecipes.length;
      const avgBalance = tastingRecipes.reduce((sum, r) => sum + (r.sensationRecord.balance || 0), 0) / tastingRecipes.length;

      tastingPatterns = {
        prefersHighAcidity: avgAcidity >= 7,
        prefersFullBody: avgBody >= 7,
        sweetnessSeeking: avgSweetness >= 7,
        balanceFocused: avgBalance >= 8
      };
    }

    // Calculate brewing frequency (recipes in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRecipes = recipes.filter(r => new Date(r.dateCreated) >= thirtyDaysAgo);
    const brewingFrequency = recentRecipes.length / 4.3; // per week

    // Determine experimentation level based on variety in recent recipes
    const recentMethods = new Set(recentRecipes.map(r => r.brewingMethod).filter(Boolean));
    const recentOrigins = new Set(recentRecipes.map(r => r.origin).filter(Boolean));
    const varietyScore = recentMethods.size + recentOrigins.size;
    
    let experimentationLevel: 'conservative' | 'moderate' | 'adventurous' = 'moderate';
    if (varietyScore <= 3) experimentationLevel = 'conservative';
    else if (varietyScore >= 8) experimentationLevel = 'adventurous';

    return {
      favoriteOrigins,
      favoriteBrewingMethods,
      averageRating,
      preferredRoastLevels: [], // Could be analyzed if roast level data is available
      ratingTrends,
      brewingFrequency,
      experimentation: {
        level: experimentationLevel,
        recentVariations: varietyScore
      },
      tastingPatterns
    };
  }

  // Generate suggestions for improving existing recipes
  private generateImprovementSuggestions(recipes: Recipe[], preferences: UserPreferences): RecipeSuggestion[] {
    const suggestions: RecipeSuggestion[] = [];

    // Find recipes with lower ratings that could be improved
    const lowRatedRecipes = recipes.filter(r => 
      r.sensationRecord?.overallImpression && r.sensationRecord.overallImpression < preferences.averageRating - 0.5
    );

    lowRatedRecipes.forEach((recipe, index) => {
      if (index >= 3) return; // Limit suggestions

      const rating = recipe.sensationRecord.overallImpression!;
      const suggestions_list = this.analyzeRecipeForImprovements(recipe, preferences);

      if (suggestions_list.length > 0) {
        suggestions.push({
          id: `improve-${recipe.recipeId}`,
          type: 'improvement',
          title: `Improve "${recipe.recipeName}"`,
          description: `This recipe rated ${rating.toFixed(1)}/10. Here are some suggestions to enhance it.`,
          confidence: 0.7 + (preferences.averageRating - rating) * 0.1,
          category: 'brewing_method',
          priority: rating < 5 ? 'high' : 'medium',
          actionable: true,
          suggestedChanges: suggestions_list,
          relatedRecipeId: recipe.recipeId,
          estimatedImpact: `+${(0.5 + Math.random() * 1.0).toFixed(1)} rating points`,
          tags: ['improvement', 'personalized', 'brewing technique']
        });
      }
    });

    return suggestions;
  }

  // Analyze a specific recipe for potential improvements
  private analyzeRecipeForImprovements(recipe: Recipe, preferences: UserPreferences): any[] {
    const improvements = [];
    const sensation = recipe.sensationRecord;

    // Analyze grind size based on acidity and body
    if (sensation.acidity && sensation.body) {
      if (sensation.acidity < 5 && sensation.body > 7) {
        improvements.push({
          parameter: 'Grind Size',
          currentValue: recipe.brewingParameters.grinderUnit,
          suggestedValue: 'Finer grind',
          reason: 'Low acidity with full body suggests under-extraction. A finer grind could increase brightness.'
        });
      } else if (sensation.acidity > 8 && sensation.body < 5) {
        improvements.push({
          parameter: 'Grind Size',
          currentValue: recipe.brewingParameters.grinderUnit,
          suggestedValue: 'Coarser grind',
          reason: 'High acidity with thin body suggests over-extraction. A coarser grind could improve balance.'
        });
      }
    }

    // Analyze coffee-to-water ratio
    if (recipe.measurements.coffeeBeans && recipe.measurements.water) {
      const ratio = recipe.measurements.water / recipe.measurements.coffeeBeans;
      if (sensation.flavor && sensation.flavor < 6 && ratio > 16) {
        improvements.push({
          parameter: 'Coffee-to-Water Ratio',
          currentValue: `1:${ratio.toFixed(1)}`,
          suggestedValue: '1:15 to 1:16',
          reason: 'Weak flavor with high ratio suggests under-concentration. Try using more coffee.'
        });
      }
    }

    // Analyze water temperature
    if (recipe.brewingParameters.waterTemperature && sensation.balance) {
      const temp = recipe.brewingParameters.waterTemperature;
      if (sensation.balance < 6) {
        if (temp > 95) {
          improvements.push({
            parameter: 'Water Temperature',
            currentValue: `${temp}°C`,
            suggestedValue: '90-94°C',
            reason: 'High temperature may be causing harsh extraction. Try lowering temperature for better balance.'
          });
        } else if (temp < 85) {
          improvements.push({
            parameter: 'Water Temperature',
            currentValue: `${temp}°C`,
            suggestedValue: '90-95°C',
            reason: 'Low temperature may be causing under-extraction. Try higher temperature for better balance.'
          });
        }
      }
    }

    return improvements.slice(0, 3); // Limit to top 3 improvements
  }

  // Generate variation suggestions based on successful recipes
  private generateVariationSuggestions(recipes: Recipe[], preferences: UserPreferences): RecipeSuggestion[] {
    const suggestions: RecipeSuggestion[] = [];

    // Find highly rated recipes to create variations from
    const highRatedRecipes = recipes.filter(r => 
      r.sensationRecord?.overallImpression && r.sensationRecord.overallImpression >= preferences.averageRating + 0.5
    ).sort((a, b) => (b.sensationRecord.overallImpression || 0) - (a.sensationRecord.overallImpression || 0));

    highRatedRecipes.slice(0, 2).forEach(recipe => {
      // Suggest origin variations
      if (recipe.beanInfo.origin && !preferences.favoriteOrigins.includes(recipe.beanInfo.origin)) {
        const suggestedOrigin = preferences.favoriteOrigins[0];
        if (suggestedOrigin) {
          suggestions.push({
            id: `variation-origin-${recipe.recipeId}`,
            type: 'variation',
            title: `Try ${suggestedOrigin} with your "${recipe.recipeName}" technique`,
            description: `Your ${recipe.beanInfo.origin} recipe rated ${recipe.sensationRecord.overallImpression?.toFixed(1)}/10. Try the same parameters with ${suggestedOrigin} beans.`,
            confidence: 0.6,
            category: 'origin',
            priority: 'medium',
            actionable: true,
            suggestedChanges: [{
              parameter: 'Origin',
              currentValue: recipe.beanInfo.origin,
              suggestedValue: suggestedOrigin,
              reason: `${suggestedOrigin} is one of your favorite origins and could work well with this brewing technique.`
            }],
            relatedRecipeId: recipe.recipeId,
            estimatedImpact: 'Similar or better results with familiar flavors',
            tags: ['variation', 'origin', 'personalized']
          });
        }
      }

      // Suggest brewing method variations
      if (recipe.brewingParameters.brewingMethod && preferences.favoriteBrewingMethods.length > 0) {
        const currentMethod = recipe.brewingParameters.brewingMethod;
        const alternativeMethod = preferences.favoriteBrewingMethods.find(m => m !== currentMethod);
        
        if (alternativeMethod) {
          suggestions.push({
            id: `variation-method-${recipe.recipeId}`,
            type: 'variation',
            title: `Try ${alternativeMethod.replace('_', ' ').toLowerCase()} with ${recipe.beanInfo.origin || 'these beans'}`,
            description: `Your ${currentMethod.replace('_', ' ').toLowerCase()} recipe was excellent. Try these beans with your preferred ${alternativeMethod.replace('_', ' ').toLowerCase()} method.`,
            confidence: 0.5,
            category: 'brewing_method',
            priority: 'low',
            actionable: true,
            relatedRecipeId: recipe.recipeId,
            estimatedImpact: 'Explore different flavor profiles',
            tags: ['variation', 'brewing method', 'exploration']
          });
        }
      }
    });

    return suggestions;
  }

  // Generate completely new recipe suggestions
  private generateNewRecipeSuggestions(recipes: Recipe[], preferences: UserPreferences): RecipeSuggestion[] {
    const suggestions: RecipeSuggestion[] = [];

    // Suggest unexplored origins
    const triedOrigins = new Set(recipes.map(r => r.beanInfo.origin).filter(Boolean));
    const suggestedOrigins = ['Kenya', 'Panama', 'Jamaica', 'Yemen', 'Hawaii', 'Peru', 'Bolivia']
      .filter(origin => !triedOrigins.has(origin));

    if (suggestedOrigins.length > 0 && preferences.experimentation.level !== 'conservative') {
      const newOrigin = suggestedOrigins[0];
      suggestions.push({
        id: `new-origin-${newOrigin}`,
        type: 'new_recipe',
        title: `Explore ${newOrigin} coffee`,
        description: `Based on your preferences for ${preferences.favoriteOrigins.join(' and ')}, ${newOrigin} coffee could offer exciting new flavors.`,
        confidence: preferences.experimentation.level === 'adventurous' ? 0.7 : 0.5,
        category: 'origin',
        priority: 'low',
        actionable: true,
        estimatedImpact: 'Discover new flavor profiles',
        tags: ['new recipe', 'exploration', 'origin']
      });
    }

    // Suggest method combinations
    if (preferences.favoriteBrewingMethods.length >= 2 && preferences.experimentation.level === 'adventurous') {
      suggestions.push({
        id: 'hybrid-method',
        type: 'new_recipe',
        title: 'Hybrid brewing technique',
        description: `Combine techniques from ${preferences.favoriteBrewingMethods[0]} and ${preferences.favoriteBrewingMethods[1]} for unique results.`,
        confidence: 0.4,
        category: 'brewing_method',
        priority: 'low',
        actionable: false,
        estimatedImpact: 'Innovative brewing experience',
        tags: ['new recipe', 'experimental', 'technique']
      });
    }

    return suggestions;
  }

  // Generate clone template suggestions
  private generateCloneTemplateSuggestions(recipes: Recipe[], preferences: UserPreferences): RecipeSuggestion[] {
    const suggestions: RecipeSuggestion[] = [];
    
    // Get clone statistics
    const cloneStats = recipeCloneService.getCloneStatistics();
    
    if (cloneStats.totalClones < 3 && recipes.length >= 5) {
      // Suggest trying recipe cloning
      const bestRecipe = recipes
        .filter(r => r.sensationRecord?.overallImpression)
        .sort((a, b) => (b.sensationRecord.overallImpression || 0) - (a.sensationRecord.overallImpression || 0))[0];

      if (bestRecipe && (bestRecipe.sensationRecord.overallImpression || 0) >= 7) {
        suggestions.push({
          id: 'try-cloning',
          type: 'clone_template',
          title: 'Experiment with recipe variations',
          description: `Clone your best recipe "${bestRecipe.recipeName}" to try different parameters without losing the original.`,
          confidence: 0.8,
          category: 'grind_size',
          priority: 'medium',
          actionable: true,
          relatedRecipeId: bestRecipe.recipeId,
          estimatedImpact: 'Safe experimentation platform',
          tags: ['cloning', 'experimentation', 'optimization']
        });
      }
    }

    return suggestions;
  }

  // Generate general technique improvement suggestions
  private generateTechniqueSuggestions(recipes: Recipe[], preferences: UserPreferences): RecipeSuggestion[] {
    const suggestions: RecipeSuggestion[] = [];

    // Check for missing measurements that could improve tracking
    const recipesWithoutTDS = recipes.filter(r => !r.measurements.tds);
    if (recipesWithoutTDS.length > recipes.length * 0.7) {
      suggestions.push({
        id: 'measure-tds',
        type: 'improvement',
        title: 'Start measuring TDS (Total Dissolved Solids)',
        description: 'Adding TDS measurements will help you dial in extraction more precisely and track improvements.',
        confidence: 0.6,
        category: 'timing',
        priority: 'medium',
        actionable: true,
        estimatedImpact: 'Better extraction consistency',
        tags: ['technique', 'measurement', 'precision']
      });
    }

    // Suggest tasting note improvements if notes are sparse
    const recipesWithNotes = recipes.filter(r => 
      r.sensationRecord.tastingNotes && r.sensationRecord.tastingNotes.length > 10
    );
    if (recipesWithNotes.length < recipes.length * 0.3) {
      suggestions.push({
        id: 'improve-tasting-notes',
        type: 'improvement',
        title: 'Develop your tasting vocabulary',
        description: 'More detailed tasting notes will help you identify patterns and preferences in your brewing.',
        confidence: 0.5,
        category: 'timing',
        priority: 'low',
        actionable: true,
        estimatedImpact: 'Better flavor understanding',
        tags: ['technique', 'tasting', 'notes']
      });
    }

    return suggestions;
  }

  // Clear cached suggestions
  clearSuggestions(): void {
    this.cachedSuggestions = null;
    this.cacheTimestamp = 0;
    try {
      localStorage.removeItem(this.SUGGESTION_CACHE_KEY);
    } catch (e) {
      console.warn('Failed to clear suggestion cache:', e);
    }
  }

  // Load suggestions from localStorage cache
  loadCachedSuggestions(): RecipeSuggestion[] {
    try {
      const cached = localStorage.getItem(this.SUGGESTION_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.suggestions && (Date.now() - data.timestamp) < this.CACHE_DURATION) {
          this.cachedSuggestions = data.suggestions;
          this.cacheTimestamp = data.timestamp;
          return data.suggestions;
        }
      }
    } catch (e) {
      console.warn('Failed to load cached suggestions:', e);
    }
    return [];
  }
}

export const recipeSuggestionService = new RecipeSuggestionService();