import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabase.js';
import type { Recipe, RecipeInput, RoastingLevel, BrewingMethod, EvaluationSystem } from '../../shared/index.js';

export class RecipeModel {
  // Convert database row to Recipe interface
  private static rowToRecipe(row: any): Recipe {
    return {
      recipeId: row.recipe_id,
      recipeName: row.recipe_name,
      dateCreated: new Date(row.date_created).toISOString(),
      dateModified: new Date(row.date_modified).toISOString(),
      isFavorite: row.is_favorite,
      collections: [], // Will be populated by separate query
      beanInfo: {
        coffeeBeanBrand: row.coffee_bean_brand ?? undefined,
        origin: row.origin,
        processingMethod: row.processing_method,
        altitude: row.altitude ?? undefined,
        roastingDate: row.roasting_date ? new Date(row.roasting_date).toISOString() : undefined,
        roastingLevel: row.roasting_level as RoastingLevel ?? undefined,
      },
      brewingParameters: {
        waterTemperature: row.water_temperature ?? undefined,
        brewingMethod: row.brewing_method as BrewingMethod ?? undefined,
        grinderModel: row.grinder_model,
        grinderUnit: row.grinder_unit,
        filteringTools: row.filtering_tools ?? undefined,
        additionalNotes: row.additional_notes ?? undefined,
      },
      turbulenceInfo: {
        turbulence: row.turbulence ?? undefined,
      },
      measurements: {
        coffeeBeans: row.coffee_beans,
        water: row.water,
        coffeeWaterRatio: row.coffee_water_ratio,
        brewedCoffeeWeight: row.brewed_coffee_weight ?? undefined,
        tds: row.tds ?? undefined,
        extractionYield: row.extraction_yield ?? undefined,
      },
      sensationRecord: {
        // Evaluation system indicator
        evaluationSystem: row.evaluation_system as EvaluationSystem ?? undefined,
        
        // Legacy fields (maintain backwards compatibility)
        overallImpression: row.overall_impression ?? undefined,
        acidity: row.acidity ?? undefined,
        body: row.body ?? undefined,
        sweetness: row.sweetness ?? undefined,
        flavor: row.flavor ?? undefined,
        aftertaste: row.aftertaste ?? undefined,
        balance: row.balance ?? undefined,
        tastingNotes: row.tasting_notes ?? undefined,
        
        // Traditional SCA evaluation
        traditionalSCA: (row.sca_fragrance || row.sca_aroma || row.sca_flavor) ? {
          fragrance: row.sca_fragrance ?? undefined,
          aroma: row.sca_aroma ?? undefined,
          flavor: row.sca_flavor ?? undefined,
          aftertaste: row.sca_aftertaste ?? undefined,
          acidity: row.sca_acidity_quality ?? undefined,
          body: row.sca_body_quality ?? undefined,
          balance: row.sca_balance ?? undefined,
          overall: row.sca_overall ?? undefined,
          uniformity: row.sca_uniformity ?? undefined,
          cleanCup: row.sca_clean_cup ?? undefined,
          sweetness: row.sca_sweetness ?? undefined,
          taintDefects: row.sca_taint_defects ?? undefined,
          faultDefects: row.sca_fault_defects ?? undefined,
          finalScore: row.sca_final_score ?? undefined,
        } : undefined,
        
        // CVA Descriptive assessment (SCA Standard 103-P/2024)
        cvaDescriptive: (row.cva_desc_fragrance !== null || row.cva_desc_aroma !== null) ? {
          fragrance: row.cva_desc_fragrance ?? undefined,
          aroma: row.cva_desc_aroma ?? undefined,
          flavor: row.cva_desc_flavor ?? undefined,
          aftertaste: row.cva_desc_aftertaste ?? undefined,
          acidity: row.cva_desc_acidity ?? undefined,
          sweetness: row.cva_desc_sweetness ?? undefined,
          mouthfeel: row.cva_desc_mouthfeel ?? undefined,
          fragranceAromaDescriptors: Array.isArray(row.cva_desc_fragrance_aroma_descriptors) ? row.cva_desc_fragrance_aroma_descriptors : undefined,
          flavorAftertasteDescriptors: Array.isArray(row.cva_desc_flavor_aftertaste_descriptors) ? row.cva_desc_flavor_aftertaste_descriptors : undefined,
          mainTastes: Array.isArray(row.cva_desc_main_tastes) ? row.cva_desc_main_tastes : undefined,
          mouthfeelDescriptors: Array.isArray(row.cva_desc_mouthfeel_descriptors) ? row.cva_desc_mouthfeel_descriptors : undefined,
          acidityDescriptors: row.cva_desc_acidity_descriptors ?? undefined,
          sweetnessDescriptors: row.cva_desc_sweetness_descriptors ?? undefined,
          additionalNotes: row.cva_desc_additional_notes ?? undefined,
          roastLevel: row.cva_desc_roast_level ?? undefined,
          assessmentDate: row.cva_desc_assessment_date ? new Date(row.cva_desc_assessment_date).toISOString() : undefined,
          assessorId: row.cva_desc_assessor_id ?? undefined,
        } : undefined,
        
        // Quick Tasting assessment (combination of CVA Descriptive and CVA Affective elements)
        quickTasting: (row.quick_tasting_flavor_intensity !== null || row.quick_tasting_overall_quality !== null) ? {
          flavorIntensity: row.quick_tasting_flavor_intensity ?? undefined,
          aftertasteIntensity: row.quick_tasting_aftertaste_intensity ?? undefined,
          acidityIntensity: row.quick_tasting_acidity_intensity ?? undefined,
          sweetnessIntensity: row.quick_tasting_sweetness_intensity ?? undefined,
          mouthfeelIntensity: row.quick_tasting_mouthfeel_intensity ?? undefined,
          flavorAftertasteDescriptors: Array.isArray(row.quick_tasting_flavor_aftertaste_descriptors) ? row.quick_tasting_flavor_aftertaste_descriptors : undefined,
          overallQuality: row.quick_tasting_overall_quality ?? undefined,
        } : undefined,
        
        // CVA Affective assessment
        cvaAffective: (row.cva_aff_fragrance !== null || row.cva_aff_aroma !== null) ? {
          fragrance: row.cva_aff_fragrance ?? undefined,
          aroma: row.cva_aff_aroma ?? undefined,
          flavor: row.cva_aff_flavor ?? undefined,
          aftertaste: row.cva_aff_aftertaste ?? undefined,
          acidity: row.cva_aff_acidity ?? undefined,
          sweetness: row.cva_aff_sweetness ?? undefined,
          mouthfeel: row.cva_aff_mouthfeel ?? undefined,
          overall: row.cva_aff_overall ?? undefined,
          nonUniformCups: row.cva_aff_non_uniform_cups ?? undefined,
          defectiveCups: row.cva_aff_defective_cups ?? undefined,
          cvaScore: row.cva_aff_score ?? undefined,
        } : undefined,
      },
    };
  }

  // Calculate coffee to water ratio
  private static calculateRatio(coffeeBeans: number, water: number): number {
    return Math.round((water / coffeeBeans) * 100) / 100;
  }

  // Generate recipe name if not provided
  private static generateRecipeName(input: RecipeInput): string {
    if (input.recipeName?.trim()) {
      return input.recipeName.trim();
    }
    const date = new Date().toLocaleDateString();
    return `${input.beanInfo.origin} - ${date}`;
  }

  // Helper method to prepare evaluation data for database insertion
  private static prepareEvaluationData(input: RecipeInput) {
    const sensation = input.sensationRecord;
    
    // Explicit handling of evaluation_system field
    const evaluationSystem = sensation.evaluationSystem ?? undefined;
    if (!evaluationSystem) {
      console.log('RecipeModel: No evaluation_system provided, using undefined for database');
    } else {
      console.log(`RecipeModel: Using evaluation_system: '${evaluationSystem}'`);
    }
    
    return {
      // Evaluation system (explicitly handled)
      evaluation_system: evaluationSystem,
      
      // Legacy fields
      overall_impression: sensation.overallImpression ?? null,
      acidity: sensation.acidity ?? null,
      body: sensation.body ?? null,
      sweetness: sensation.sweetness ?? null,
      flavor: sensation.flavor ?? null,
      aftertaste: sensation.aftertaste ?? null,
      balance: sensation.balance ?? null,
      tasting_notes: sensation.tastingNotes ?? null,
      
      // Traditional SCA
      sca_fragrance: sensation.traditionalSCA?.fragrance ?? null,
      sca_aroma: sensation.traditionalSCA?.aroma ?? null,
      sca_flavor: sensation.traditionalSCA?.flavor ?? null,
      sca_aftertaste: sensation.traditionalSCA?.aftertaste ?? null,
      sca_acidity_quality: sensation.traditionalSCA?.acidity ?? null,
      sca_body_quality: sensation.traditionalSCA?.body ?? null,
      sca_balance: sensation.traditionalSCA?.balance ?? null,
      sca_overall: sensation.traditionalSCA?.overall ?? null,
      sca_uniformity: sensation.traditionalSCA?.uniformity ?? null,
      sca_clean_cup: sensation.traditionalSCA?.cleanCup ?? null,
      sca_sweetness: sensation.traditionalSCA?.sweetness ?? null,
      sca_taint_defects: sensation.traditionalSCA?.taintDefects ?? null,
      sca_fault_defects: sensation.traditionalSCA?.faultDefects ?? null,
      sca_final_score: sensation.traditionalSCA?.finalScore ?? null,
      
      // CVA Descriptive Assessment (SCA Standard 103-P/2024)
      cva_desc_fragrance: sensation.cvaDescriptive?.fragrance ?? null,
      cva_desc_aroma: sensation.cvaDescriptive?.aroma ?? null,
      cva_desc_flavor: sensation.cvaDescriptive?.flavor ?? null,
      cva_desc_aftertaste: sensation.cvaDescriptive?.aftertaste ?? null,
      cva_desc_acidity: sensation.cvaDescriptive?.acidity ?? null,
      cva_desc_sweetness: sensation.cvaDescriptive?.sweetness ?? null,
      cva_desc_mouthfeel: sensation.cvaDescriptive?.mouthfeel ?? null,
      
      // CATA Descriptor arrays (using JSONB in PostgreSQL)
      cva_desc_fragrance_aroma_descriptors: sensation.cvaDescriptive?.fragranceAromaDescriptors ?? null,
      cva_desc_flavor_aftertaste_descriptors: sensation.cvaDescriptive?.flavorAftertasteDescriptors ?? null,
      cva_desc_main_tastes: sensation.cvaDescriptive?.mainTastes ?? null,
      cva_desc_mouthfeel_descriptors: sensation.cvaDescriptive?.mouthfeelDescriptors ?? null,
      
      // Free text descriptors
      cva_desc_acidity_descriptors: sensation.cvaDescriptive?.acidityDescriptors ?? null,
      cva_desc_sweetness_descriptors: sensation.cvaDescriptive?.sweetnessDescriptors ?? null,
      cva_desc_additional_notes: sensation.cvaDescriptive?.additionalNotes ?? null,
      
      // Assessment metadata
      cva_desc_roast_level: sensation.cvaDescriptive?.roastLevel ?? null,
      cva_desc_assessment_date: sensation.cvaDescriptive?.assessmentDate ?? null,
      cva_desc_assessor_id: sensation.cvaDescriptive?.assessorId ?? null,
      
      // Quick Tasting
      quick_tasting_flavor_intensity: sensation.quickTasting?.flavorIntensity ?? null,
      quick_tasting_aftertaste_intensity: sensation.quickTasting?.aftertasteIntensity ?? null,
      quick_tasting_acidity_intensity: sensation.quickTasting?.acidityIntensity ?? null,
      quick_tasting_sweetness_intensity: sensation.quickTasting?.sweetnessIntensity ?? null,
      quick_tasting_mouthfeel_intensity: sensation.quickTasting?.mouthfeelIntensity ?? null,
      quick_tasting_flavor_aftertaste_descriptors: sensation.quickTasting?.flavorAftertasteDescriptors ?? null,
      quick_tasting_overall_quality: sensation.quickTasting?.overallQuality ?? null,
      
      // CVA Affective
      cva_aff_fragrance: sensation.cvaAffective?.fragrance ?? null,
      cva_aff_aroma: sensation.cvaAffective?.aroma ?? null,
      cva_aff_flavor: sensation.cvaAffective?.flavor ?? null,
      cva_aff_aftertaste: sensation.cvaAffective?.aftertaste ?? null,
      cva_aff_acidity: sensation.cvaAffective?.acidity ?? null,
      cva_aff_sweetness: sensation.cvaAffective?.sweetness ?? null,
      cva_aff_mouthfeel: sensation.cvaAffective?.mouthfeel ?? null,
      cva_aff_overall: sensation.cvaAffective?.overall ?? null,
      cva_aff_non_uniform_cups: sensation.cvaAffective?.nonUniformCups ?? null,
      cva_aff_defective_cups: sensation.cvaAffective?.defectiveCups ?? null,
      cva_aff_score: sensation.cvaAffective?.cvaScore ?? null,
    };
  }

  // Create a new recipe
  public static async create(input: RecipeInput): Promise<Recipe> {
    const client = supabase.getClient();
    const id = uuidv4();
    const recipeName = this.generateRecipeName(input);
    const coffeeWaterRatio = this.calculateRatio(input.measurements.coffeeBeans, input.measurements.water);
    const evalData = this.prepareEvaluationData(input);

    const recipeData = {
      recipe_id: id,
      recipe_name: recipeName,
      is_favorite: input.isFavorite,
      
      // Bean information
      coffee_bean_brand: input.beanInfo.coffeeBeanBrand ?? null,
      origin: input.beanInfo.origin,
      processing_method: input.beanInfo.processingMethod,
      altitude: input.beanInfo.altitude ?? null,
      roasting_date: input.beanInfo.roastingDate ?? null,
      roasting_level: input.beanInfo.roastingLevel ?? null,
      
      // Brewing parameters
      water_temperature: input.brewingParameters.waterTemperature ?? null,
      brewing_method: input.brewingParameters.brewingMethod ?? null,
      grinder_model: input.brewingParameters.grinderModel,
      grinder_unit: input.brewingParameters.grinderUnit,
      filtering_tools: input.brewingParameters.filteringTools ?? null,
      turbulence: input.turbulenceInfo?.turbulence ?? null,
      additional_notes: input.brewingParameters.additionalNotes ?? null,
      
      // Measurements
      coffee_beans: input.measurements.coffeeBeans,
      water: input.measurements.water,
      coffee_water_ratio: coffeeWaterRatio,
      brewed_coffee_weight: input.measurements.brewedCoffeeWeight ?? null,
      tds: input.measurements.tds ?? null,
      extraction_yield: input.measurements.extractionYield ?? null,
      
      // Evaluation data
      ...evalData
    };

    const result = await supabase.handleResponse(async () => {
      return client.from('recipes').insert(recipeData).select().single();
    });

    return this.rowToRecipe(result);
  }

  // Find recipe by ID
  public static async findById(id: string): Promise<Recipe | null> {
    const client = supabase.getClient();
    
    const result = await supabase.handleOptionalResponse(async () => {
      return client.from('recipes').select('*').eq('recipe_id', id).single();
    });
    
    if (!result) {
      return null;
    }

    const recipe = this.rowToRecipe(result);
    
    // Get collections for this recipe
    const collections = await supabase.handleResponse(async () => {
      return client
        .from('recipe_collections')
        .select(`
          collections (
            name
          )
        `)
        .eq('recipe_id', id);
    });
    
    recipe.collections = collections.map((rc: any) => rc.collections.name);
    return recipe;
  }

  // Get all recipes
  public static async findAll(): Promise<Recipe[]> {
    const client = supabase.getClient();
    
    const rows = await supabase.handleResponse(async () => {
      return client.from('recipes').select('*').order('date_modified', { ascending: false });
    });
    
    const recipes = [];
    for (const row of rows) {
      const recipe = this.rowToRecipe(row);
      
      // Get collections for each recipe
      const collections = await supabase.handleResponse(async () => {
        return client
          .from('recipe_collections')
          .select(`
            collections (
              name
            )
          `)
          .eq('recipe_id', row.recipe_id);
      });
      
      recipe.collections = collections.map((rc: any) => rc.collections.name);
      recipes.push(recipe);
    }

    return recipes;
  }

  // Update recipe
  public static async update(id: string, input: RecipeInput): Promise<Recipe | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const client = supabase.getClient();
    const recipeName = this.generateRecipeName(input);
    const coffeeWaterRatio = this.calculateRatio(input.measurements.coffeeBeans, input.measurements.water);
    const evalData = this.prepareEvaluationData(input);

    const updateData = {
      recipe_name: recipeName,
      is_favorite: input.isFavorite,
      
      // Bean information
      coffee_bean_brand: input.beanInfo.coffeeBeanBrand ?? null,
      origin: input.beanInfo.origin,
      processing_method: input.beanInfo.processingMethod,
      altitude: input.beanInfo.altitude ?? null,
      roasting_date: input.beanInfo.roastingDate ?? null,
      roasting_level: input.beanInfo.roastingLevel ?? null,
      
      // Brewing parameters
      water_temperature: input.brewingParameters.waterTemperature ?? null,
      brewing_method: input.brewingParameters.brewingMethod ?? null,
      grinder_model: input.brewingParameters.grinderModel,
      grinder_unit: input.brewingParameters.grinderUnit,
      filtering_tools: input.brewingParameters.filteringTools ?? null,
      turbulence: input.turbulenceInfo?.turbulence ?? null,
      additional_notes: input.brewingParameters.additionalNotes ?? null,
      
      // Measurements
      coffee_beans: input.measurements.coffeeBeans,
      water: input.measurements.water,
      coffee_water_ratio: coffeeWaterRatio,
      brewed_coffee_weight: input.measurements.brewedCoffeeWeight ?? null,
      tds: input.measurements.tds ?? null,
      extraction_yield: input.measurements.extractionYield ?? null,
      
      // Evaluation data
      ...evalData
    };

    await client.from('recipes').update(updateData).eq('recipe_id', id);

    return this.findById(id);
  }

  // Delete recipe
  public static async delete(id: string): Promise<boolean> {
    const client = supabase.getClient();
    
    await client.from('recipes').delete().eq('recipe_id', id);

    return true; // Supabase delete returns success if no error
  }

  // Toggle favorite status
  public static async toggleFavorite(id: string): Promise<Recipe | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const client = supabase.getClient();
    const newFavoriteStatus = !existing.isFavorite;
    
    await client
      .from('recipes')
      .update({ is_favorite: newFavoriteStatus })
      .eq('recipe_id', id);

    return this.findById(id);
  }

  // Get recipes count
  public static async count(): Promise<number> {
    const client = supabase.getClient();
    
    const { count } = await client.from('recipes').select('*', { count: 'exact', head: true });
    return count ?? 0;
  }
}

export default RecipeModel;