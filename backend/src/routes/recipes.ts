import { Router, Request, Response } from 'express';
import { RecipeModel } from '../database/index.js';
import { validateUUIDParam, asyncHandler, createApiError } from '../middleware/index.js';
import { 
  transformRecipeInput,
  type ApiResponse,
  type RecipeResponse,
  type RecipeListResponse,
  type RecipeInput 
} from '../shared/index.js';

const router = Router();

/**
 * GET /api/recipes
 * Get all recipes with optional filtering and sorting
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const recipes = await RecipeModel.findAll();
    
    const response: RecipeListResponse = {
      success: true,
      data: recipes,
      message: `Retrieved ${recipes.length} recipes`
    };
    
    res.json(response);
  } catch (error) {
    throw createApiError.internalServer('Failed to retrieve recipes');
  }
}));

/**
 * GET /api/recipes/:id
 * Get a specific recipe by ID
 */
router.get('/:id', validateUUIDParam, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const recipe = await RecipeModel.findById(id);
    
    if (!recipe) {
      throw createApiError.notFound('Recipe not found');
    }
    
    const response: RecipeResponse = {
      success: true,
      data: recipe,
      message: 'Recipe retrieved successfully'
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === 'Recipe not found') {
      throw error;
    }
    throw createApiError.internalServer('Failed to retrieve recipe');
  }
}));

/**
 * POST /api/recipes
 * Create a new recipe
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  console.log('=== POST /api/recipes - Starting recipe creation ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    // Log the transformation step
    console.log('Transforming input data...');
    const transformedInput = transformRecipeInput(req.body);
    console.log('Transformed input:', JSON.stringify(transformedInput, null, 2));
    
    // Log the database creation step
    console.log('Creating recipe in database...');
    const recipe = await RecipeModel.create(transformedInput as RecipeInput);
    console.log('Recipe created successfully:', recipe.recipe_id);
    
    const response: RecipeResponse = {
      success: true,
      data: recipe,
      message: 'Recipe created successfully'
    };
    
    console.log('=== POST /api/recipes - Success ===');
    res.status(201).json(response);
  } catch (error) {
    console.error('=== POST /api/recipes - Error ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof Error && error.message.includes('UNIQUE constraint')) {
      console.log('Throwing conflict error for duplicate recipe');
      throw createApiError.conflict('A recipe with this name already exists');
    }
    
    console.log('Throwing internal server error');
    throw createApiError.internalServer(`Failed to create recipe: ${error instanceof Error ? error.message : String(error)}`);
  }
}));

/**
 * PUT /api/recipes/:id
 * Update an existing recipe
 */
router.put('/:id', validateUUIDParam, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    // Check if recipe exists
    const existingRecipe = await RecipeModel.findById(id);
    if (!existingRecipe) {
      throw createApiError.notFound('Recipe not found');
    }
    
    // Transform input data
    const transformedInput = transformRecipeInput(req.body);
    
    // Update the recipe
    const updatedRecipe = await RecipeModel.update(id, transformedInput as RecipeInput);
    
    if (!updatedRecipe) {
      throw createApiError.internalServer('Failed to update recipe');
    }
    
    const response: RecipeResponse = {
      success: true,
      data: updatedRecipe,
      message: 'Recipe updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Recipe not found' || error.message === 'Failed to update recipe') {
        throw error;
      }
      if (error.message.includes('UNIQUE constraint')) {
        throw createApiError.conflict('A recipe with this name already exists');
      }
    }
    throw createApiError.internalServer('Failed to update recipe');
  }
}));

/**
 * DELETE /api/recipes/:id
 * Delete a recipe
 */
router.delete('/:id', validateUUIDParam, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    // Check if recipe exists
    const existingRecipe = await RecipeModel.findById(id);
    if (!existingRecipe) {
      throw createApiError.notFound('Recipe not found');
    }
    
    // Delete the recipe
    const deleted = await RecipeModel.delete(id);
    
    if (!deleted) {
      throw createApiError.internalServer('Failed to delete recipe');
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Recipe deleted successfully'
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Recipe not found' || error.message === 'Failed to delete recipe')) {
      throw error;
    }
    throw createApiError.internalServer('Failed to delete recipe');
  }
}));

/**
 * PATCH /api/recipes/:id/favorite
 * Toggle favorite status of a recipe
 */
router.patch('/:id/favorite', validateUUIDParam, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const recipe = await RecipeModel.toggleFavorite(id);
    
    if (!recipe) {
      throw createApiError.notFound('Recipe not found');
    }
    
    const response: RecipeResponse = {
      success: true,
      data: recipe,
      message: `Recipe ${recipe.isFavorite ? 'added to' : 'removed from'} favorites`
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === 'Recipe not found') {
      throw error;
    }
    throw createApiError.internalServer('Failed to toggle favorite status');
  }
}));

/**
 * GET /api/recipes/count
 * Get total count of recipes
 */
router.get('/stats/count', asyncHandler(async (req: Request, res: Response) => {
  try {
    const count = await RecipeModel.count();
    
    const response: ApiResponse<{ count: number }> = {
      success: true,
      data: { count },
      message: `Total recipes: ${count}`
    };
    
    res.json(response);
  } catch (error) {
    throw createApiError.internalServer('Failed to get recipe count');
  }
}));

/**
 * GET /api/recipes/export/csv
 * Export all recipes as CSV
 */
router.get('/export/csv', asyncHandler(async (req: Request, res: Response) => {
  try {
    const recipes = await RecipeModel.findAll();
    
    // Generate CSV headers
    const headers = [
      'Recipe Name', 'Date Created', 'Date Modified', 'Is Favorite', 'Collections',
      'Origin', 'Processing Method', 'Altitude', 'Roasting Date', 'Roasting Level',
      'Water Temperature', 'Brewing Method', 'Grinder Model', 'Grind Setting', 'Filter Tools',
      'Coffee (g)', 'Water (g)', 'Ratio', 'TDS (%)', 'Extraction Yield (%)',
      'Overall Rating', 'Acidity', 'Body', 'Sweetness', 'Flavor', 'Aftertaste', 'Balance', 'Tasting Notes'
    ];
    
    // Generate CSV rows
    const rows = recipes.map(recipe => [
      recipe.recipeName,
      recipe.dateCreated,
      recipe.dateModified,
      recipe.isFavorite ? 'Yes' : 'No',
      recipe.collections.join('; '),
      recipe.beanInfo.origin,
      recipe.beanInfo.processingMethod,
      recipe.beanInfo.altitude || '',
      recipe.beanInfo.roastingDate || '',
      recipe.beanInfo.roastingLevel || '',
      recipe.brewingParameters.waterTemperature || '',
      recipe.brewingParameters.brewingMethod || '',
      recipe.brewingParameters.grinderModel,
      recipe.brewingParameters.grinderUnit,
      recipe.brewingParameters.filteringTools || '',
      recipe.measurements.coffeeBeans,
      recipe.measurements.water,
      recipe.measurements.coffeeWaterRatio,
      recipe.measurements.tds || '',
      recipe.measurements.extractionYield || '',
      recipe.sensationRecord.overallImpression,
      recipe.sensationRecord.acidity || '',
      recipe.sensationRecord.body || '',
      recipe.sensationRecord.sweetness || '',
      recipe.sensationRecord.flavor || '',
      recipe.sensationRecord.aftertaste || '',
      recipe.sensationRecord.balance || '',
      recipe.sensationRecord.tastingNotes || ''
    ]);
    
    // Convert to CSV format
    const csvData = [headers, ...rows].map(row =>
      row.map(cell => {
        const str = String(cell || '');
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');
    
    // Set response headers for file download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `coffee_recipes_${timestamp}.csv`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    res.send(csvData);
  } catch (error) {
    throw createApiError.internalServer('Failed to export recipes');
  }
}));

/**
 * POST /api/recipes/export/filtered
 * Export filtered recipes based on criteria
 */
router.post('/export/filtered', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { 
      format = 'csv',
      filters = {},
      recipeIds = [],
      includeFullDetails = true 
    } = req.body;
    
    let recipes;
    
    // If specific recipe IDs provided, fetch those
    if (recipeIds.length > 0) {
      recipes = [];
      for (const id of recipeIds) {
        const recipe = await RecipeModel.findById(id);
        if (recipe) {
          recipes.push(recipe);
        }
      }
    } else {
      // Otherwise get all recipes (could add filtering logic here)
      recipes = await RecipeModel.findAll();
    }
    
    if (format === 'json') {
      const exportData = {
        exportDate: new Date().toISOString(),
        exportVersion: '1.0',
        totalRecipes: recipes.length,
        recipes: includeFullDetails ? recipes : recipes.map(r => ({
          recipeId: r.recipeId,
          recipeName: r.recipeName,
          dateCreated: r.dateCreated,
          dateModified: r.dateModified,
          isFavorite: r.isFavorite,
          origin: r.beanInfo.origin,
          brewingMethod: r.brewingParameters.brewingMethod,
          overallImpression: r.sensationRecord.overallImpression,
          coffeeWaterRatio: r.measurements.coffeeWaterRatio,
          collections: r.collections
        }))
      };
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `coffee_recipes_${timestamp}.json`;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      res.json(exportData);
    } else {
      // Default to CSV format
      const headers = includeFullDetails ? [
        'Recipe Name', 'Date Created', 'Date Modified', 'Is Favorite', 'Collections',
        'Origin', 'Processing Method', 'Altitude', 'Roasting Date', 'Roasting Level',
        'Water Temperature', 'Brewing Method', 'Grinder Model', 'Grind Setting', 'Filter Tools',
        'Coffee (g)', 'Water (g)', 'Ratio', 'TDS (%)', 'Extraction Yield (%)',
        'Overall Rating', 'Acidity', 'Body', 'Sweetness', 'Flavor', 'Aftertaste', 'Balance', 'Tasting Notes'
      ] : [
        'Recipe Name', 'Date Created', 'Date Modified', 'Is Favorite', 'Origin',
        'Brewing Method', 'Overall Rating', 'Coffee Ratio', 'Collections'
      ];
      
      const rows = recipes.map(recipe => includeFullDetails ? [
        recipe.recipeName,
        recipe.dateCreated,
        recipe.dateModified,
        recipe.isFavorite ? 'Yes' : 'No',
        recipe.collections.join('; '),
        recipe.beanInfo.origin,
        recipe.beanInfo.processingMethod,
        recipe.beanInfo.altitude || '',
        recipe.beanInfo.roastingDate || '',
        recipe.beanInfo.roastingLevel || '',
        recipe.brewingParameters.waterTemperature || '',
        recipe.brewingParameters.brewingMethod || '',
        recipe.brewingParameters.grinderModel,
        recipe.brewingParameters.grinderUnit,
        recipe.brewingParameters.filteringTools || '',
        recipe.measurements.coffeeBeans,
        recipe.measurements.water,
        recipe.measurements.coffeeWaterRatio,
        recipe.measurements.tds || '',
        recipe.measurements.extractionYield || '',
        recipe.sensationRecord.overallImpression,
        recipe.sensationRecord.acidity || '',
        recipe.sensationRecord.body || '',
        recipe.sensationRecord.sweetness || '',
        recipe.sensationRecord.flavor || '',
        recipe.sensationRecord.aftertaste || '',
        recipe.sensationRecord.balance || '',
        recipe.sensationRecord.tastingNotes || ''
      ] : [
        recipe.recipeName,
        recipe.dateCreated,
        recipe.dateModified,
        recipe.isFavorite ? 'Yes' : 'No',
        recipe.beanInfo.origin,
        recipe.brewingParameters.brewingMethod || '',
        recipe.sensationRecord.overallImpression,
        recipe.measurements.coffeeWaterRatio,
        recipe.collections.join('; ')
      ]);
      
      const csvData = [headers, ...rows].map(row =>
        row.map(cell => {
          const str = String(cell || '');
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        }).join(',')
      ).join('\n');
      
      const timestamp = new Date().toISOString().split('T')[0];
      const suffix = recipes.length === 1 ? 'recipe' : `${recipes.length}_recipes`;
      const filename = `coffee_${suffix}_${timestamp}.csv`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      res.send(csvData);
    }
  } catch (error) {
    throw createApiError.internalServer('Failed to export filtered recipes');
  }
}));

export default router;