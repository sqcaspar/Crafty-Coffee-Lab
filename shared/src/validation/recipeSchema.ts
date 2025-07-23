import { z } from 'zod';
import { RoastingLevel, BrewingMethod } from '../types/recipe.js';

// Zod enum schemas
export const RoastingLevelSchema = z.nativeEnum(RoastingLevel);
export const BrewingMethodSchema = z.nativeEnum(BrewingMethod);

// Individual Bean Information field schemas for isolated validation
export const OriginFieldSchema = z.string().min(1, 'Origin is required').max(100, 'Origin must be 100 characters or less');
export const ProcessingMethodFieldSchema = z.string().min(1, 'Processing method is required').max(50, 'Processing method must be 50 characters or less');
export const AltitudeFieldSchema = z.number().int().min(0, 'Altitude must be positive').max(10000, 'Altitude must be reasonable').optional();
export const RoastingDateFieldSchema = z.string().datetime().optional();
export const RoastingLevelFieldSchema = RoastingLevelSchema.optional();

// Bean Information validation schema
export const BeanInfoSchema = z.object({
  origin: OriginFieldSchema,
  processingMethod: ProcessingMethodFieldSchema,
  altitude: AltitudeFieldSchema,
  roastingDate: RoastingDateFieldSchema,
  roastingLevel: RoastingLevelFieldSchema
});

// Individual Brewing Parameters field schemas for isolated validation
export const WaterTemperatureFieldSchema = z.number().min(0, 'Temperature must be positive').max(120, 'Temperature must be reasonable').optional();
export const BrewingMethodFieldSchema = BrewingMethodSchema.optional();
export const GrinderModelFieldSchema = z.string().min(1, 'Grinder model is required').max(100, 'Grinder model must be 100 characters or less');
export const GrinderUnitFieldSchema = z.string().min(1, 'Grinder unit is required').max(50, 'Grinder unit must be 50 characters or less');
export const FilteringToolsFieldSchema = z.string().max(100, 'Filtering tools must be 100 characters or less').optional();
export const TurbulenceFieldSchema = z.string().max(200, 'Turbulence description must be 200 characters or less').optional();
export const AdditionalNotesFieldSchema = z.string().max(1000, 'Additional notes must be 1000 characters or less').optional();

// Brewing Parameters validation schema
export const BrewingParametersSchema = z.object({
  waterTemperature: WaterTemperatureFieldSchema,
  brewingMethod: BrewingMethodFieldSchema,
  grinderModel: GrinderModelFieldSchema,
  grinderUnit: GrinderUnitFieldSchema,
  filteringTools: FilteringToolsFieldSchema,
  turbulence: TurbulenceFieldSchema,
  additionalNotes: AdditionalNotesFieldSchema
});

// Individual Measurements field schemas for isolated validation
export const CoffeeBeansFieldSchema = z.number().positive('Coffee beans amount must be positive').max(1000, 'Coffee beans amount must be reasonable');
export const WaterFieldSchema = z.number().positive('Water amount must be positive').max(10000, 'Water amount must be reasonable');
export const CoffeeWaterRatioFieldSchema = z.number().positive('Coffee to water ratio must be positive');
export const TdsFieldSchema = z.number().min(0, 'TDS must be positive').max(100, 'TDS percentage must be 100% or less').optional();
export const ExtractionYieldFieldSchema = z.number().min(0, 'Extraction yield must be positive').max(100, 'Extraction yield must be 100% or less').optional();

// Measurements validation schema
export const MeasurementsSchema = z.object({
  coffeeBeans: CoffeeBeansFieldSchema,
  water: WaterFieldSchema,
  coffeeWaterRatio: CoffeeWaterRatioFieldSchema,
  tds: TdsFieldSchema,
  extractionYield: ExtractionYieldFieldSchema
});

// Measurements Input schema (for form submission)
export const MeasurementsInputSchema = z.object({
  coffeeBeans: CoffeeBeansFieldSchema,
  water: WaterFieldSchema,
  coffeeWaterRatio: CoffeeWaterRatioFieldSchema.optional(),
  tds: TdsFieldSchema,
  extractionYield: ExtractionYieldFieldSchema
});

// Individual Sensation Record field schemas for isolated validation
export const OverallImpressionFieldSchema = z.number().int().min(1, 'Overall impression must be at least 1').max(10, 'Overall impression must be at most 10');
export const AcidityFieldSchema = z.number().int().min(1, 'Acidity must be at least 1').max(10, 'Acidity must be at most 10').optional();
export const BodyFieldSchema = z.number().int().min(1, 'Body must be at least 1').max(10, 'Body must be at most 10').optional();
export const SweetnessFieldSchema = z.number().int().min(1, 'Sweetness must be at least 1').max(10, 'Sweetness must be at most 10').optional();
export const FlavorFieldSchema = z.number().int().min(1, 'Flavor must be at least 1').max(10, 'Flavor must be at most 10').optional();
export const AftertasteFieldSchema = z.number().int().min(1, 'Aftertaste must be at least 1').max(10, 'Aftertaste must be at most 10').optional();
export const BalanceFieldSchema = z.number().int().min(1, 'Balance must be at least 1').max(10, 'Balance must be at most 10').optional();
export const TastingNotesFieldSchema = z.string().max(2000, 'Tasting notes must be 2000 characters or less').optional();

// Sensation Record validation schema (1-10 scale validation)
export const SensationRecordSchema = z.object({
  overallImpression: OverallImpressionFieldSchema,
  acidity: AcidityFieldSchema,
  body: BodyFieldSchema,
  sweetness: SweetnessFieldSchema,
  flavor: FlavorFieldSchema,
  aftertaste: AftertasteFieldSchema,
  balance: BalanceFieldSchema,
  tastingNotes: TastingNotesFieldSchema
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