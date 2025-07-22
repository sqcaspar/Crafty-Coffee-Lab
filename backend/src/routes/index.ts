import { Router } from 'express';
import recipesRouter from './recipes.js';
import collectionsRouter from './collections.js';

const router = Router();

// Mount route modules
router.use('/recipes', recipesRouter);
router.use('/collections', collectionsRouter);

// API root endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Coffee Brewing Recipe Tracker API',
    version: '1.0.0',
    endpoints: {
      recipes: '/api/recipes',
      collections: '/api/collections',
      health: '/api/health'
    },
    documentation: {
      recipes: {
        'GET /api/recipes': 'Get all recipes',
        'GET /api/recipes/:id': 'Get recipe by ID',
        'POST /api/recipes': 'Create new recipe',
        'PUT /api/recipes/:id': 'Update recipe',
        'DELETE /api/recipes/:id': 'Delete recipe',
        'PATCH /api/recipes/:id/favorite': 'Toggle favorite status',
        'GET /api/recipes/stats/count': 'Get recipe count'
      },
      collections: {
        'GET /api/collections': 'Get all collections',
        'GET /api/collections/:id': 'Get collection by ID',
        'POST /api/collections': 'Create new collection',
        'PUT /api/collections/:id': 'Update collection',
        'DELETE /api/collections/:id': 'Delete collection',
        'POST /api/collections/:id/recipes/:recipeId': 'Add recipe to collection',
        'DELETE /api/collections/:id/recipes/:recipeId': 'Remove recipe from collection',
        'GET /api/collections/:id/recipes': 'Get recipes in collection',
        'GET /api/collections/stats/count': 'Get collection count'
      }
    }
  });
});

export default router;