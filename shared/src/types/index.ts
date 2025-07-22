// Main types index - re-export all types for easy importing

// Recipe types
export * from './recipe.js';

// Collection types  
export * from './collection.js';

// API types
export * from './api.js';

// Search types
export * from './search.js';

// Export types
export * from './export.js';

// Type utility helpers
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Common ID types
export type UUID = string;
export type Timestamp = string; // ISO date string