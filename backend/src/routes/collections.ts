import { Router, Request, Response } from 'express';
import { CollectionModel } from '../database/index.js';
import { validateBody, validateUUIDParam, asyncHandler, createApiError } from '../middleware/index.js';
import { 
  CollectionInputSchema, 
  CollectionUpdateSchema,
  UUIDSchema,
  type ApiResponse,
  type CollectionResponse,
  type CollectionListResponse 
} from '../shared/index.js';

const router = Router();

/**
 * GET /api/collections
 * Get all collections
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  try {
    const collections = await CollectionModel.findAll();
    
    const response: CollectionListResponse = {
      success: true,
      data: collections,
      message: `Retrieved ${collections.length} collections`
    };
    
    res.json(response);
  } catch (error) {
    throw createApiError.internalServer('Failed to retrieve collections');
  }
}));

/**
 * GET /api/collections/:id
 * Get a specific collection by ID
 */
router.get('/:id', validateUUIDParam, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const collection = await CollectionModel.findById(id);
    
    if (!collection) {
      throw createApiError.notFound('Collection not found');
    }
    
    const response: CollectionResponse = {
      success: true,
      data: collection,
      message: 'Collection retrieved successfully'
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === 'Collection not found') {
      throw error;
    }
    throw createApiError.internalServer('Failed to retrieve collection');
  }
}));

/**
 * POST /api/collections
 * Create a new collection
 */
router.post('/', validateBody(CollectionInputSchema), asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, description, color = 'blue', isPrivate = false, isDefault = false, tags = [] } = req.body;
    
    // Check if collection name already exists
    const existingCollection = await CollectionModel.findByName(name);
    if (existingCollection) {
      throw createApiError.conflict('A collection with this name already exists');
    }
    
    const collectionInput = {
      name,
      description,
      color,
      isPrivate,
      isDefault,
      tags
    };
    
    const collection = await CollectionModel.create(collectionInput);
    
    const response: CollectionResponse = {
      success: true,
      data: collection,
      message: 'Collection created successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    if (error instanceof Error && error.message === 'A collection with this name already exists') {
      throw error;
    }
    throw createApiError.internalServer('Failed to create collection');
  }
}));

/**
 * PUT /api/collections/:id
 * Update an existing collection
 */
router.put('/:id', validateUUIDParam, validateBody(CollectionUpdateSchema), asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const { id } = req.params as { id: string };
    
    // Check if collection exists
    const existingCollection = await CollectionModel.findById(id);
    if (!existingCollection) {
      throw createApiError.notFound('Collection not found');
    }
    
    // Check if new name conflicts with existing collection (excluding current)
    if (name && name !== existingCollection.name) {
      const nameExists = await CollectionModel.nameExists(name, id);
      if (nameExists) {
        throw createApiError.conflict('A collection with this name already exists');
      }
    }
    
    const updatedCollection = await CollectionModel.update(id, req.body);
    
    if (!updatedCollection) {
      throw createApiError.internalServer('Failed to update collection');
    }
    
    const response: CollectionResponse = {
      success: true,
      data: updatedCollection,
      message: 'Collection updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof Error && (
      error.message === 'Collection not found' || 
      error.message === 'A collection with this name already exists' ||
      error.message === 'Failed to update collection'
    )) {
      throw error;
    }
    throw createApiError.internalServer('Failed to update collection');
  }
}));

/**
 * DELETE /api/collections/:id
 * Delete a collection
 */
router.delete('/:id', validateUUIDParam, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    // Check if collection exists
    const existingCollection = await CollectionModel.findById(id);
    if (!existingCollection) {
      throw createApiError.notFound('Collection not found');
    }
    
    // Delete the collection (this will also remove recipe associations due to CASCADE)
    const deleted = await CollectionModel.delete(id);
    
    if (!deleted) {
      throw createApiError.internalServer('Failed to delete collection');
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Collection deleted successfully'
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof Error && (error.message === 'Collection not found' || error.message === 'Failed to delete collection')) {
      throw error;
    }
    throw createApiError.internalServer('Failed to delete collection');
  }
}));

/**
 * POST /api/collections/:id/recipes/:recipeId
 * Add a recipe to a collection
 */
router.post('/:id/recipes/:recipeId', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id: collectionId, recipeId } = req.params as { id: string, recipeId: string };
    
    // Validate collection ID
    const collectionIdValidation = UUIDSchema.safeParse(collectionId);
    if (!collectionIdValidation.success) {
      throw createApiError.badRequest('Collection ID must be a valid UUID');
    }
    
    // Validate recipe ID
    const recipeIdValidation = UUIDSchema.safeParse(recipeId);
    if (!recipeIdValidation.success) {
      throw createApiError.badRequest('Recipe ID must be a valid UUID');
    }
    
    // Check if collection exists
    const collection = await CollectionModel.findById(collectionId);
    if (!collection) {
      throw createApiError.notFound('Collection not found');
    }
    
    // Add recipe to collection
    const added = await CollectionModel.addRecipe(collectionId, recipeId);
    
    if (!added) {
      throw createApiError.internalServer('Failed to add recipe to collection');
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Recipe added to collection successfully'
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof Error && (
      error.message === 'Collection not found' ||
      error.message === 'Recipe ID must be a valid UUID' ||
      error.message === 'Failed to add recipe to collection'
    )) {
      throw error;
    }
    throw createApiError.internalServer('Failed to add recipe to collection');
  }
}));

/**
 * DELETE /api/collections/:id/recipes/:recipeId
 * Remove a recipe from a collection
 */
router.delete('/:id/recipes/:recipeId', asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id: collectionId, recipeId } = req.params as { id: string, recipeId: string };
    
    // Validate collection ID
    const collectionIdValidation = UUIDSchema.safeParse(collectionId);
    if (!collectionIdValidation.success) {
      throw createApiError.badRequest('Collection ID must be a valid UUID');
    }
    
    // Validate recipe ID
    const recipeIdValidation = UUIDSchema.safeParse(recipeId);
    if (!recipeIdValidation.success) {
      throw createApiError.badRequest('Recipe ID must be a valid UUID');
    }
    
    // Check if collection exists
    const collection = await CollectionModel.findById(collectionId);
    if (!collection) {
      throw createApiError.notFound('Collection not found');
    }
    
    // Remove recipe from collection
    const removed = await CollectionModel.removeRecipe(collectionId, recipeId);
    
    if (!removed) {
      throw createApiError.notFound('Recipe not found in collection');
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Recipe removed from collection successfully'
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof Error && (
      error.message === 'Collection not found' ||
      error.message === 'Recipe ID must be a valid UUID' ||
      error.message === 'Recipe not found in collection'
    )) {
      throw error;
    }
    throw createApiError.internalServer('Failed to remove recipe from collection');
  }
}));

/**
 * GET /api/collections/:id/recipes
 * Get all recipes in a collection
 */
router.get('/:id/recipes', validateUUIDParam, asyncHandler(async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const collection = await CollectionModel.findById(id);
    
    if (!collection) {
      throw createApiError.notFound('Collection not found');
    }
    
    // For now, just return the recipe IDs
    // In a full implementation, you might want to fetch the actual recipe objects
    const response: ApiResponse<{ recipeIds: string[] }> = {
      success: true,
      data: { recipeIds: collection.recipeIds },
      message: `Retrieved ${collection.recipeIds.length} recipes from collection`
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === 'Collection not found') {
      throw error;
    }
    throw createApiError.internalServer('Failed to retrieve collection recipes');
  }
}));

/**
 * GET /api/collections/stats/count
 * Get total count of collections
 */
router.get('/stats/count', asyncHandler(async (req: Request, res: Response) => {
  try {
    const count = await CollectionModel.count();
    
    const response: ApiResponse<{ count: number }> = {
      success: true,
      data: { count },
      message: `Total collections: ${count}`
    };
    
    res.json(response);
  } catch (error) {
    throw createApiError.internalServer('Failed to get collection count');
  }
}));

export default router;