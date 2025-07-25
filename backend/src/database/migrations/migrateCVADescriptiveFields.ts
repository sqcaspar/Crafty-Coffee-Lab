import { db } from '../connection.js';

/**
 * Migration: Update CVA Descriptive Assessment fields to match SCA Standard 103-P/2024
 * 
 * Changes:
 * 1. Rename intensity fields (remove '_intensity' suffix)
 * 2. Replace separate olfactory/retronasal arrays with combined arrays
 * 3. Add new free text and metadata fields
 * 4. Update CVA Affective score constraint to allow scores below 58
 */

export const migrateCVADescriptiveFields = async (): Promise<void> => {
  try {
    console.log('🔄 Starting CVA Descriptive Assessment migration...');

    // Step 1: Add new columns with correct names
    console.log('📋 Adding new CVA Descriptive columns...');
    
    const addColumnQueries = [
      // New intensity columns (without _intensity suffix)
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cva_desc_fragrance_new INTEGER CHECK (cva_desc_fragrance_new >= 0 AND cva_desc_fragrance_new <= 15)',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cva_desc_aroma_new INTEGER CHECK (cva_desc_aroma_new >= 0 AND cva_desc_aroma_new <= 15)',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cva_desc_flavor_new INTEGER CHECK (cva_desc_flavor_new >= 0 AND cva_desc_flavor_new <= 15)',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cva_desc_aftertaste_new INTEGER CHECK (cva_desc_aftertaste_new >= 0 AND cva_desc_aftertaste_new <= 15)',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cva_desc_acidity_new INTEGER CHECK (cva_desc_acidity_new >= 0 AND cva_desc_acidity_new <= 15)',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cva_desc_sweetness_new INTEGER CHECK (cva_desc_sweetness_new >= 0 AND cva_desc_sweetness_new <= 15)',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cva_desc_mouthfeel_new INTEGER CHECK (cva_desc_mouthfeel_new >= 0 AND cva_desc_mouthfeel_new <= 15)',
      
      // New combined CATA descriptor arrays
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cva_desc_fragrance_aroma_descriptors JSONB DEFAULT \'[]\'',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cva_desc_flavor_aftertaste_descriptors JSONB DEFAULT \'[]\'',
      
      // Free text descriptors
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cva_desc_acidity_descriptors TEXT',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cva_desc_sweetness_descriptors TEXT',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cva_desc_additional_notes TEXT',
      
      // Assessment metadata
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cva_desc_roast_level VARCHAR(100)',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cva_desc_assessment_date TIMESTAMP',
      'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cva_desc_assessor_id VARCHAR(100)'
    ];

    for (const query of addColumnQueries) {
      await db.run(query);
    }

    // Step 2: Copy data from old columns to new columns
    console.log('📋 Migrating existing CVA data...');
    
    const dataMigrationQueries = [
      // Copy intensity data
      'UPDATE recipes SET cva_desc_fragrance_new = cva_desc_fragrance_intensity WHERE cva_desc_fragrance_intensity IS NOT NULL',
      'UPDATE recipes SET cva_desc_aroma_new = cva_desc_aroma_intensity WHERE cva_desc_aroma_intensity IS NOT NULL',
      'UPDATE recipes SET cva_desc_flavor_new = cva_desc_flavor_intensity WHERE cva_desc_flavor_intensity IS NOT NULL',
      'UPDATE recipes SET cva_desc_aftertaste_new = cva_desc_aftertaste_intensity WHERE cva_desc_aftertaste_intensity IS NOT NULL',
      'UPDATE recipes SET cva_desc_acidity_new = cva_desc_acidity_intensity WHERE cva_desc_acidity_intensity IS NOT NULL',
      'UPDATE recipes SET cva_desc_sweetness_new = cva_desc_sweetness_intensity WHERE cva_desc_sweetness_intensity IS NOT NULL',
      'UPDATE recipes SET cva_desc_mouthfeel_new = cva_desc_mouthfeel_intensity WHERE cva_desc_mouthfeel_intensity IS NOT NULL',
      
      // Migrate descriptor arrays (combine olfactory into fragrance_aroma)
      'UPDATE recipes SET cva_desc_fragrance_aroma_descriptors = cva_desc_olfactory_descriptors WHERE cva_desc_olfactory_descriptors IS NOT NULL AND cva_desc_olfactory_descriptors != \'[]\'',
      
      // Migrate retronasal into flavor_aftertaste
      'UPDATE recipes SET cva_desc_flavor_aftertaste_descriptors = cva_desc_retronasal_descriptors WHERE cva_desc_retronasal_descriptors IS NOT NULL AND cva_desc_retronasal_descriptors != \'[]\'',
    ];

    for (const query of dataMigrationQueries) {
      await db.run(query);
    }

    // Step 3: Drop old columns
    console.log('📋 Removing old CVA columns...');
    
    const dropColumnQueries = [
      'ALTER TABLE recipes DROP COLUMN IF EXISTS cva_desc_fragrance_intensity',
      'ALTER TABLE recipes DROP COLUMN IF EXISTS cva_desc_aroma_intensity',
      'ALTER TABLE recipes DROP COLUMN IF EXISTS cva_desc_flavor_intensity',
      'ALTER TABLE recipes DROP COLUMN IF EXISTS cva_desc_aftertaste_intensity',
      'ALTER TABLE recipes DROP COLUMN IF EXISTS cva_desc_acidity_intensity',
      'ALTER TABLE recipes DROP COLUMN IF EXISTS cva_desc_sweetness_intensity',
      'ALTER TABLE recipes DROP COLUMN IF EXISTS cva_desc_mouthfeel_intensity',
      'ALTER TABLE recipes DROP COLUMN IF EXISTS cva_desc_olfactory_descriptors',
      'ALTER TABLE recipes DROP COLUMN IF EXISTS cva_desc_retronasal_descriptors'
    ];

    for (const query of dropColumnQueries) {
      await db.run(query);
    }

    // Step 4: Rename new columns to final names
    console.log('📋 Renaming columns to final names...');
    
    const renameColumnQueries = [
      'ALTER TABLE recipes RENAME COLUMN cva_desc_fragrance_new TO cva_desc_fragrance',
      'ALTER TABLE recipes RENAME COLUMN cva_desc_aroma_new TO cva_desc_aroma',
      'ALTER TABLE recipes RENAME COLUMN cva_desc_flavor_new TO cva_desc_flavor',
      'ALTER TABLE recipes RENAME COLUMN cva_desc_aftertaste_new TO cva_desc_aftertaste',
      'ALTER TABLE recipes RENAME COLUMN cva_desc_acidity_new TO cva_desc_acidity',
      'ALTER TABLE recipes RENAME COLUMN cva_desc_sweetness_new TO cva_desc_sweetness',
      'ALTER TABLE recipes RENAME COLUMN cva_desc_mouthfeel_new TO cva_desc_mouthfeel'
    ];

    for (const query of renameColumnQueries) {
      await db.run(query);
    }

    // Step 5: Update CVA Affective score constraint
    console.log('📋 Updating CVA Affective score constraint...');
    
    // Note: PostgreSQL doesn't allow direct constraint modification, 
    // so we need to drop and recreate the constraint
    await db.run('ALTER TABLE recipes DROP CONSTRAINT IF EXISTS recipes_cva_aff_score_check');
    await db.run('ALTER TABLE recipes ADD CONSTRAINT recipes_cva_aff_score_check CHECK (cva_aff_score >= 0 AND cva_aff_score <= 100)');

    console.log('✅ CVA Descriptive Assessment migration completed successfully!');
    
    // Report migration results
    const recipeCount = await db.get('SELECT COUNT(*) as count FROM recipes WHERE cva_desc_fragrance IS NOT NULL');
    console.log(`📊 Migrated CVA data for ${recipeCount?.count || 0} recipes`);
    
  } catch (error) {
    console.error('❌ CVA Descriptive Assessment migration failed:', error);
    throw error;
  }
};

/**
 * Rollback migration (for testing/recovery purposes)
 */
export const rollbackCVADescriptiveMigration = async (): Promise<void> => {
  try {
    console.log('🔄 Rolling back CVA Descriptive Assessment migration...');
    
    // This would restore the old schema - implement if needed for testing
    console.log('⚠️ Rollback not implemented - would require database backup restoration');
    
  } catch (error) {
    console.error('❌ CVA migration rollback failed:', error);
    throw error;
  }
};

// Export for use in migration scripts
export default migrateCVADescriptiveFields;