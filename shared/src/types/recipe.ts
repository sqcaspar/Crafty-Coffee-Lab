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
 * Brewing Parameters interface
 */
export interface BrewingParameters {
  waterTemperature?: number; // Optional - celsius
  brewingMethod?: BrewingMethod; // Optional - controlled enum
  grinderModel: string; // Required - grinder brand/model
  grinderUnit: string; // Required - grind size description
  filteringTools?: string; // Optional - filters, papers used
  turbulence?: string | TurbulenceStep[]; // Optional - legacy string or structured steps
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
  // Ten individual attributes (6.00-10.00 points each with 0.25 increments)
  // 6.00=Meets minimum quality, 10.00=Extraordinary quality
  fragrance?: number;        // F₁: Fragrance/Aroma (combined orthonasal evaluation)
  aroma?: number;           // F₂: Not used in SCA 2004 (kept for backward compatibility)
  flavor?: number;          // F₃: Combined taste and retronasal aroma perception
  aftertaste?: number;      // F₄: Persistence and quality of flavor after swallowing
  acidity?: number;         // F₅: Perceived brightness or liveliness (6-10)
  acidityIntensity?: 'High' | 'Medium' | 'Low'; // Acidity level descriptor
  body?: number;            // F₆: Mouthfeel weight and viscosity (6-10)
  bodyLevel?: 'Heavy' | 'Medium' | 'Thin'; // Body level descriptor
  balance?: number;         // F₇: Harmony between acidity, sweetness, body, and flavor
  overall?: number;         // F₁₀: General impression, including additional desirable characteristics
  
  // Additional SCA 2004 attributes (6.00-10.00 points each)
  uniformity?: number;      // F₉: Consistency across five individually brewed cups
  cleanCup?: number;        // F₈: Absence of negative floating or suspended particles, odors
  sweetness?: number;       // F₇: Gustatory or retronasal perception of sweetness
  
  // Defect penalties (points deducted based on affected cups)
  taintDefects?: number;    // Points deducted: 2 × number of tainted cups
  faultDefects?: number;    // Points deducted: 4 × number of faulty cups
  
  // Calculated total score
  finalScore?: number;      // Final Score = Σ(F₁...F₁₀) - (2×Tainted cups) - (4×Faulty cups)
}

/**
 * CVA Descriptive Assessment (0-15 intensity scale)
 * Measures strength/intensity of sensory perceptions
 */
export interface CVADescriptiveAssessment {
  // Intensity ratings (0-15 scale: 0=None, 5-10=Medium, 15=Extremely High)
  fragranceIntensity?: number;    // Dry coffee fragrance intensity
  aromaIntensity?: number;        // Wet coffee aroma intensity
  flavorIntensity?: number;       // Combined taste and retronasal intensity
  aftertasteIntensity?: number;   // Lingering sensation intensity
  acidityIntensity?: number;      // Sourness perception intensity
  sweetnessIntensity?: number;    // Sweet taste/aroma intensity
  mouthfeelIntensity?: number;    // Tactile sensation intensity
  
  // Check-All-That-Apply (CATA) descriptor selections with limits
  olfactoryDescriptors?: string[];    // Up to 5 from predefined flavor categories
  retronasalDescriptors?: string[];   // Up to 5 flavor/aftertaste descriptors
  mainTastes?: string[];              // Up to 2 from: salty, sour, sweet, bitter, umami
  mouthfeelDescriptors?: string[];    // Up to 2: metallic, rough, oily, smooth, mouth-drying
}

/**
 * CVA Affective Assessment (1-9 quality scale)
 * Measures impression of quality across sensory attributes
 */
export interface CVAAffectiveAssessment {
  // Quality impression ratings (1-9 scale)
  // 1=Extremely Low, 5=Neutral, 9=Extremely High impression of quality
  fragrance?: number;      // Fragrance quality impression
  aroma?: number;          // Aroma quality impression
  flavor?: number;         // Flavor quality impression
  aftertaste?: number;     // Aftertaste quality impression
  acidity?: number;        // Acidity quality impression
  sweetness?: number;      // Sweetness quality impression
  mouthfeel?: number;      // Mouthfeel quality impression
  overall?: number;        // Overall quality impression
  
  // Cup uniformity and defect counts (0-5 cups each)
  nonUniformCups?: number; // Number of non-uniform cups (penalty factor)
  defectiveCups?: number;  // Number of defective cups (penalty factor)
  
  // Calculated CVA score using formula: S = 6.25 × (Σhi) + 37.5 - 2u - 4d
  cvaScore?: number;       // Final score (58.00-100.00, rounded to nearest 0.25)
}

/**
 * Evaluation System Types
 */
export type EvaluationSystem = 'traditional-sca' | 'cva-descriptive' | 'cva-affective' | 'legacy';

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