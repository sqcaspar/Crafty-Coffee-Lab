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
export const OriginFieldSchema = z.any().optional();
export const ProcessingMethodFieldSchema = z.any().optional();
export const AltitudeFieldSchema = z.any().optional();
export const RoastingDateFieldSchema = z.any().optional();
export const RoastingLevelFieldSchema = z.any().optional();

// Bean Information validation schema
export const BeanInfoSchema = z.object({
  origin: OriginFieldSchema,
  processingMethod: ProcessingMethodFieldSchema,
  altitude: AltitudeFieldSchema,
  roastingDate: RoastingDateFieldSchema,
  roastingLevel: RoastingLevelFieldSchema
});

// Individual Brewing Parameters field schemas for isolated validation
export const WaterTemperatureFieldSchema = z.any().optional();
export const BrewingMethodFieldSchema = z.any().optional();
// GrinderModel supports both predefined enum values and custom strings (when "Others" is selected)
export const GrinderModelFieldSchema = z.any().optional();
// GrinderUnit supports both numeric strings (1-40) and descriptive strings for backward compatibility
export const GrinderUnitFieldSchema = z.any().optional();
// FilteringTools supports both enum values (Paper, Metal, Cloth) and descriptive strings for backward compatibility
export const FilteringToolsFieldSchema = z.any().optional();

// TurbulenceStep schema for structured brewing steps - NO CONSTRAINTS
export const TurbulenceStepSchema = z.object({
  actionTime: z.any().optional(),
  actionDetails: z.any().optional(),
  volume: z.any().optional()
});

// Turbulence supports both legacy string format and new structured steps for backward compatibility
export const TurbulenceFieldSchema = z.any().optional();

export const AdditionalNotesFieldSchema = z.any().optional();

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
export const CoffeeBeansFieldSchema = z.any().optional();
export const WaterFieldSchema = z.any().optional();
export const CoffeeWaterRatioFieldSchema = z.any().optional();
export const BrewedCoffeeWeightFieldSchema = z.any().optional();
export const TdsFieldSchema = z.any().optional();
export const ExtractionYieldFieldSchema = z.any().optional();

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
export const OverallImpressionFieldSchema = z.any().optional();
export const AcidityFieldSchema = z.any().optional();
export const BodyFieldSchema = z.any().optional();
export const SweetnessFieldSchema = z.any().optional();
export const FlavorFieldSchema = z.any().optional();
export const AftertasteFieldSchema = z.any().optional();
export const BalanceFieldSchema = z.any().optional();
export const TastingNotesFieldSchema = z.any().optional();

// SCA/CVA Evaluation System Validation Schemas

// Evaluation System enum schema
export const EvaluationSystemSchema = z.any().optional();

// Traditional SCA Cupping Form validation - NO CONSTRAINTS
export const TraditionalSCAEvaluationSchema = z.object({
  fragrance: z.any().optional(),
  aroma: z.any().optional(),
  flavor: z.any().optional(),
  aftertaste: z.any().optional(),
  acidity: z.any().optional(),
  acidityIntensity: z.any().optional(),
  body: z.any().optional(),
  bodyLevel: z.any().optional(),
  balance: z.any().optional(),
  overall: z.any().optional(),
  uniformity: z.any().optional(),
  cleanCup: z.any().optional(),
  sweetness: z.any().optional(),
  taintDefects: z.any().optional(),
  faultDefects: z.any().optional(),
  finalScore: z.any().optional()
}).optional();

// CVA Descriptive Assessment validation - NO CONSTRAINTS
export const CVADescriptiveAssessmentSchema = z.object({
  fragrance: z.any().optional(),
  aroma: z.any().optional(),
  flavor: z.any().optional(),
  aftertaste: z.any().optional(),
  acidity: z.any().optional(),
  sweetness: z.any().optional(),
  mouthfeel: z.any().optional(),
  fragranceAromaDescriptors: z.any().optional(),
  flavorAftertasteDescriptors: z.any().optional(),
  mainTastes: z.any().optional(),
  mouthfeelDescriptors: z.any().optional(),
  acidityDescriptors: z.any().optional(),
  sweetnessDescriptors: z.any().optional(),
  additionalNotes: z.any().optional(),
  roastLevel: z.any().optional(),
  assessmentDate: z.any().optional(),
  assessorId: z.any().optional()
}).optional();

// CVA Affective Assessment validation - NO CONSTRAINTS
export const CVAAffectiveAssessmentSchema = z.object({
  fragrance: z.any().optional(),
  aroma: z.any().optional(),
  flavor: z.any().optional(),
  aftertaste: z.any().optional(),
  acidity: z.any().optional(),
  sweetness: z.any().optional(),
  mouthfeel: z.any().optional(),
  overall: z.any().optional(),
  nonUniformCups: z.any().optional(),
  defectiveCups: z.any().optional(),
  cvaScore: z.any().optional()
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
  overallImpression: OverallImpressionFieldSchema,
  acidity: AcidityFieldSchema,
  body: BodyFieldSchema,
  sweetness: SweetnessFieldSchema,
  flavor: FlavorFieldSchema,
  aftertaste: AftertasteFieldSchema,
  balance: BalanceFieldSchema,
  tastingNotes: TastingNotesFieldSchema,
  
  // New evaluation systems
  traditionalSCA: TraditionalSCAEvaluationSchema,
  cvaDescriptive: CVADescriptiveAssessmentSchema,
  cvaAffective: CVAAffectiveAssessmentSchema
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
  recipeId: z.any().optional(),
  recipeName: z.any().optional(),
  dateCreated: z.any().optional(),
  dateModified: z.any().optional(),
  isFavorite: z.any().optional(),
  collections: z.any().optional(),
  
  beanInfo: BeanInfoSchema,
  brewingParameters: BrewingParametersSchema,
  measurements: MeasurementsSchema,
  sensationRecord: SensationRecordWithEvaluationSchema
});

// Recipe Input validation schema (for creation/updates)
export const RecipeInputSchema = z.object({
  recipeName: z.any().optional(),
  isFavorite: z.any().optional(),
  collections: z.any().optional(),
  
  beanInfo: BeanInfoSchema,
  brewingParameters: BrewingParametersSchema,
  measurements: MeasurementsInputSchema,
  sensationRecord: SensationRecordWithEvaluationSchema
});

// Recipe Update schema (partial updates allowed)
export const RecipeUpdateSchema = RecipeInputSchema.partial();

// Recipe Summary schema
export const RecipeSummarySchema = z.object({
  recipeId: z.any().optional(),
  recipeName: z.any().optional(),
  dateCreated: z.any().optional(),
  dateModified: z.any().optional(),
  isFavorite: z.any().optional(),
  origin: z.any().optional(),
  brewingMethod: z.any().optional(),
  overallImpression: z.any().optional(),
  coffeeWaterRatio: z.any().optional(),
  collections: z.any().optional()
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
    const baseName = `${transformed.beanInfo.origin} - ${date}`;
    
    // Ensure generated name doesn't exceed 200 chars
    if (baseName.length <= 200) {
      transformed.recipeName = baseName;
    } else {
      // Truncate origin if needed (reserve space for " - " + date)
      const dateStr = ` - ${date}`;
      const maxOriginLength = 200 - dateStr.length - 3; // Reserve 3 chars for "..."
      const truncatedOrigin = transformed.beanInfo.origin.substring(0, maxOriginLength) + '...';
      transformed.recipeName = `${truncatedOrigin}${dateStr}`;
      console.log(`Generated recipe name truncated to: "${transformed.recipeName}" (${transformed.recipeName.length} chars)`);
    }
  } else if (transformed.recipeName.trim().length > 200) {
    // Truncate provided recipe name if too long
    const originalLength = transformed.recipeName.length;
    transformed.recipeName = transformed.recipeName.trim().substring(0, 197) + '...';
    console.log(`Recipe name truncated from ${originalLength} to ${transformed.recipeName.length} chars`);
  }
  
  return { ...transformed, recipeName: transformed.recipeName || 'Unknown Recipe' };
};

