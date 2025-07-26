import { z } from 'zod';
import { RoastingLevel, BrewingMethod, TurbulenceStep, EvaluationSystem, TraditionalSCAEvaluation, CVADescriptiveAssessment, CVAAffectiveAssessment } from '../types/recipe.js';
import { CoffeeOrigin, ALL_COFFEE_ORIGINS } from '../constants/coffeeOrigins.js';
import { ProcessingMethod, ALL_PROCESSING_METHODS } from '../constants/processingMethods.js';
import { MIN_WATER_TEMPERATURE, MAX_WATER_TEMPERATURE } from '../constants/waterTemperature.js';
import { GrinderModel, ALL_GRINDER_MODELS } from '../constants/grinderModels.js';
import { MIN_GRINDER_SETTING, MAX_GRINDER_SETTING } from '../constants/grinderSettings.js';
import { FilteringTool, ALL_FILTERING_TOOLS } from '../constants/filteringTools.js';

// Zod enum schemas
export const RoastingLevelSchema = z.nativeEnum(RoastingLevel);
export const BrewingMethodSchema = z.nativeEnum(BrewingMethod);
export const CoffeeOriginSchema = z.nativeEnum(CoffeeOrigin);
export const ProcessingMethodSchema = z.nativeEnum(ProcessingMethod);
export const FilteringToolSchema = z.nativeEnum(FilteringTool);

// Individual Bean Information field schemas for isolated validation
export const OriginFieldSchema = CoffeeOriginSchema;
export const ProcessingMethodFieldSchema = ProcessingMethodSchema;
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
export const WaterTemperatureFieldSchema = z.number().int().min(MIN_WATER_TEMPERATURE, `Temperature must be at least ${MIN_WATER_TEMPERATURE}°C`).max(MAX_WATER_TEMPERATURE, `Temperature must not exceed ${MAX_WATER_TEMPERATURE}°C`).optional();
export const BrewingMethodFieldSchema = BrewingMethodSchema.optional();
// GrinderModel supports both predefined enum values and custom strings (when "Others" is selected)
export const GrinderModelFieldSchema = z.string().min(1, 'Grinder model is required').max(100, 'Grinder model must be 100 characters or less');
// GrinderUnit supports both numeric strings (1-40) and descriptive strings for backward compatibility
export const GrinderUnitFieldSchema = z.string().min(1, 'Grinder setting is required').max(50, 'Grinder setting must be 50 characters or less');
// FilteringTools supports both enum values (Paper, Metal, Cloth) and descriptive strings for backward compatibility
export const FilteringToolsFieldSchema = z.string().max(100, 'Filtering tools must be 100 characters or less').optional();

// TurbulenceStep schema for structured brewing steps
export const TurbulenceStepSchema = z.object({
  actionTime: z.string().min(1, 'Action time is required').max(10, 'Action time must be 10 characters or less'),
  actionDetails: z.string().min(1, 'Action details are required').max(100, 'Action details must be 100 characters or less'),
  volume: z.string().min(1, 'Volume is required').max(20, 'Volume must be 20 characters or less')
});

// Turbulence supports both legacy string format and new structured steps for backward compatibility
export const TurbulenceFieldSchema = z.union([
  z.string().max(200, 'Turbulence description must be 200 characters or less'),
  z.array(TurbulenceStepSchema).min(1, 'At least one turbulence step is required').max(10, 'Maximum 10 turbulence steps allowed')
]).optional();

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
export const BrewedCoffeeWeightFieldSchema = z.number().positive('Brewed coffee weight must be positive').max(1000, 'Brewed coffee weight must be reasonable').optional();
export const TdsFieldSchema = z.number().min(0, 'TDS must be positive').max(100, 'TDS percentage must be 100% or less').optional();
export const ExtractionYieldFieldSchema = z.number().min(0, 'Extraction yield must be positive').max(100, 'Extraction yield must be 100% or less').optional();

// Measurements validation schema
export const MeasurementsSchema = z.object({
  coffeeBeans: CoffeeBeansFieldSchema,
  water: WaterFieldSchema,
  coffeeWaterRatio: CoffeeWaterRatioFieldSchema,
  brewedCoffeeWeight: BrewedCoffeeWeightFieldSchema,
  tds: TdsFieldSchema,
  extractionYield: ExtractionYieldFieldSchema
});

// Measurements Input schema (for form submission)
export const MeasurementsInputSchema = z.object({
  coffeeBeans: CoffeeBeansFieldSchema,
  water: WaterFieldSchema,
  coffeeWaterRatio: CoffeeWaterRatioFieldSchema.optional(),
  brewedCoffeeWeight: BrewedCoffeeWeightFieldSchema,
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

// SCA/CVA Evaluation System Validation Schemas

// Evaluation System enum schema
export const EvaluationSystemSchema = z.enum(['traditional-sca', 'cva-descriptive', 'cva-affective', 'quick-tasting', 'legacy']);

// Traditional SCA Cupping Form validation (6-10 point scale with 0.25 increments)
export const TraditionalSCAEvaluationSchema = z.object({
  // Quality attributes (6.00-10.00 points with 0.25 increments)
  fragrance: z.number().min(6, 'Fragrance score must be at least 6').max(10, 'Fragrance score must not exceed 10').multipleOf(0.25, 'Fragrance must be in 0.25 increments').optional(),
  aroma: z.number().min(6, 'Aroma score must be at least 6').max(10, 'Aroma score must not exceed 10').multipleOf(0.25, 'Aroma must be in 0.25 increments').optional(),
  flavor: z.number().min(6, 'Flavor score must be at least 6').max(10, 'Flavor score must not exceed 10').multipleOf(0.25, 'Flavor must be in 0.25 increments').optional(),
  aftertaste: z.number().min(6, 'Aftertaste score must be at least 6').max(10, 'Aftertaste score must not exceed 10').multipleOf(0.25, 'Aftertaste must be in 0.25 increments').optional(),
  acidity: z.number().min(6, 'Acidity score must be at least 6').max(10, 'Acidity score must not exceed 10').multipleOf(0.25, 'Acidity must be in 0.25 increments').optional(),
  acidityIntensity: z.enum(['High', 'Medium', 'Low']).optional(),
  body: z.number().min(6, 'Body score must be at least 6').max(10, 'Body score must not exceed 10').multipleOf(0.25, 'Body must be in 0.25 increments').optional(),
  bodyLevel: z.enum(['Heavy', 'Medium', 'Thin']).optional(),
  balance: z.number().min(6, 'Balance score must be at least 6').max(10, 'Balance score must not exceed 10').multipleOf(0.25, 'Balance must be in 0.25 increments').optional(),
  overall: z.number().min(6, 'Overall score must be at least 6').max(10, 'Overall score must not exceed 10').multipleOf(0.25, 'Overall must be in 0.25 increments').optional(),
  
  // Cup characteristics (0-10 points, 2 points per cup)
  uniformity: z.number().min(0, 'Uniformity score must be at least 0').max(10, 'Uniformity score must not exceed 10').multipleOf(2, 'Uniformity must be in 2-point increments').optional(),
  cleanCup: z.number().min(0, 'Clean Cup score must be at least 0').max(10, 'Clean Cup score must not exceed 10').multipleOf(2, 'Clean Cup must be in 2-point increments').optional(),
  sweetness: z.number().min(0, 'Sweetness score must be at least 0').max(10, 'Sweetness score must not exceed 10').multipleOf(2, 'Sweetness must be in 2-point increments').optional(),
  
  // Defect penalties (negative values)
  taintDefects: z.number().min(0, 'Taint defects cannot be negative').max(20, 'Maximum 10 taint defects allowed').multipleOf(2, 'Taint defects must be in 2-point increments').optional(),
  faultDefects: z.number().min(0, 'Fault defects cannot be negative').max(40, 'Maximum 10 fault defects allowed').multipleOf(4, 'Fault defects must be in 4-point increments').optional(),
  
  // Calculated final score (36-100 range)
  finalScore: z.number().min(36, 'Final score must be at least 36').max(100, 'Final score must not exceed 100').multipleOf(0.25, 'Final score must be in 0.25 increments').optional()
}).optional();

// CVA Descriptive Assessment validation (0-15 intensity scale)
export const CVADescriptiveAssessmentSchema = z.object({
  // Intensity ratings (0-15 integer scale)
  fragrance: z.number().int().min(0, 'Fragrance intensity must be at least 0').max(15, 'Fragrance intensity must not exceed 15').optional(),
  aroma: z.number().int().min(0, 'Aroma intensity must be at least 0').max(15, 'Aroma intensity must not exceed 15').optional(),
  flavor: z.number().int().min(0, 'Flavor intensity must be at least 0').max(15, 'Flavor intensity must not exceed 15').optional(),
  aftertaste: z.number().int().min(0, 'Aftertaste intensity must be at least 0').max(15, 'Aftertaste intensity must not exceed 15').optional(),
  acidity: z.number().int().min(0, 'Acidity intensity must be at least 0').max(15, 'Acidity intensity must not exceed 15').optional(),
  sweetness: z.number().int().min(0, 'Sweetness intensity must be at least 0').max(15, 'Sweetness intensity must not exceed 15').optional(),
  mouthfeel: z.number().int().min(0, 'Mouthfeel intensity must be at least 0').max(15, 'Mouthfeel intensity must not exceed 15').optional(),
  
  // CATA descriptor selections with limits
  fragranceAromaDescriptors: z.array(z.string()).max(5, 'Maximum 5 fragrance/aroma descriptors allowed').optional(),
  flavorAftertasteDescriptors: z.array(z.string()).max(5, 'Maximum 5 flavor/aftertaste descriptors allowed').optional(),
  mainTastes: z.array(z.enum(['salty', 'sour', 'sweet', 'bitter', 'umami'])).max(2, 'Maximum 2 main tastes allowed').optional(),
  mouthfeelDescriptors: z.array(z.enum(['metallic', 'rough', 'oily', 'smooth', 'mouth-drying'])).max(2, 'Maximum 2 mouthfeel descriptors allowed').optional(),
  
  // Free text descriptors
  acidityDescriptors: z.string().max(500, 'Acidity descriptors must be 500 characters or less').optional(),
  sweetnessDescriptors: z.string().max(500, 'Sweetness descriptors must be 500 characters or less').optional(),
  additionalNotes: z.string().max(1000, 'Additional notes must be 1000 characters or less').optional(),
  
  // Assessment metadata
  roastLevel: z.string().max(50, 'Roast level must be 50 characters or less').optional(),
  assessmentDate: z.string().datetime().optional(),
  assessorId: z.string().max(50, 'Assessor ID must be 50 characters or less').optional()
}).optional();

// CVA Affective Assessment validation (1-9 quality scale)
export const CVAAffectiveAssessmentSchema = z.object({
  // Quality impression ratings (1-9 integer scale)
  fragrance: z.number().int().min(1, 'Fragrance quality must be at least 1').max(9, 'Fragrance quality must not exceed 9').optional(),
  aroma: z.number().int().min(1, 'Aroma quality must be at least 1').max(9, 'Aroma quality must not exceed 9').optional(),
  flavor: z.number().int().min(1, 'Flavor quality must be at least 1').max(9, 'Flavor quality must not exceed 9').optional(),
  aftertaste: z.number().int().min(1, 'Aftertaste quality must be at least 1').max(9, 'Aftertaste quality must not exceed 9').optional(),
  acidity: z.number().int().min(1, 'Acidity quality must be at least 1').max(9, 'Acidity quality must not exceed 9').optional(),
  sweetness: z.number().int().min(1, 'Sweetness quality must be at least 1').max(9, 'Sweetness quality must not exceed 9').optional(),
  mouthfeel: z.number().int().min(1, 'Mouthfeel quality must be at least 1').max(9, 'Mouthfeel quality must not exceed 9').optional(),
  overall: z.number().int().min(1, 'Overall quality must be at least 1').max(9, 'Overall quality must not exceed 9').optional(),
  
  // Cup uniformity and defect counts (0-5 cups each)
  nonUniformCups: z.number().int().min(0, 'Non-uniform cups cannot be negative').max(5, 'Maximum 5 non-uniform cups').optional(),
  defectiveCups: z.number().int().min(0, 'Defective cups cannot be negative').max(5, 'Maximum 5 defective cups').optional(),
  
  // Calculated CVA score (58.00-100.00, rounded to nearest 0.25)
  cvaScore: z.number().min(58, 'CVA score must be at least 58').max(100, 'CVA score must not exceed 100').multipleOf(0.25, 'CVA score must be rounded to nearest 0.25').optional()
}).optional();

// Helper function to check if at least one tasting field is filled
const hasAtLeastOneTastingField = (data: any): boolean => {
  // Check legacy Quick Tasting fields
  const legacyFields = [
    data.overallImpression,
    data.acidity,
    data.body,
    data.sweetness,
    data.flavor,
    data.aftertaste,
    data.balance,
    data.tastingNotes
  ];
  
  const hasLegacyField = legacyFields.some(field => 
    field !== undefined && field !== null && field !== ''
  );
  
  // Check Traditional SCA fields
  const scaData = data.traditionalSCA;
  const hasScaField = scaData && Object.values(scaData).some(field => 
    field !== undefined && field !== null && field !== ''
  );
  
  // Check CVA Descriptive fields
  const cvaDescriptiveData = data.cvaDescriptive;
  const hasCvaDescriptiveField = cvaDescriptiveData && Object.values(cvaDescriptiveData).some(field => 
    field !== undefined && field !== null && field !== ''
  );
  
  // Check CVA Affective fields
  const cvaAffectiveData = data.cvaAffective;
  const hasCvaAffectiveField = cvaAffectiveData && Object.values(cvaAffectiveData).some(field => 
    field !== undefined && field !== null && field !== ''
  );
  
  return hasLegacyField || hasScaField || hasCvaDescriptiveField || hasCvaAffectiveField;
};

// Updated Sensation Record schema with new evaluation systems
export const SensationRecordWithEvaluationSchema = z.object({
  // Evaluation system indicator
  evaluationSystem: EvaluationSystemSchema.optional(),
  
  // Legacy fields (maintain backwards compatibility)
  overallImpression: z.number().int().min(1, 'Overall impression must be at least 1').max(10, 'Overall impression must be at most 10').optional(),
  acidity: z.number().int().min(1, 'Acidity must be at least 1').max(10, 'Acidity must be at most 10').optional(),
  body: z.number().int().min(1, 'Body must be at least 1').max(10, 'Body must be at most 10').optional(),
  sweetness: z.number().int().min(1, 'Sweetness must be at least 1').max(10, 'Sweetness must be at most 10').optional(),
  flavor: z.number().int().min(1, 'Flavor must be at least 1').max(10, 'Flavor must be at most 10').optional(),
  aftertaste: z.number().int().min(1, 'Aftertaste must be at least 1').max(10, 'Aftertaste must be at most 10').optional(),
  balance: z.number().int().min(1, 'Balance must be at least 1').max(10, 'Balance must be at most 10').optional(),
  tastingNotes: z.string().max(2000, 'Tasting notes must be 2000 characters or less').optional(),
  
  // New evaluation systems
  traditionalSCA: TraditionalSCAEvaluationSchema,
  cvaDescriptive: CVADescriptiveAssessmentSchema,
  cvaAffective: CVAAffectiveAssessmentSchema
}).refine(hasAtLeastOneTastingField, {
  message: 'Please fill at least one field in any tasting evaluation tab (Quick Tasting, SCA Traditional, or CVA Descriptive)',
  path: ['sensationRecord']
});

// Legacy Sensation Record validation schema (1-10 scale validation)
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
  sensationRecord: SensationRecordWithEvaluationSchema
});

// Recipe Input validation schema (for creation/updates)
export const RecipeInputSchema = z.object({
  recipeName: z.string().max(200, 'Recipe name must be 200 characters or less').optional(),
  isFavorite: z.boolean().default(false),
  collections: z.array(z.string()).default([]),
  
  beanInfo: BeanInfoSchema,
  brewingParameters: BrewingParametersSchema,
  measurements: MeasurementsInputSchema,
  sensationRecord: SensationRecordWithEvaluationSchema
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

