// Recipe-related TypeScript interfaces

/**
 * Enum definitions for controlled values
 */
export enum RoastingLevel {
  LIGHT = 'light',
  MEDIUM = 'medium',
  DARK = 'dark',
  CUSTOM = 'custom'
}

export enum BrewingMethod {
  POUR_OVER = 'pour-over',
  FRENCH_PRESS = 'french-press',
  AEROPRESS = 'aeropress',
  COLD_BREW = 'cold-brew'
}

export enum SortOption {
  DATE_CREATED = 'date-created',
  DATE_MODIFIED = 'date-modified',
  OVERALL_IMPRESSION = 'overall-impression',
  RECIPE_NAME = 'recipe-name'
}

/**
 * Bean Information interface
 */
export interface BeanInfo {
  coffeeBeanBrand?: string; // Optional - coffee bean brand/producer name
  origin: string; // Required - coffee origin country (will be CoffeeOrigin enum values)
  processingMethod: string; // Required - washed, natural, etc.
  altitude?: number; // Optional - meters above sea level
  roastingDate?: string; // Optional - ISO date string
  roastingLevel?: RoastingLevel; // Optional - controlled enum
}

/**
 * Turbulence Step interface for structured brewing process
 */
export interface TurbulenceStep {
  actionTime: string; // Time format like "0:00", "1:30"
  actionDetails: string; // Description of the action
  volume: string; // Volume like "30ml", "50g"
}

/**
 * Turbulence Information interface
 */
export interface TurbulenceInfo {
  turbulence?: string | TurbulenceStep[]; // Optional - legacy string or structured steps
}

/**
 * Brewing Parameters interface
 */
export interface BrewingParameters {
  waterTemperature?: number; // Optional - celsius
  brewingMethod?: BrewingMethod; // Optional - controlled enum
  grinderModel: string; // Required - grinder brand/model
  grinderUnit: string; // Required - grind size description
  filteringTools?: string; // Optional - filters, papers used
  additionalNotes?: string; // Optional - any extra brewing notes
}

/**
 * Measurements interface
 */
export interface Measurements {
  coffeeBeans: number; // Required - grams of coffee
  water: number; // Required - grams of water
  coffeeWaterRatio: number; // Auto-calculated ratio
  brewedCoffeeWeight?: number; // Optional - grams of brewed coffee output
  tds?: number; // Optional - total dissolved solids percentage
  extractionYield?: number; // Optional - extraction percentage (auto-calculated when possible)
}

/**
 * Input measurements interface (for form submission)
 */
export interface MeasurementsInput extends Omit<Measurements, 'coffeeWaterRatio'> {
  coffeeWaterRatio?: number; // Optional for input, calculated automatically
}

/**
 * SCA Cupping Protocol Evaluation (2004 SCA Protocol)
 * Ten individual attributes scored 6.00-10.00 points each, adjusted for defects
 */
export interface TraditionalSCAEvaluation {
  // Ten SCA 2004 Cupping Protocol attributes (6.00-10.00 points each with 0.25 increments)
  // 6.00=Meets minimum quality, 10.00=Extraordinary quality
  fragrance?: number;        // F₁: Orthonasal smell of grounds (fragrance) and brewed coffee (aroma)
  aroma?: number;           // Deprecated: Not used in SCA 2004 (kept for backward compatibility)
  flavor?: number;          // F₂: Combined retronasal aroma + taste while sipping
  aftertaste?: number;      // F₃: Persistence and quality of flavor after swallowing
  acidity?: number;         // F₄: Perceived brightness or liveliness (not sourness)
  body?: number;            // F₅: Mouthfeel weight and viscosity
  balance?: number;         // F₆: Harmony between acidity, sweetness, body, and flavor
  sweetness?: number;       // F₇: Gustatory or retronasal perception of sweetness
  cleanCup?: number;        // F₈: Absence of negative floating or suspended particles, odors
  uniformity?: number;      // F₉: Consistency of key attributes across five individually brewed cups
  overall?: number;         // F₁₀: General impression, including additional desirable characteristics
  
  // Defect penalties (points deducted based on affected cups)
  taintDefects?: number;    // Points deducted: 2 × number of tainted cups
  faultDefects?: number;    // Points deducted: 4 × number of faulty cups
  
  // Calculated total score
  finalScore?: number;      // Final Score = Σ(F₁...F₁₀) - (2×Tainted cups) - (4×Faulty cups)
}

/**
 * CVA Descriptive Assessment (SCA Standard 103-P/2024)
 * Builds objective sensory fingerprint using 0-15 intensity scales and CATA descriptors
 * Does not compute a final quality score - focuses on sensory profile mapping
 */
export interface CVADescriptiveAssessment {
  // Seven cupping sections with 0-15 intensity ratings (0=None, 15=Very High)
  fragrance?: number;     // Orthonasal olfaction: Smell of dry grounds before brewing
  aroma?: number;         // Orthonasal olfaction: Smell of brew at aroma break & crust removal
  flavor?: number;        // Integrated gustatory & retronasal: Combined taste + retronasal smell in mouth
  aftertaste?: number;    // Integrated gustatory & retronasal: Sensations remaining after swallowing
  acidity?: number;       // Gustatory: Perceived sourness character & intensity
  sweetness?: number;     // Gustatory & retronasal: Perceived sweetness impression
  mouthfeel?: number;     // Tactile: Viscosity, texture, astringency, etc.
  
  // CATA Descriptor Arrays (Check-All-That-Apply with SCA-defined limits)
  
  // Olfactory CATA (15 categories) - Combined limit: Fragrance + Aroma ≤5 total selections
  fragranceAromaDescriptors?: string[];  // From olfactory list: Floral, Berry, Dried Fruit, etc.
  
  // Retronasal CATA (15 categories) - Combined limit: Flavor + Aftertaste ≤5 total selections  
  flavorAftertasteDescriptors?: string[];  // From olfactory list: Floral, Berry, Dried Fruit, etc.
  
  // Main Tastes CATA (5 categories) - Limit: ≤2 selections
  mainTastes?: string[];  // Salty, Sour, Sweet, Bitter, Umami
  
  // Mouthfeel CATA (5 categories) - Limit: ≤2 selections
  mouthfeelDescriptors?: string[];  // Metallic, Rough, Oily, Smooth, Mouth-Drying
  
  // Free-text descriptors (when CATA categories insufficient)
  acidityDescriptors?: string;      // Free text: e.g., "tartaric, bright"
  sweetnessDescriptors?: string;    // Free text: e.g., "cane sugar, caramel"
  additionalNotes?: string;         // Additional descriptors not captured above
  
  // Assessment metadata
  roastLevel?: string;              // Visual roast estimate (e.g., "Light (Agtron 58)")
  assessmentDate?: string;          // ISO date string
  assessorId?: string;              // Cupper identification
}

/**
 * CVA Affective Assessment (1-9 impression scale)
 * Measures impression of quality using hedonic scale where 5 = neutral liking
 */
export interface CVAAffectiveAssessment {
  // Eight evaluation sections (1-9 scale: ①Extremely low → ⑤Neither high nor low → ⑨Extremely high)
  // 5 = neutral liking (neither high nor low impression of quality)
  fragrance?: number;      // Fragrance impression of quality
  aroma?: number;          // Aroma impression of quality  
  flavor?: number;         // Flavor impression of quality
  aftertaste?: number;     // Aftertaste impression of quality
  acidity?: number;        // Acidity impression of quality
  sweetness?: number;      // Sweetness impression of quality
  mouthfeel?: number;      // Mouthfeel impression of quality
  overall?: number;        // Overall impression of quality
  
  // Cup defects and uniformity (0-5 cups each)
  nonUniformCups?: number; // Cups exhibiting qualitatively different characteristics
  defectiveCups?: number;  // Cups scored as moldy, phenolic, or potato
  
  // Calculated CVA score using official formula: S = 0.65625 × Σhi + 52.75 - 2u - 4d
  // Where hi = 9-point score of each affective section, from i=1 (fragrance) to i=8 (overall)
  cvaScore?: number;       // Final CVA Affective Score (rounded to nearest 0.25)
}

/**
 * Quick Tasting Assessment
 * Simplified form combining key elements from CVA Descriptive and CVA Affective assessments
 * Designed for rapid evaluation while maintaining professional standards
 */
export interface QuickTastingAssessment {
  // CVA Descriptive intensity fields (0-15 scale: 0=None, 15=Very High)
  flavorIntensity?: number;        // Combined taste + retronasal smell in mouth
  aftertasteIntensity?: number;    // Sensations remaining after swallowing
  acidityIntensity?: number;       // Perceived sourness character & intensity
  sweetnessIntensity?: number;     // Perceived sweetness impression
  mouthfeelIntensity?: number;     // Viscosity, texture, astringency
  
  // CVA Descriptive CATA descriptors
  flavorAftertasteDescriptors?: string[];  // From olfactory list (≤5 selections)
  
  // CVA Affective quality assessment (1-9 scale: 5=neutral liking)
  overallQuality?: number;         // Overall impression of quality
}

/**
 * Evaluation System Types
 */
export type EvaluationSystem = 'traditional-sca' | 'cva-descriptive' | 'cva-affective' | 'quick-tasting' | 'legacy';

/**
 * Sensation Record interface for taste evaluation
 * Supports multiple evaluation systems while maintaining backwards compatibility
 */
export interface SensationRecord {
  // Evaluation system indicator
  evaluationSystem?: EvaluationSystem;
  
  // Legacy fields (maintain backwards compatibility with existing simple 1-10 system)
  overallImpression?: number; // Required for legacy - 1-10 scale
  acidity?: number; // Optional - 1-10 scale
  body?: number; // Optional - 1-10 scale
  sweetness?: number; // Optional - 1-10 scale
  flavor?: number; // Optional - 1-10 scale
  aftertaste?: number; // Optional - 1-10 scale
  balance?: number; // Optional - 1-10 scale
  tastingNotes?: string; // Optional - free-form tasting notes
  
  // New SCA/CVA evaluation systems
  traditionalSCA?: TraditionalSCAEvaluation;
  cvaDescriptive?: CVADescriptiveAssessment;
  cvaAffective?: CVAAffectiveAssessment;
  quickTasting?: QuickTastingAssessment;
}

/**
 * Complete Recipe interface
 */
export interface Recipe {
  recipeId: string; // UUID
  recipeName: string; // User-defined or auto-generated
  dateCreated: string; // ISO timestamp
  dateModified: string; // ISO timestamp
  isFavorite: boolean; // Favorite status
  collections: string[]; // Array of collection IDs
  
  // Nested data structures
  beanInfo: BeanInfo;
  brewingParameters: BrewingParameters;
  turbulenceInfo: TurbulenceInfo;
  measurements: Measurements;
  sensationRecord: SensationRecord;
}

/**
 * Recipe Input interface for creation/updates
 * Excludes auto-generated fields and uses input measurements
 */
export interface RecipeInput extends Omit<Recipe, 'recipeId' | 'dateCreated' | 'dateModified' | 'measurements'> {
  measurements: MeasurementsInput;
}

/**
 * Recipe Update interface - allows partial updates
 */
export interface RecipeUpdate extends Partial<RecipeInput> {
  // All fields optional for updates
}

/**
 * Recipe Summary interface for list displays
 */
export interface RecipeSummary {
  recipeId: string;
  recipeName: string;
  dateCreated: string;
  dateModified: string;
  isFavorite: boolean;
  origin: string;
  brewingMethod?: BrewingMethod;
  overallImpression: number;
  coffeeWaterRatio: number;
  collections: string[]; // Array of collection IDs
}

export type RecipeId = string;