/**
 * Data Migration: Convert free-text processing method values to standardized enum
 * 
 * This migration script helps convert existing recipe processing method data 
 * from free-text format to the new standardized ProcessingMethod enum values.
 */

import { db } from '../connection.js';
import { getMigratedProcessingMethod, ProcessingMethod } from 'coffee-tracker-shared';

interface RecipeProcessingMethodData {
  recipe_id: string;
  processing_method: string;
}

interface MigrationResult {
  totalRecipes: number;
  migrated: number;
  unmigrated: string[];
  errors: string[];
}

/**
 * Migrate recipe processing methods from free-text to standardized enum values
 */
export const migrateRecipeProcessingMethods = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    totalRecipes: 0,
    migrated: 0,
    unmigrated: [],
    errors: []
  };

  try {
    console.log('🔄 Starting recipe processing method migration...');

    // Get all recipes with their current processing method values
    const recipes = await db.all<RecipeProcessingMethodData>(
      'SELECT recipe_id, processing_method FROM recipes ORDER BY date_created ASC'
    );

    result.totalRecipes = recipes.length;
    console.log(`📊 Found ${result.totalRecipes} recipes to process`);

    if (result.totalRecipes === 0) {
      console.log('✅ No recipes found - migration complete');
      return result;
    }

    for (const recipe of recipes) {
      try {
        const currentMethod = recipe.processing_method;
        const migratedMethod = getMigratedProcessingMethod(currentMethod);

        if (migratedMethod) {
          // Update the recipe with the migrated processing method
          await db.run(
            'UPDATE recipes SET processing_method = $1, date_modified = $2 WHERE recipe_id = $3',
            [migratedMethod, new Date(), recipe.recipe_id]
          );
          
          result.migrated++;
          console.log(`✅ Migrated: "${currentMethod}" → "${migratedMethod}" (${recipe.recipe_id.substring(0, 8)}...)`);
        } else {
          // Could not migrate - add to unmigrated list
          result.unmigrated.push(`${currentMethod} (${recipe.recipe_id.substring(0, 8)}...)`);
          console.log(`⚠️  Could not migrate: "${currentMethod}" (${recipe.recipe_id.substring(0, 8)}...)`);
        }
      } catch (error) {
        const errorMessage = `Failed to migrate recipe ${recipe.recipe_id}: ${error}`;
        result.errors.push(errorMessage);
        console.error(`❌ ${errorMessage}`);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Total recipes: ${result.totalRecipes}`);
    console.log(`   Successfully migrated: ${result.migrated}`);
    console.log(`   Could not migrate: ${result.unmigrated.length}`);
    console.log(`   Errors: ${result.errors.length}`);

    if (result.unmigrated.length > 0) {
      console.log('\n⚠️  Unmigrated processing methods:');
      result.unmigrated.forEach(method => console.log(`   - ${method}`));
      console.log('\n💡 These methods need manual review or mapping updates');
    }

    if (result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      result.errors.forEach(error => console.log(`   - ${error}`));
    }

    console.log('\n🎉 Processing method migration completed!');
    return result;

  } catch (error) {
    const errorMessage = `Migration failed: ${error}`;
    result.errors.push(errorMessage);
    console.error(`❌ ${errorMessage}`);
    throw error;
  }
};

/**
 * Dry run - analyze what would be migrated without making changes
 */
export const analyzeProcessingMethodMigration = async (): Promise<{
  canMigrate: string[];
  cannotMigrate: string[];
  summary: Record<string, number>;
}> => {
  console.log('🔍 Analyzing processing method migration possibilities...');

  const recipes = await db.all<RecipeProcessingMethodData>(
    'SELECT DISTINCT processing_method FROM recipes ORDER BY processing_method'
  );

  const canMigrate: string[] = [];
  const cannotMigrate: string[] = [];
  const summary: Record<string, number> = {};

  for (const recipe of recipes) {
    const method = recipe.processing_method;
    const migratedMethod = getMigratedProcessingMethod(method);

    if (migratedMethod) {
      canMigrate.push(`"${method}" → "${migratedMethod}"`);
      summary[migratedMethod] = (summary[migratedMethod] || 0) + 1;
    } else {
      cannotMigrate.push(method);
    }
  }

  console.log('\n📊 Migration Analysis:');
  console.log(`   Can migrate: ${canMigrate.length} methods`);
  console.log(`   Cannot migrate: ${cannotMigrate.length} methods`);

  if (canMigrate.length > 0) {
    console.log('\n✅ Can migrate:');
    canMigrate.forEach(mapping => console.log(`   ${mapping}`));
  }

  if (cannotMigrate.length > 0) {
    console.log('\n⚠️  Cannot migrate:');
    cannotMigrate.forEach(method => console.log(`   "${method}"`));
  }

  console.log('\n📈 Target distribution:');
  Object.entries(summary)
    .sort(([, a], [, b]) => b - a)
    .forEach(([method, count]) => console.log(`   ${method}: ${count} recipes`));

  return { canMigrate, cannotMigrate, summary };
};

/**
 * Rollback migration - restore original processing method values from a backup
 * Note: This is a placeholder for rollback functionality
 */
export const rollbackProcessingMethodMigration = async (): Promise<void> => {
  console.log('⚠️  Rollback functionality not implemented');
  console.log('💡 To rollback, restore from database backup before migration');
  throw new Error('Rollback not implemented - restore from backup');
};

// CLI interface for running migrations
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'analyze':
      analyzeProcessingMethodMigration().catch(console.error);
      break;
    case 'migrate':
      migrateRecipeProcessingMethods().catch(console.error);
      break;
    case 'rollback':
      rollbackProcessingMethodMigration().catch(console.error);
      break;
    default:
      console.log('Usage: ts-node migrateProcessingMethodData.ts [analyze|migrate|rollback]');
      console.log('  analyze  - Show what would be migrated without making changes');
      console.log('  migrate  - Perform the actual migration');
      console.log('  rollback - Rollback migration (requires backup)');
  }
}