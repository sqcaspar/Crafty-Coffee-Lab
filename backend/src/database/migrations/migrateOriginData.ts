/**
 * Data Migration: Convert free-text origin values to standardized coffee origins
 * 
 * This migration script helps convert existing recipe origin data from free-text format
 * to the new standardized CoffeeOrigin enum values.
 */

import { db } from '../connection.js';
import { getMigratedOrigin, CoffeeOrigin } from 'coffee-tracker-shared';

interface RecipeOriginData {
  recipe_id: string;
  origin: string;
}

interface MigrationResult {
  totalRecipes: number;
  migrated: number;
  unmigrated: string[];
  errors: string[];
}

/**
 * Migrate recipe origins from free-text to standardized enum values
 */
export const migrateRecipeOrigins = async (): Promise<MigrationResult> => {
  const result: MigrationResult = {
    totalRecipes: 0,
    migrated: 0,
    unmigrated: [],
    errors: []
  };

  try {
    console.log('🔄 Starting recipe origin migration...');

    // Get all recipes with their current origin values
    const recipes = await db.all<RecipeOriginData>(
      'SELECT recipe_id, origin FROM recipes ORDER BY date_created ASC'
    );

    result.totalRecipes = recipes.length;
    console.log(`📊 Found ${result.totalRecipes} recipes to process`);

    if (result.totalRecipes === 0) {
      console.log('✅ No recipes found - migration complete');
      return result;
    }

    for (const recipe of recipes) {
      try {
        const currentOrigin = recipe.origin;
        const migratedOrigin = getMigratedOrigin(currentOrigin);

        if (migratedOrigin) {
          // Update the recipe with the migrated origin
          await db.run(
            'UPDATE recipes SET origin = $1, date_modified = $2 WHERE recipe_id = $3',
            [migratedOrigin, new Date(), recipe.recipe_id]
          );
          
          result.migrated++;
          console.log(`✅ Migrated: "${currentOrigin}" → "${migratedOrigin}" (${recipe.recipe_id.substring(0, 8)}...)`);
        } else {
          // Could not migrate - add to unmigrated list
          result.unmigrated.push(`${currentOrigin} (${recipe.recipe_id.substring(0, 8)}...)`);
          console.log(`⚠️  Could not migrate: "${currentOrigin}" (${recipe.recipe_id.substring(0, 8)}...)`);
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
      console.log('\n⚠️  Unmigrated origins:');
      result.unmigrated.forEach(origin => console.log(`   - ${origin}`));
      console.log('\n💡 These origins need manual review or mapping updates');
    }

    if (result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      result.errors.forEach(error => console.log(`   - ${error}`));
    }

    console.log('\n🎉 Origin migration completed!');
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
export const analyzeMigration = async (): Promise<{
  canMigrate: string[];
  cannotMigrate: string[];
  summary: Record<string, number>;
}> => {
  console.log('🔍 Analyzing origin migration possibilities...');

  const recipes = await db.all<RecipeOriginData>(
    'SELECT DISTINCT origin FROM recipes ORDER BY origin'
  );

  const canMigrate: string[] = [];
  const cannotMigrate: string[] = [];
  const summary: Record<string, number> = {};

  for (const recipe of recipes) {
    const origin = recipe.origin;
    const migratedOrigin = getMigratedOrigin(origin);

    if (migratedOrigin) {
      canMigrate.push(`"${origin}" → "${migratedOrigin}"`);
      summary[migratedOrigin] = (summary[migratedOrigin] || 0) + 1;
    } else {
      cannotMigrate.push(origin);
    }
  }

  console.log('\n📊 Migration Analysis:');
  console.log(`   Can migrate: ${canMigrate.length} origins`);
  console.log(`   Cannot migrate: ${cannotMigrate.length} origins`);

  if (canMigrate.length > 0) {
    console.log('\n✅ Can migrate:');
    canMigrate.forEach(mapping => console.log(`   ${mapping}`));
  }

  if (cannotMigrate.length > 0) {
    console.log('\n⚠️  Cannot migrate:');
    cannotMigrate.forEach(origin => console.log(`   "${origin}"`));
  }

  console.log('\n📈 Target distribution:');
  Object.entries(summary)
    .sort(([, a], [, b]) => b - a)
    .forEach(([origin, count]) => console.log(`   ${origin}: ${count} recipes`));

  return { canMigrate, cannotMigrate, summary };
};

/**
 * Rollback migration - restore original origin values from a backup
 * Note: This is a placeholder for rollback functionality
 */
export const rollbackMigration = async (): Promise<void> => {
  console.log('⚠️  Rollback functionality not implemented');
  console.log('💡 To rollback, restore from database backup before migration');
  throw new Error('Rollback not implemented - restore from backup');
};

// CLI interface for running migrations
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'analyze':
      analyzeMigration().catch(console.error);
      break;
    case 'migrate':
      migrateRecipeOrigins().catch(console.error);
      break;
    case 'rollback':
      rollbackMigration().catch(console.error);
      break;
    default:
      console.log('Usage: ts-node migrateOriginData.ts [analyze|migrate|rollback]');
      console.log('  analyze  - Show what would be migrated without making changes');
      console.log('  migrate  - Perform the actual migration');
      console.log('  rollback - Rollback migration (requires backup)');
  }
}