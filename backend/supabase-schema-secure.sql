-- Supabase PostgreSQL Schema for Coffee Tracker (Secure with RLS)
-- This file contains the database schema with Row Level Security for public access

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create recipes table with all fields from specification (PostgreSQL)
CREATE TABLE IF NOT EXISTS recipes (
  recipe_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_name VARCHAR(200),
  date_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  date_modified TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT FALSE,
  
  -- Bean Information
  coffee_bean_brand VARCHAR(100),
  origin VARCHAR(100) NOT NULL,
  processing_method VARCHAR(50) NOT NULL,
  altitude INTEGER,
  roasting_date TIMESTAMP WITH TIME ZONE,
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
  
  -- Sensation Record (Legacy fields for backwards compatibility) - NO CONSTRAINTS
  overall_impression INTEGER,
  acidity INTEGER,
  body INTEGER,
  sweetness INTEGER,
  flavor INTEGER,
  aftertaste INTEGER,
  balance INTEGER,
  tasting_notes TEXT,
  
  -- Evaluation System Indicator - NO CONSTRAINTS
  evaluation_system VARCHAR(50),
  
  -- Traditional SCA Cupping Form - NO CONSTRAINTS
  sca_fragrance DECIMAL(10,4),
  sca_aroma DECIMAL(10,4),
  sca_flavor DECIMAL(10,4),
  sca_aftertaste DECIMAL(10,4),
  sca_acidity_quality DECIMAL(10,4),
  sca_acidity_intensity VARCHAR(50),
  sca_body_quality DECIMAL(10,4),
  sca_body_level VARCHAR(50),
  sca_balance DECIMAL(10,4),
  sca_overall DECIMAL(10,4),
  sca_uniformity INTEGER,
  sca_clean_cup INTEGER,
  sca_sweetness INTEGER,
  sca_taint_defects INTEGER,
  sca_fault_defects INTEGER,
  sca_final_score DECIMAL(10,4),
  
  -- CVA Descriptive Assessment (SCA Standard 103-P/2024) - NO CONSTRAINTS
  cva_desc_fragrance INTEGER,
  cva_desc_aroma INTEGER,
  cva_desc_flavor INTEGER,
  cva_desc_aftertaste INTEGER,
  cva_desc_acidity INTEGER,
  cva_desc_sweetness INTEGER,
  cva_desc_mouthfeel INTEGER,
  
  -- CATA Descriptor arrays (combined per SCA standard) - stored as JSONB for better performance
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
  cva_desc_assessment_date TIMESTAMP WITH TIME ZONE,  -- Assessment completion date
  cva_desc_assessor_id VARCHAR(100),  -- Cupper identification
  
  -- Quick Tasting Assessment (combination of CVA Descriptive and CVA Affective elements) - NO CONSTRAINTS
  quick_tasting_flavor_intensity INTEGER,
  quick_tasting_aftertaste_intensity INTEGER,
  quick_tasting_acidity_intensity INTEGER,
  quick_tasting_sweetness_intensity INTEGER,
  quick_tasting_mouthfeel_intensity INTEGER,
  quick_tasting_flavor_aftertaste_descriptors JSONB DEFAULT '[]',
  quick_tasting_overall_quality INTEGER,
  
  -- CVA Affective Assessment - NO CONSTRAINTS
  cva_aff_fragrance INTEGER,
  cva_aff_aroma INTEGER,
  cva_aff_flavor INTEGER,
  cva_aff_aftertaste INTEGER,
  cva_aff_acidity INTEGER,
  cva_aff_sweetness INTEGER,
  cva_aff_mouthfeel INTEGER,
  cva_aff_overall INTEGER,
  cva_aff_non_uniform_cups INTEGER,
  cva_aff_defective_cups INTEGER,
  cva_aff_score DECIMAL(10,4)
);

-- Create collections table with comprehensive schema (PostgreSQL)
CREATE TABLE IF NOT EXISTS collections (
  collection_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20) NOT NULL DEFAULT 'blue',
  is_private BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  tags JSONB DEFAULT '[]',  -- Using JSONB for better performance
  date_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  date_modified TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create recipe_collections junction table for many-to-many relationship (PostgreSQL)
CREATE TABLE IF NOT EXISTS recipe_collections (
  recipe_id UUID NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(collection_id) ON DELETE CASCADE,
  date_assigned TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (recipe_id, collection_id)
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) SETUP FOR PUBLIC ACCESS
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_collections ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (coffee tracker app)
-- These policies allow anyone to perform CRUD operations on recipes

-- Recipes table policies
CREATE POLICY "Public can view all recipes" ON recipes
  FOR SELECT USING (true);

CREATE POLICY "Public can insert recipes" ON recipes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update all recipes" ON recipes
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete all recipes" ON recipes
  FOR DELETE USING (true);

-- Collections table policies
CREATE POLICY "Public can view all collections" ON collections
  FOR SELECT USING (true);

CREATE POLICY "Public can insert collections" ON collections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update all collections" ON collections
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete all collections" ON collections
  FOR DELETE USING (true);

-- Recipe_collections junction table policies
CREATE POLICY "Public can view all recipe_collections" ON recipe_collections
  FOR SELECT USING (true);

CREATE POLICY "Public can insert recipe_collections" ON recipe_collections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update recipe_collections" ON recipe_collections
  FOR UPDATE USING (true);

CREATE POLICY "Public can delete recipe_collections" ON recipe_collections
  FOR DELETE USING (true);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create indexes for search and filtering performance
CREATE INDEX IF NOT EXISTS idx_recipes_origin ON recipes (origin);
CREATE INDEX IF NOT EXISTS idx_recipes_brewing_method ON recipes (brewing_method);
CREATE INDEX IF NOT EXISTS idx_recipes_roasting_level ON recipes (roasting_level);
CREATE INDEX IF NOT EXISTS idx_recipes_overall_impression ON recipes (overall_impression);
CREATE INDEX IF NOT EXISTS idx_recipes_date_created ON recipes (date_created);
CREATE INDEX IF NOT EXISTS idx_recipes_date_modified ON recipes (date_modified);
CREATE INDEX IF NOT EXISTS idx_recipes_is_favorite ON recipes (is_favorite);

-- Full-text search index for recipe name and tasting notes (PostgreSQL specific)
CREATE INDEX IF NOT EXISTS idx_recipes_name_search ON recipes USING gin(to_tsvector('english', recipe_name));
CREATE INDEX IF NOT EXISTS idx_recipes_tasting_notes_search ON recipes USING gin(to_tsvector('english', tasting_notes));

-- JSONB indexes for better performance on descriptor arrays
CREATE INDEX IF NOT EXISTS idx_recipes_fragrance_aroma_desc ON recipes USING gin(cva_desc_fragrance_aroma_descriptors);
CREATE INDEX IF NOT EXISTS idx_recipes_flavor_aftertaste_desc ON recipes USING gin(cva_desc_flavor_aftertaste_descriptors);
CREATE INDEX IF NOT EXISTS idx_recipes_main_tastes ON recipes USING gin(cva_desc_main_tastes);
CREATE INDEX IF NOT EXISTS idx_recipes_mouthfeel_desc ON recipes USING gin(cva_desc_mouthfeel_descriptors);

-- Collection indexes
CREATE INDEX IF NOT EXISTS idx_collections_name ON collections (name);
CREATE INDEX IF NOT EXISTS idx_collections_color ON collections (color);
CREATE INDEX IF NOT EXISTS idx_collections_is_private ON collections (is_private);
CREATE INDEX IF NOT EXISTS idx_collections_date_created ON collections (date_created);
CREATE INDEX IF NOT EXISTS idx_collections_date_modified ON collections (date_modified);
CREATE INDEX IF NOT EXISTS idx_collections_tags ON collections USING gin(tags);

-- Recipe collections indexes
CREATE INDEX IF NOT EXISTS idx_recipe_collections_recipe ON recipe_collections (recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_collections_collection ON recipe_collections (collection_id);
CREATE INDEX IF NOT EXISTS idx_recipe_collections_date_assigned ON recipe_collections (date_assigned);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Trigger to automatically update date_modified on recipes table
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modified = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recipes_modified 
  BEFORE UPDATE ON recipes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_collections_modified 
  BEFORE UPDATE ON collections 
  FOR EACH ROW 
  EXECUTE FUNCTION update_modified_column();

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Seed default collection
INSERT INTO collections (name, description, color, is_default, tags) 
VALUES ('All Recipes', 'Default collection containing all recipes', 'blue', true, '["default"]')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

/*
IMPORTANT SECURITY NOTES:

1. RLS is enabled with public access policies
2. This configuration is suitable for a single-user coffee tracker app
3. The anon key can be safely used in client-side code
4. No sensitive service role key required
5. For multi-user apps, you would add user-based RLS policies

PRODUCTION CONSIDERATIONS:
- For production, consider adding rate limiting
- Monitor usage to stay within Supabase free tier limits
- Consider adding user authentication for multi-user scenarios
- Add backup strategies for important data
*/