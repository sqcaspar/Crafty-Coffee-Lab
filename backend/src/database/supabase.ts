import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define the database schema types for TypeScript
interface Recipe {
  recipe_id: string;
  recipe_name: string;
  date_created: string;
  date_modified: string;
  is_favorite: boolean;
  
  // Bean Information
  coffee_bean_brand?: string;
  origin: string;
  processing_method: string;
  altitude?: number;
  roasting_date?: string;
  roasting_level?: string;
  
  // Brewing Parameters
  water_temperature?: number;
  brewing_method?: string;
  grinder_model: string;
  grinder_unit: string;
  filtering_tools?: string;
  turbulence?: string;
  additional_notes?: string;
  
  // Measurements
  coffee_beans: number;
  water: number;
  coffee_water_ratio?: number;
  brewed_coffee_weight?: number;
  tds?: number;
  extraction_yield?: number;
  
  // Legacy evaluation fields
  overall_impression?: number;
  acidity?: number;
  body?: number;
  sweetness?: number;
  flavor?: number;
  aftertaste?: number;
  balance?: number;
  tasting_notes?: string;
  
  // Evaluation system
  evaluation_system?: string;
  
  // Traditional SCA fields
  sca_fragrance?: number;
  sca_aroma?: number;
  sca_flavor?: number;
  sca_aftertaste?: number;
  sca_acidity_quality?: number;
  sca_acidity_intensity?: string;
  sca_body_quality?: number;
  sca_body_level?: string;
  sca_balance?: number;
  sca_overall?: number;
  sca_uniformity?: number;
  sca_clean_cup?: number;
  sca_sweetness?: number;
  sca_taint_defects?: number;
  sca_fault_defects?: number;
  sca_final_score?: number;
  
  // CVA Descriptive fields
  cva_desc_fragrance?: number;
  cva_desc_aroma?: number;
  cva_desc_flavor?: number;
  cva_desc_aftertaste?: number;
  cva_desc_acidity?: number;
  cva_desc_sweetness?: number;
  cva_desc_mouthfeel?: number;
  cva_desc_fragrance_aroma_descriptors?: any[];
  cva_desc_flavor_aftertaste_descriptors?: any[];
  cva_desc_main_tastes?: any[];
  cva_desc_mouthfeel_descriptors?: any[];
  cva_desc_acidity_descriptors?: string;
  cva_desc_sweetness_descriptors?: string;
  cva_desc_additional_notes?: string;
  cva_desc_roast_level?: string;
  cva_desc_assessment_date?: string;
  cva_desc_assessor_id?: string;
  
  // Quick tasting fields
  quick_tasting_flavor_intensity?: number;
  quick_tasting_aftertaste_intensity?: number;
  quick_tasting_acidity_intensity?: number;
  quick_tasting_sweetness_intensity?: number;
  quick_tasting_mouthfeel_intensity?: number;
  quick_tasting_flavor_aftertaste_descriptors?: any[];
  quick_tasting_overall_quality?: number;
  
  // CVA Affective fields
  cva_aff_fragrance?: number;
  cva_aff_aroma?: number;
  cva_aff_flavor?: number;
  cva_aff_aftertaste?: number;
  cva_aff_acidity?: number;
  cva_aff_sweetness?: number;
  cva_aff_mouthfeel?: number;
  cva_aff_overall?: number;
  cva_aff_non_uniform_cups?: number;
  cva_aff_defective_cups?: number;
  cva_aff_score?: number;
}

interface Collection {
  collection_id: string;
  name: string;
  description?: string;
  color: string;
  is_private: boolean;
  is_default: boolean;
  tags: any[];
  date_created: string;
  date_modified: string;
}

interface RecipeCollection {
  recipe_id: string;
  collection_id: string;
  date_assigned: string;
}

// Database schema type
interface Database {
  public: {
    Tables: {
      recipes: {
        Row: Recipe;
        Insert: Omit<Recipe, 'recipe_id' | 'date_created' | 'date_modified'> & {
          recipe_id?: string;
          date_created?: string;
          date_modified?: string;
        };
        Update: Partial<Recipe>;
      };
      collections: {
        Row: Collection;
        Insert: Omit<Collection, 'collection_id' | 'date_created' | 'date_modified'> & {
          collection_id?: string;
          date_created?: string;
          date_modified?: string;
        };
        Update: Partial<Collection>;
      };
      recipe_collections: {
        Row: RecipeCollection;
        Insert: Omit<RecipeCollection, 'date_assigned'> & {
          date_assigned?: string;
        };
        Update: Partial<RecipeCollection>;
      };
    };
  };
}

class SupabaseConnection {
  private static instance: SupabaseConnection;
  private client: SupabaseClient<Database> | null = null;

  private constructor() {}

  public static getInstance(): SupabaseConnection {
    if (!SupabaseConnection.instance) {
      SupabaseConnection.instance = new SupabaseConnection();
    }
    return SupabaseConnection.instance;
  }

  public connect(): SupabaseClient<Database> {
    if (this.client) {
      return this.client;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('❌ Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }

    try {
      this.client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      console.log('✅ Connected to Supabase database (using anon key - secure!)');
      return this.client;
    } catch (error) {
      console.error('❌ Error connecting to Supabase:', error);
      throw error;
    }
  }

  public getClient(): SupabaseClient<Database> {
    if (!this.client) {
      return this.connect();
    }
    return this.client;
  }

  // Helper method to handle Supabase responses with error checking
  public async handleResponse<T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    try {
      const { data, error } = await operation();
      
      if (error) {
        console.error('❌ Supabase operation error:', error);
        throw new Error(`Database operation failed: ${error.message}`);
      }
      
      if (data === null) {
        throw new Error('No data returned from operation');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error in Supabase operation:', error);
      throw error;
    }
  }

  // Helper method for operations that might return null (like single record fetches)
  public async handleOptionalResponse<T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<T | null> {
    try {
      const { data, error } = await operation();
      
      if (error) {
        // Check if this is a "no rows found" error, which is expected for optional operations
        if (error.code === 'PGRST116' || error.message?.includes('no rows returned')) {
          return null;
        }
        console.error('❌ Supabase operation error:', error);
        throw new Error(`Database operation failed: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error in Supabase operation:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const supabase = SupabaseConnection.getInstance();

// Export types for use in other modules
export type { Recipe, Collection, RecipeCollection, Database };

// Graceful shutdown handling (not applicable for Supabase)
process.on('SIGINT', () => {
  console.log('🔄 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🔄 Shutting down gracefully...');
  process.exit(0);
});