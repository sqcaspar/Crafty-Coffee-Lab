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
  origin: string; // Required - country name
  processingMethod: string; // Required - washed, natural, etc.
  altitude?: number; // Optional - meters above sea level
  roastingDate?: string; // Optional - ISO date string
  roastingLevel?: RoastingLevel; // Optional - controlled enum
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
  turbulence?: string; // Optional - stirring, agitation notes
  additionalNotes?: string; // Optional - any extra brewing notes
}

/**
 * Measurements interface
 */
export interface Measurements {
  coffeeBeans: number; // Required - grams of coffee
  water: number; // Required - grams of water
  coffeeWaterRatio: number; // Auto-calculated ratio
  tds?: number; // Optional - total dissolved solids percentage
  extractionYield?: number; // Optional - extraction percentage
}

/**
 * Input measurements interface (for form submission)
 */
export interface MeasurementsInput extends Omit<Measurements, 'coffeeWaterRatio'> {
  coffeeWaterRatio?: number; // Optional for input, calculated automatically
}

/**
 * Sensation Record interface for taste evaluation
 */
export interface SensationRecord {
  overallImpression: number; // Required - 1-10 scale
  acidity?: number; // Optional - 1-10 scale
  body?: number; // Optional - 1-10 scale
  sweetness?: number; // Optional - 1-10 scale
  flavor?: number; // Optional - 1-10 scale
  aftertaste?: number; // Optional - 1-10 scale
  balance?: number; // Optional - 1-10 scale
  tastingNotes?: string; // Optional - free-form tasting notes
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