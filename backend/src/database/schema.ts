import { db } from './connection.js';

export const createTables = async (): Promise<void> => {
  try {
    // Create recipes table with all fields from specification
    await db.run(`
      CREATE TABLE IF NOT EXISTS recipes (
        recipe_id TEXT PRIMARY KEY,
        recipe_name TEXT,
        date_created TEXT NOT NULL,
        date_modified TEXT NOT NULL,
        is_favorite BOOLEAN DEFAULT FALSE,
        
        -- Bean Information
        origin TEXT NOT NULL,
        processing_method TEXT NOT NULL,
        altitude INTEGER,
        roasting_date TEXT,
        roasting_level TEXT,
        
        -- Brewing Parameters
        water_temperature REAL,
        brewing_method TEXT,
        grinder_model TEXT NOT NULL,
        grinder_unit TEXT NOT NULL,
        filtering_tools TEXT,
        turbulence TEXT,
        additional_notes TEXT,
        
        -- Measurements
        coffee_beans REAL NOT NULL,
        water REAL NOT NULL,
        coffee_water_ratio REAL,
        tds REAL,
        extraction_yield REAL,
        
        -- Sensation Record
        overall_impression INTEGER NOT NULL CHECK (overall_impression >= 1 AND overall_impression <= 10),
        acidity INTEGER CHECK (acidity >= 1 AND acidity <= 10),
        body INTEGER CHECK (body >= 1 AND body <= 10),
        sweetness INTEGER CHECK (sweetness >= 1 AND sweetness <= 10),
        flavor INTEGER CHECK (flavor >= 1 AND flavor <= 10),
        aftertaste INTEGER CHECK (aftertaste >= 1 AND aftertaste <= 10),
        balance INTEGER CHECK (balance >= 1 AND balance <= 10),
        tasting_notes TEXT
      )
    `);

    // Create collections table with comprehensive schema
    await db.run(`
      CREATE TABLE IF NOT EXISTS collections (
        collection_id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        color TEXT NOT NULL DEFAULT 'blue',
        is_private BOOLEAN DEFAULT FALSE,
        is_default BOOLEAN DEFAULT FALSE,
        tags TEXT DEFAULT '[]',
        date_created TEXT NOT NULL,
        date_modified TEXT NOT NULL
      )
    `);

    // Create recipe_collections junction table for many-to-many relationship
    await db.run(`
      CREATE TABLE IF NOT EXISTS recipe_collections (
        recipe_id TEXT NOT NULL,
        collection_id TEXT NOT NULL,
        date_assigned TEXT NOT NULL,
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