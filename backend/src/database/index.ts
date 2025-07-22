// Main database module exports
export { db } from './connection.js';
export { initializeDatabase, createTables, createIndexes, dropTables } from './schema.js';
export { RecipeModel } from './models/Recipe.js';
export { CollectionModel } from './models/Collection.js';
export { seedDatabase, clearDatabase } from './seed.js';

// Re-export types from shared package for convenience
export type { Recipe, RecipeInput, Collection } from 'coffee-tracker-shared';