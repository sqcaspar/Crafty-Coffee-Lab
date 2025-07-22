// Collection-related TypeScript interfaces

/**
 * Collection Color options for visual organization
 */
export enum CollectionColor {
  BLUE = 'blue',
  GREEN = 'green',
  ORANGE = 'orange',
  RED = 'red',
  PURPLE = 'purple',
  TEAL = 'teal',
  PINK = 'pink',
  INDIGO = 'indigo',
  GRAY = 'gray'
}

/**
 * Collection Sort Options
 */
export enum CollectionSortOption {
  NAME = 'name',
  CREATED_DATE = 'created-date',
  MODIFIED_DATE = 'modified-date',
  RECIPE_COUNT = 'recipe-count'
}

/**
 * Collection Statistics interface
 */
export interface CollectionStats {
  totalRecipes: number;
  averageOverallImpression: number;
  mostUsedBrewingMethod?: string;
  mostUsedOrigin?: string;
  dateRangeStart?: string; // ISO date of oldest recipe
  dateRangeEnd?: string; // ISO date of newest recipe
  lastActivityDate: string; // ISO date of last recipe added/removed
}

/**
 * Complete Collection interface
 */
export interface Collection {
  collectionId: string; // UUID
  name: string; // User-defined collection name
  description?: string; // Optional description
  color: CollectionColor; // Visual identifier
  isPrivate: boolean; // Privacy setting for sharing
  isDefault: boolean; // System default collections (Favorites, etc.)
  tags: string[]; // Array of tags for organization
  
  // Timestamps
  dateCreated: string; // ISO timestamp
  dateModified: string; // ISO timestamp
  
  // Recipe relationships
  recipeIds: string[]; // Array of recipe IDs in this collection
  
  // Statistics (computed)
  stats: CollectionStats;
}

/**
 * Collection Input interface for creation/updates
 */
export interface CollectionInput extends Omit<Collection, 'collectionId' | 'dateCreated' | 'dateModified' | 'stats' | 'recipeIds'> {
  // Auto-generated fields excluded
  // recipeIds managed separately through assignments
}

/**
 * Collection Update interface - allows partial updates
 */
export interface CollectionUpdate extends Partial<CollectionInput> {
  // All fields optional for updates
}

/**
 * Collection Summary interface for list displays
 */
export interface CollectionSummary {
  collectionId: string;
  name: string;
  description?: string;
  color: CollectionColor;
  isPrivate: boolean;
  isDefault: boolean;
  tags: string[];
  dateCreated: string;
  dateModified: string;
  recipeCount: number;
  averageRating: number;
  lastActivityDate: string;
}

/**
 * Collection Assignment interface for managing recipe relationships
 */
export interface CollectionAssignment {
  collectionId: string;
  recipeId: string;
  dateAssigned: string; // ISO timestamp
}

/**
 * Batch Collection Operations
 */
export interface BatchCollectionOperation {
  operation: 'assign' | 'remove';
  collectionId: string;
  recipeIds: string[];
}

/**
 * Collection Filter interface
 */
export interface CollectionFilter {
  searchQuery?: string;
  color?: CollectionColor;
  isPrivate?: boolean;
  hasRecipes?: boolean;
  tags?: string[];
  sortBy?: CollectionSortOption;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Collection Template interface for pre-made collections
 */
export interface CollectionTemplate {
  templateId: string;
  name: string;
  description: string;
  color: CollectionColor;
  tags: string[];
  filters?: {
    brewingMethod?: string[];
    origin?: string[];
    roastingLevel?: string[];
    ratingRange?: [number, number];
  };
}

// Legacy interfaces for backward compatibility
export interface RecipeCollectionAssociation {
  recipeId: string;
  collectionId: string;
  addedDate: string; // ISO timestamp when recipe was added to collection
}

export type CollectionId = string;