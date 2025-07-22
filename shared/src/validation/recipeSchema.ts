import { z } from 'zod';
import { RoastingLevel, BrewingMethod } from '../types/recipe.js';

// Zod enum schemas
export const RoastingLevelSchema = z.nativeEnum(RoastingLevel);
export const BrewingMethodSchema = z.nativeEnum(BrewingMethod);

// Bean Information validation schema
export const BeanInfoSchema = z.object({
  origin: z.string().min(1, 'Origin is required').max(100, 'Origin must be 100 characters or less'),
  processingMethod: z.string().min(1, 'Processing method is required').max(50, 'Processing method must be 50 characters or less'),
  altitude: z.number().int().min(0, 'Altitude must be positive').max(10000, 'Altitude must be reasonable').optional(),
  roastingDate: z.string().datetime().optional(),
  roastingLevel: RoastingLevelSchema.optional()
});

// Brewing Parameters validation schema
export const BrewingParametersSchema = z.object({
  waterTemperature: z.number().min(0, 'Temperature must be positive').max(120, 'Temperature must be reasonable').optional(),
  brewingMethod: BrewingMethodSchema.optional(),
  grinderModel: z.string().min(1, 'Grinder model is required').max(100, 'Grinder model must be 100 characters or less'),
  grinderUnit: z.string().min(1, 'Grinder unit is required').max(50, 'Grinder unit must be 50 characters or less'),
  filteringTools: z.string().max(100, 'Filtering tools must be 100 characters or less').optional(),
  turbulence: z.string().max(200, 'Turbulence description must be 200 characters or less').optional(),
  additionalNotes: z.string().max(1000, 'Additional notes must be 1000 characters or less').optional()
});

// Measurements validation schema
export const MeasurementsSchema = z.object({
  coffeeBeans: z.number().positive('Coffee beans amount must be positive').max(1000, 'Coffee beans amount must be reasonable'),
  water: z.number().positive('Water amount must be positive').max(10000, 'Water amount must be reasonable'),
  coffeeWaterRatio: z.number().positive('Coffee to water ratio must be positive'),
  tds: z.number().min(0, 'TDS must be positive').max(100, 'TDS percentage must be 100% or less').optional(),
  extractionYield: z.number().min(0, 'Extraction yield must be positive').max(100, 'Extraction yield must be 100% or less').optional()
});

// Measurements Input schema (for form submission)
export const MeasurementsInputSchema = z.object({
  coffeeBeans: z.number().positive('Coffee beans amount must be positive').max(1000, 'Coffee beans amount must be reasonable'),
  water: z.number().positive('Water amount must be positive').max(10000, 'Water amount must be reasonable'),
  coffeeWaterRatio: z.number().positive('Coffee to water ratio must be positive').optional(),
  tds: z.number().min(0, 'TDS must be positive').max(100, 'TDS percentage must be 100% or less').optional(),
  extractionYield: z.number().min(0, 'Extraction yield must be positive').max(100, 'Extraction yield must be 100% or less').optional()
});

// Sensation Record validation schema (1-10 scale validation)
export const SensationRecordSchema = z.object({
  overallImpression: z.number().int().min(1, 'Overall impression must be at least 1').max(10, 'Overall impression must be at most 10'),
  acidity: z.number().int().min(1, 'Acidity must be at least 1').max(10, 'Acidity must be at most 10').optional(),
  body: z.number().int().min(1, 'Body must be at least 1').max(10, 'Body must be at most 10').optional(),
  sweetness: z.number().int().min(1, 'Sweetness must be at least 1').max(10, 'Sweetness must be at most 10').optional(),
  flavor: z.number().int().min(1, 'Flavor must be at least 1').max(10, 'Flavor must be at most 10').optional(),
  aftertaste: z.number().int().min(1, 'Aftertaste must be at least 1').max(10, 'Aftertaste must be at most 10').optional(),
  balance: z.number().int().min(1, 'Balance must be at least 1').max(10, 'Balance must be at most 10').optional(),
  tastingNotes: z.string().max(2000, 'Tasting notes must be 2000 characters or less').optional()
});

// Complete Recipe validation schema
export const RecipeSchema = z.object({
  recipeId: z.string().uuid('Recipe ID must be a valid UUID'),
  recipeName: z.string().min(1, 'Recipe name is required').max(200, 'Recipe name must be 200 characters or less'),
  dateCreated: z.string().datetime('Date created must be a valid datetime'),
  dateModified: z.string().datetime('Date modified must be a valid datetime'),
  isFavorite: z.boolean(),
  collections: z.array(z.string()).default([]),
  
  beanInfo: BeanInfoSchema,
  brewingParameters: BrewingParametersSchema,
  measurements: MeasurementsSchema,
  sensationRecord: SensationRecordSchema
});

// Recipe Input validation schema (for creation/updates)
export const RecipeInputSchema = z.object({
  recipeName: z.string().max(200, 'Recipe name must be 200 characters or less').optional(),
  isFavorite: z.boolean().default(false),
  collections: z.array(z.string()).default([]),
  
  beanInfo: BeanInfoSchema,
  brewingParameters: BrewingParametersSchema,
  measurements: MeasurementsInputSchema,
  sensationRecord: SensationRecordSchema
});

// Recipe Update schema (partial updates allowed)
export const RecipeUpdateSchema = RecipeInputSchema.partial();

// Recipe Summary schema
export const RecipeSummarySchema = z.object({
  recipeId: z.string().uuid(),
  recipeName: z.string(),
  dateCreated: z.string().datetime(),
  dateModified: z.string().datetime(),
  isFavorite: z.boolean(),
  origin: z.string(),
  brewingMethod: BrewingMethodSchema.optional(),
  overallImpression: z.number().int().min(1).max(10),
  coffeeWaterRatio: z.number().positive(),
  collections: z.array(z.string())
});

// Custom validation functions
export const validateRecipe = (data: unknown) => {
  return RecipeSchema.safeParse(data);
};

export const validateRecipeInput = (data: unknown) => {
  return RecipeInputSchema.safeParse(data);
};

export const validateRecipeUpdate = (data: unknown) => {
  return RecipeUpdateSchema.safeParse(data);
};

// Transform function to prepare recipe input with calculated fields
export const transformRecipeInput = (input: z.infer<typeof RecipeInputSchema>): z.infer<typeof RecipeInputSchema> & { recipeName: string } => {
  const transformed = { ...input };
  
  // Calculate coffee-to-water ratio if not provided
  if (!transformed.measurements.coffeeWaterRatio && transformed.measurements.coffeeBeans && transformed.measurements.water) {
    transformed.measurements.coffeeWaterRatio = Math.round((transformed.measurements.water / transformed.measurements.coffeeBeans) * 100) / 100;
  }
  
  // Generate recipe name if not provided
  if (!transformed.recipeName?.trim()) {
    const date = new Date().toLocaleDateString();
    transformed.recipeName = `${transformed.beanInfo.origin} - ${date}`;
  }
  
  return { ...transformed, recipeName: transformed.recipeName || 'Unknown Recipe' };
};

// Export type inference helpers
export type RecipeSchemaType = z.infer<typeof RecipeSchema>;
export type RecipeInputSchemaType = z.infer<typeof RecipeInputSchema>;
export type RecipeUpdateSchemaType = z.infer<typeof RecipeUpdateSchema>;