import { z } from 'zod';

// Collection validation schema
export const CollectionSchema = z.object({
  id: z.string().uuid('Collection ID must be a valid UUID'),
  name: z.string().min(1, 'Collection name is required').max(100, 'Collection name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  createdDate: z.string().datetime('Created date must be a valid datetime'),
  recipeIds: z.array(z.string().uuid('Each recipe ID must be a valid UUID')).default([])
});

// Collection Input validation schema (for creation)
export const CollectionInputSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100, 'Collection name must be 100 characters or less'),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  color: z.enum(['blue', 'green', 'orange', 'red', 'purple', 'teal', 'pink', 'indigo', 'gray']).default('blue'),
  isPrivate: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  tags: z.array(z.string()).default([])
});

// Collection Update validation schema (partial updates allowed)
export const CollectionUpdateSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100, 'Collection name must be 100 characters or less').optional(),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
  color: z.enum(['blue', 'green', 'orange', 'red', 'purple', 'teal', 'pink', 'indigo', 'gray']).optional(),
  isPrivate: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

// Collection Summary validation schema
export const CollectionSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  createdDate: z.string().datetime(),
  recipeCount: z.number().int().min(0),
  sampleRecipeNames: z.array(z.string())
});

// Recipe Collection Association validation schema
export const RecipeCollectionAssociationSchema = z.object({
  recipeId: z.string().uuid('Recipe ID must be a valid UUID'),
  collectionId: z.string().uuid('Collection ID must be a valid UUID'),
  addedDate: z.string().datetime('Added date must be a valid datetime')
});

// Custom validation functions
export const validateCollection = (data: unknown) => {
  return CollectionSchema.safeParse(data);
};

export const validateCollectionInput = (data: unknown) => {
  return CollectionInputSchema.safeParse(data);
};

export const validateCollectionUpdate = (data: unknown) => {
  return CollectionUpdateSchema.safeParse(data);
};

// Collection name uniqueness validation (custom function)
export const validateCollectionNameUniqueness = (name: string, existingNames: string[], excludeId?: string) => {
  const normalizedName = name.trim().toLowerCase();
  const conflictingName = existingNames.find(existing => 
    existing.toLowerCase() === normalizedName
  );
  
  return {
    isValid: !conflictingName,
    error: conflictingName ? 'Collection name already exists' : undefined
  };
};

// Transform function to prepare collection input
export const transformCollectionInput = (input: z.infer<typeof CollectionInputSchema>) => {
  // Trim whitespace from name and description
  return {
    ...input,
    name: input.name.trim(),
    description: input.description?.trim() || undefined
  };
};

// Export type inference helpers
export type CollectionSchemaType = z.infer<typeof CollectionSchema>;
export type CollectionInputSchemaType = z.infer<typeof CollectionInputSchema>;
export type CollectionUpdateSchemaType = z.infer<typeof CollectionUpdateSchema>;