import { db } from './connection.js';

export const createTables = async (): Promise<void> => {
  try {
    // Create recipes table with all fields from specification (PostgreSQL)
    await db.run(`
      CREATE TABLE IF NOT EXISTS recipes (
        recipe_id UUID PRIMARY KEY,
        recipe_name VARCHAR(200),
        date_created TIMESTAMP NOT NULL,
        date_modified TIMESTAMP NOT NULL,
        is_favorite BOOLEAN DEFAULT FALSE,
        
        -- Bean Information
        origin VARCHAR(100) NOT NULL,
        processing_method VARCHAR(50) NOT NULL,
        altitude INTEGER,
        roasting_date TIMESTAMP,
        roasting_level VARCHAR(20),
        
        -- Brewing Parameters
        water_temperature DECIMAL(5,2),
        brewing_method VARCHAR(50),
        grinder_model VARCHAR(100) NOT NULL,
        grinder_unit VARCHAR(50) NOT NULL,
        filtering_tools VARCHAR(100),
        turbulence VARCHAR(200),
        additional_notes TEXT,
        
        -- Measurements
        coffee_beans DECIMAL(8,2) NOT NULL,
        water DECIMAL(8,2) NOT NULL,
        coffee_water_ratio DECIMAL(6,2),
        brewed_coffee_weight DECIMAL(8,2),
        tds DECIMAL(5,2),
        extraction_yield DECIMAL(5,2),
        
        -- Sensation Record (Legacy fields for backwards compatibility)
        overall_impression INTEGER CHECK (overall_impression >= 1 AND overall_impression <= 10),
        acidity INTEGER CHECK (acidity >= 1 AND acidity <= 10),
        body INTEGER CHECK (body >= 1 AND body <= 10),
        sweetness INTEGER CHECK (sweetness >= 1 AND sweetness <= 10),
        flavor INTEGER CHECK (flavor >= 1 AND flavor <= 10),
        aftertaste INTEGER CHECK (aftertaste >= 1 AND aftertaste <= 10),
        balance INTEGER CHECK (balance >= 1 AND balance <= 10),
        tasting_notes TEXT,
        
        -- Evaluation System Indicator
        evaluation_system VARCHAR(20) CHECK (evaluation_system IN ('traditional-sca', 'cva-descriptive', 'cva-affective', 'legacy')),
        
        -- Traditional SCA Cupping Form (6-10 point scale with 0.25 increments)
        sca_fragrance DECIMAL(4,2) CHECK (sca_fragrance >= 6 AND sca_fragrance <= 10),
        sca_aroma DECIMAL(4,2) CHECK (sca_aroma >= 6 AND sca_aroma <= 10),
        sca_flavor DECIMAL(4,2) CHECK (sca_flavor >= 6 AND sca_flavor <= 10),
        sca_aftertaste DECIMAL(4,2) CHECK (sca_aftertaste >= 6 AND sca_aftertaste <= 10),
        sca_acidity_quality DECIMAL(4,2) CHECK (sca_acidity_quality >= 6 AND sca_acidity_quality <= 10),
        sca_acidity_intensity VARCHAR(10) CHECK (sca_acidity_intensity IN ('High', 'Medium', 'Low')),
        sca_body_quality DECIMAL(4,2) CHECK (sca_body_quality >= 6 AND sca_body_quality <= 10),
        sca_body_level VARCHAR(10) CHECK (sca_body_level IN ('Heavy', 'Medium', 'Thin')),
        sca_balance DECIMAL(4,2) CHECK (sca_balance >= 6 AND sca_balance <= 10),
        sca_overall DECIMAL(4,2) CHECK (sca_overall >= 6 AND sca_overall <= 10),
        sca_uniformity INTEGER CHECK (sca_uniformity >= 0 AND sca_uniformity <= 10 AND sca_uniformity % 2 = 0),
        sca_clean_cup INTEGER CHECK (sca_clean_cup >= 0 AND sca_clean_cup <= 10 AND sca_clean_cup % 2 = 0),
        sca_sweetness INTEGER CHECK (sca_sweetness >= 0 AND sca_sweetness <= 10 AND sca_sweetness % 2 = 0),
        sca_taint_defects INTEGER CHECK (sca_taint_defects >= 0 AND sca_taint_defects <= 20 AND sca_taint_defects % 2 = 0),
        sca_fault_defects INTEGER CHECK (sca_fault_defects >= 0 AND sca_fault_defects <= 40 AND sca_fault_defects % 4 = 0),
        sca_final_score DECIMAL(4,2) CHECK (sca_final_score >= 36 AND sca_final_score <= 100),
        
        -- CVA Descriptive Assessment (SCA Standard 103-P/2024) - 0-15 intensity scale
        cva_desc_fragrance INTEGER CHECK (cva_desc_fragrance >= 0 AND cva_desc_fragrance <= 15),
        cva_desc_aroma INTEGER CHECK (cva_desc_aroma >= 0 AND cva_desc_aroma <= 15),
        cva_desc_flavor INTEGER CHECK (cva_desc_flavor >= 0 AND cva_desc_flavor <= 15),
        cva_desc_aftertaste INTEGER CHECK (cva_desc_aftertaste >= 0 AND cva_desc_aftertaste <= 15),
        cva_desc_acidity INTEGER CHECK (cva_desc_acidity >= 0 AND cva_desc_acidity <= 15),
        cva_desc_sweetness INTEGER CHECK (cva_desc_sweetness >= 0 AND cva_desc_sweetness <= 15),
        cva_desc_mouthfeel INTEGER CHECK (cva_desc_mouthfeel >= 0 AND cva_desc_mouthfeel <= 15),
        
        -- CATA Descriptor arrays (combined per SCA standard)
        cva_desc_fragrance_aroma_descriptors JSONB DEFAULT '[]',  -- Combined fragrance + aroma (≤5 total)
        cva_desc_flavor_aftertaste_descriptors JSONB DEFAULT '[]',  -- Combined flavor + aftertaste (≤5 total)
        cva_desc_main_tastes JSONB DEFAULT '[]',  -- Main tastes (≤2 selections)
        cva_desc_mouthfeel_descriptors JSONB DEFAULT '[]',  -- Mouthfeel descriptors (≤2 selections)
        
        -- Free text descriptors
        cva_desc_acidity_descriptors TEXT,  -- Free text for acidity (e.g., "tartaric, bright")
        cva_desc_sweetness_descriptors TEXT,  -- Free text for sweetness (e.g., "cane sugar, caramel")
        cva_desc_additional_notes TEXT,  -- Additional descriptors not captured elsewhere
        
        -- Assessment metadata
        cva_desc_roast_level VARCHAR(100),  -- Visual roast assessment (e.g., "Light (Agtron 58)")
        cva_desc_assessment_date TIMESTAMP,  -- Assessment completion date
        cva_desc_assessor_id VARCHAR(100),  -- Cupper identification
        
        -- CVA Affective Assessment (1-9 quality scale)
        cva_aff_fragrance INTEGER CHECK (cva_aff_fragrance >= 1 AND cva_aff_fragrance <= 9),
        cva_aff_aroma INTEGER CHECK (cva_aff_aroma >= 1 AND cva_aff_aroma <= 9),
        cva_aff_flavor INTEGER CHECK (cva_aff_flavor >= 1 AND cva_aff_flavor <= 9),
        cva_aff_aftertaste INTEGER CHECK (cva_aff_aftertaste >= 1 AND cva_aff_aftertaste <= 9),
        cva_aff_acidity INTEGER CHECK (cva_aff_acidity >= 1 AND cva_aff_acidity <= 9),
        cva_aff_sweetness INTEGER CHECK (cva_aff_sweetness >= 1 AND cva_aff_sweetness <= 9),
        cva_aff_mouthfeel INTEGER CHECK (cva_aff_mouthfeel >= 1 AND cva_aff_mouthfeel <= 9),
        cva_aff_overall INTEGER CHECK (cva_aff_overall >= 1 AND cva_aff_overall <= 9),
        cva_aff_non_uniform_cups INTEGER CHECK (cva_aff_non_uniform_cups >= 0 AND cva_aff_non_uniform_cups <= 5),
        cva_aff_defective_cups INTEGER CHECK (cva_aff_defective_cups >= 0 AND cva_aff_defective_cups <= 5),
        cva_aff_score DECIMAL(4,2) CHECK (cva_aff_score >= 0 AND cva_aff_score <= 100)
      )
    `);

    // Create collections table with comprehensive schema (PostgreSQL)
    await db.run(`
      CREATE TABLE IF NOT EXISTS collections (
        collection_id UUID PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(20) NOT NULL DEFAULT 'blue',
        is_private BOOLEAN DEFAULT FALSE,
        is_default BOOLEAN DEFAULT FALSE,
        tags JSONB DEFAULT '[]',
        date_created TIMESTAMP NOT NULL,
        date_modified TIMESTAMP NOT NULL
      )
    `);

    // Create recipe_collections junction table for many-to-many relationship (PostgreSQL)
    await db.run(`
      CREATE TABLE IF NOT EXISTS recipe_collections (
        recipe_id UUID NOT NULL,
        collection_id UUID NOT NULL,
        date_assigned TIMESTAMP NOT NULL,
        PRIMARY KEY (recipe_id, collection_id),
        FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id) ON DELETE CASCADE,
        FOREIGN KEY (collection_id) REFERENCES collections (collection_id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

export const createIndexes = async (): Promise<void> => {
  try {
    // Indexes for search and filtering performance
    await db.run('CREATE INDEX IF NOT EXISTS idx_recipes_origin ON recipes (origin)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_recipes_brewing_method ON recipes (brewing_method)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_recipes_roasting_level ON recipes (roasting_level)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_recipes_overall_impression ON recipes (overall_impression)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_recipes_date_created ON recipes (date_created)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_recipes_date_modified ON recipes (date_modified)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_recipes_is_favorite ON recipes (is_favorite)');
    
    // Full-text search indexes for recipe name and tasting notes
    await db.run('CREATE INDEX IF NOT EXISTS idx_recipes_name ON recipes (recipe_name)');
    
    // Collection indexes
    await db.run('CREATE INDEX IF NOT EXISTS idx_collections_name ON collections (name)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_collections_color ON collections (color)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_collections_is_private ON collections (is_private)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_collections_date_created ON collections (date_created)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_collections_date_modified ON collections (date_modified)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_recipe_collections_recipe ON recipe_collections (recipe_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_recipe_collections_collection ON recipe_collections (collection_id)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_recipe_collections_date_assigned ON recipe_collections (date_assigned)');

    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
};

export const initializeDatabase = async (): Promise<void> => {
  try {
    await db.connect();
    await createTables();
    await createIndexes();
    console.log('🎉 Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Drop all tables (for testing/reset purposes)
export const dropTables = async (): Promise<void> => {
  try {
    await db.run('DROP TABLE IF EXISTS recipe_collections');
    await db.run('DROP TABLE IF EXISTS recipes');
    await db.run('DROP TABLE IF EXISTS collections');
    console.log('✅ All tables dropped successfully');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    throw error;
  }
};