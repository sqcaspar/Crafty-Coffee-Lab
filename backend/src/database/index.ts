// Main database module exports - Supabase version
import { supabase } from './supabase.js';
import { RecipeModel } from './models/Recipe.js';
import { CollectionModel } from './models/Collection.js';
import { CollectionColor } from 'coffee-tracker-shared';

export { supabase, RecipeModel, CollectionModel };

// Re-export types from shared package for convenience
export type { Recipe, RecipeInput, Collection } from 'coffee-tracker-shared';

// Initialize database function for Supabase (much simpler)
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Connect to Supabase
    const client = supabase.connect();
    console.log('🎉 Supabase database connection initialized');
    
    // Test the connection by doing a simple query
    const { count } = await client.from('collections').select('*', { count: 'exact', head: true });
    console.log(`📊 Collections table found with ${count ?? 0} records`);
    
    console.log('✅ Supabase database connection tested successfully');
  } catch (error) {
    console.error('❌ Supabase database initialization failed:', error);
    throw error;
  }
};

// Seed database function (optional for Supabase since we may already have data)
export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Checking if default collection exists...');
    
    // Check if default collection already exists
    const defaultCollection = await CollectionModel.findByName('All Recipes');
    
    if (!defaultCollection) {
      console.log('🌱 Creating default "All Recipes" collection...');
      await CollectionModel.create({
        name: 'All Recipes',
        description: 'Default collection containing all recipes',
        color: CollectionColor.BLUE,
        isPrivate: false,
        isDefault: true,
        tags: ['default']
      });
      console.log('✅ Default collection created');
    } else {
      console.log('✅ Default collection already exists');
    }
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    // Don't throw error for seeding - it's not critical
  }
};

// Clear database function (for testing purposes)
export const clearDatabase = async (): Promise<void> => {
  try {
    console.log('🧹 Clearing Supabase database...');
    const client = supabase.connect();
    
    // Delete all data (cascading will handle relationships)
    await supabase.handleResponse(async () => {
      return client.from('recipe_collections').delete().neq('collection_id', '');
    });
    
    await supabase.handleResponse(async () => {
      return client.from('recipes').delete().neq('recipe_id', '');
    });
    
    await supabase.handleResponse(async () => {
      return client.from('collections').delete().neq('collection_id', '');
    });
    
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Database clearing failed:', error);
    throw error;
  }
};