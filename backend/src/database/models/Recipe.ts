import { v4 as uuidv4 } from 'uuid';
import { db } from '../connection.js';
import type { Recipe, RecipeInput, RoastingLevel, BrewingMethod, EvaluationSystem } from 'coffee-tracker-shared';

interface RecipeRow {
  recipe_id: string;
  recipe_name: string;
  date_created: Date;
  date_modified: Date;
  is_favorite: boolean; // PostgreSQL stores boolean as boolean
  origin: string;
  processing_method: string;
  altitude: number | null;
  roasting_date: Date | null;
  roasting_level: string | null;
  water_temperature: number | null;
  brewing_method: string | null;
  grinder_model: string;
  grinder_unit: string;
  filtering_tools: string | null;
  turbulence: string | null;
  additional_notes: string | null;
  coffee_beans: number;
  water: number;
  coffee_water_ratio: number;
  brewed_coffee_weight: number | null;
  tds: number | null;
  extraction_yield: number | null;
  
  // Legacy sensation record fields
  overall_impression: number | null;
  acidity: number | null;
  body: number | null;
  sweetness: number | null;
  flavor: number | null;
  aftertaste: number | null;
  balance: number | null;
  tasting_notes: string | null;
  
  // Evaluation system indicator
  evaluation_system: string | null;
  
  // Traditional SCA Cupping Form fields
  sca_fragrance: number | null;
  sca_aroma: number | null;
  sca_flavor: number | null;
  sca_aftertaste: number | null;
  sca_acidity_quality: number | null;
  sca_acidity_intensity: string | null;
  sca_body_quality: number | null;
  sca_body_level: string | null;
  sca_balance: number | null;
  sca_overall: number | null;
  sca_uniformity: number | null;
  sca_clean_cup: number | null;
  sca_sweetness: number | null;
  sca_taint_defects: number | null;
  sca_fault_defects: number | null;
  sca_final_score: number | null;
  
  // CVA Descriptive Assessment fields
  cva_desc_fragrance_intensity: number | null;
  cva_desc_aroma_intensity: number | null;
  cva_desc_flavor_intensity: number | null;
  cva_desc_aftertaste_intensity: number | null;
  cva_desc_acidity_intensity: number | null;
  cva_desc_sweetness_intensity: number | null;
  cva_desc_mouthfeel_intensity: number | null;
  cva_desc_olfactory_descriptors: any; // JSONB array
  cva_desc_retronasal_descriptors: any; // JSONB array
  cva_desc_main_tastes: any; // JSONB array
  cva_desc_mouthfeel_descriptors: any; // JSONB array
  
  // CVA Affective Assessment fields
  cva_aff_fragrance: number | null;
  cva_aff_aroma: number | null;
  cva_aff_flavor: number | null;
  cva_aff_aftertaste: number | null;
  cva_aff_acidity: number | null;
  cva_aff_sweetness: number | null;
  cva_aff_mouthfeel: number | null;
  cva_aff_overall: number | null;
  cva_aff_non_uniform_cups: number | null;
  cva_aff_defective_cups: number | null;
  cva_aff_score: number | null;
}

export class RecipeModel {
  // Convert database row to Recipe interface
  private static rowToRecipe(row: RecipeRow): Recipe {
    return {
      recipeId: row.recipe_id,
      recipeName: row.recipe_name,
      dateCreated: row.date_created.toISOString(),
      dateModified: row.date_modified.toISOString(),
      isFavorite: row.is_favorite,
      collections: [], // Will be populated by separate query
      beanInfo: {
        origin: row.origin,
        processingMethod: row.processing_method,
        altitude: row.altitude ?? undefined,
        roastingDate: row.roasting_date?.toISOString() ?? undefined,
        roastingLevel: row.roasting_level as RoastingLevel ?? undefined,
      },
      brewingParameters: {
        waterTemperature: row.water_temperature ?? undefined,
        brewingMethod: row.brewing_method as BrewingMethod ?? undefined,
        grinderModel: row.grinder_model,
        grinderUnit: row.grinder_unit,
        filteringTools: row.filtering_tools ?? undefined,
        turbulence: row.turbulence ?? undefined,
        additionalNotes: row.additional_notes ?? undefined,
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
          acidityIntensity: row.sca_acidity_intensity as 'High' | 'Medium' | 'Low' ?? undefined,
          body: row.sca_body_quality ?? undefined,
          bodyLevel: row.sca_body_level as 'Heavy' | 'Medium' | 'Thin' ?? undefined,
          balance: row.sca_balance ?? undefined,
          overall: row.sca_overall ?? undefined,
          uniformity: row.sca_uniformity ?? undefined,
          cleanCup: row.sca_clean_cup ?? undefined,
          sweetness: row.sca_sweetness ?? undefined,
          taintDefects: row.sca_taint_defects ?? undefined,
          faultDefects: row.sca_fault_defects ?? undefined,
          finalScore: row.sca_final_score ?? undefined,
        } : undefined,
        
        // CVA Descriptive assessment
        cvaDescriptive: (row.cva_desc_fragrance_intensity !== null || row.cva_desc_aroma_intensity !== null) ? {
          fragranceIntensity: row.cva_desc_fragrance_intensity ?? undefined,
          aromaIntensity: row.cva_desc_aroma_intensity ?? undefined,
          flavorIntensity: row.cva_desc_flavor_intensity ?? undefined,
          aftertasteIntensity: row.cva_desc_aftertaste_intensity ?? undefined,
          acidityIntensity: row.cva_desc_acidity_intensity ?? undefined,
          sweetnessIntensity: row.cva_desc_sweetness_intensity ?? undefined,
          mouthfeelIntensity: row.cva_desc_mouthfeel_intensity ?? undefined,
          olfactoryDescriptors: Array.isArray(row.cva_desc_olfactory_descriptors) ? row.cva_desc_olfactory_descriptors : undefined,
          retronasalDescriptors: Array.isArray(row.cva_desc_retronasal_descriptors) ? row.cva_desc_retronasal_descriptors : undefined,
          mainTastes: Array.isArray(row.cva_desc_main_tastes) ? row.cva_desc_main_tastes : undefined,
          mouthfeelDescriptors: Array.isArray(row.cva_desc_mouthfeel_descriptors) ? row.cva_desc_mouthfeel_descriptors : undefined,
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

  // Helper method to extract evaluation data for database insertion
  private static extractEvaluationData(input: RecipeInput) {
    const sensation = input.sensationRecord;
    
    return {
      // Evaluation system
      evaluationSystem: sensation.evaluationSystem ?? null,
      
      // Legacy fields
      overallImpression: sensation.overallImpression ?? null,
      acidity: sensation.acidity ?? null,
      body: sensation.body ?? null,
      sweetness: sensation.sweetness ?? null,
      flavor: sensation.flavor ?? null,
      aftertaste: sensation.aftertaste ?? null,
      balance: sensation.balance ?? null,
      tastingNotes: sensation.tastingNotes ?? null,
      
      // Traditional SCA
      scaFragrance: sensation.traditionalSCA?.fragrance ?? null,
      scaAroma: sensation.traditionalSCA?.aroma ?? null,
      scaFlavor: sensation.traditionalSCA?.flavor ?? null,
      scaAftertaste: sensation.traditionalSCA?.aftertaste ?? null,
      scaAcidityQuality: sensation.traditionalSCA?.acidity ?? null,
      scaAcidityIntensity: sensation.traditionalSCA?.acidityIntensity ?? null,
      scaBodyQuality: sensation.traditionalSCA?.body ?? null,
      scaBodyLevel: sensation.traditionalSCA?.bodyLevel ?? null,
      scaBalance: sensation.traditionalSCA?.balance ?? null,
      scaOverall: sensation.traditionalSCA?.overall ?? null,
      scaUniformity: sensation.traditionalSCA?.uniformity ?? null,
      scaCleanCup: sensation.traditionalSCA?.cleanCup ?? null,
      scaSweetness: sensation.traditionalSCA?.sweetness ?? null,
      scaTaintDefects: sensation.traditionalSCA?.taintDefects ?? null,
      scaFaultDefects: sensation.traditionalSCA?.faultDefects ?? null,
      scaFinalScore: sensation.traditionalSCA?.finalScore ?? null,
      
      // CVA Descriptive
      cvaDescFragranceIntensity: sensation.cvaDescriptive?.fragranceIntensity ?? null,
      cvaDescAromaIntensity: sensation.cvaDescriptive?.aromaIntensity ?? null,
      cvaDescFlavorIntensity: sensation.cvaDescriptive?.flavorIntensity ?? null,
      cvaDescAftertasteIntensity: sensation.cvaDescriptive?.aftertasteIntensity ?? null,
      cvaDescAcidityIntensity: sensation.cvaDescriptive?.acidityIntensity ?? null,
      cvaDescSweetnessIntensity: sensation.cvaDescriptive?.sweetnessIntensity ?? null,
      cvaDescMouthfeelIntensity: sensation.cvaDescriptive?.mouthfeelIntensity ?? null,
      cvaDescOlfactoryDescriptors: sensation.cvaDescriptive?.olfactoryDescriptors ? JSON.stringify(sensation.cvaDescriptive.olfactoryDescriptors) : null,
      cvaDescRetronasalDescriptors: sensation.cvaDescriptive?.retronasalDescriptors ? JSON.stringify(sensation.cvaDescriptive.retronasalDescriptors) : null,
      cvaDescMainTastes: sensation.cvaDescriptive?.mainTastes ? JSON.stringify(sensation.cvaDescriptive.mainTastes) : null,
      cvaDescMouthfeelDescriptors: sensation.cvaDescriptive?.mouthfeelDescriptors ? JSON.stringify(sensation.cvaDescriptive.mouthfeelDescriptors) : null,
      
      // CVA Affective
      cvaAffFragrance: sensation.cvaAffective?.fragrance ?? null,
      cvaAffAroma: sensation.cvaAffective?.aroma ?? null,
      cvaAffFlavor: sensation.cvaAffective?.flavor ?? null,
      cvaAffAftertaste: sensation.cvaAffective?.aftertaste ?? null,
      cvaAffAcidity: sensation.cvaAffective?.acidity ?? null,
      cvaAffSweetness: sensation.cvaAffective?.sweetness ?? null,
      cvaAffMouthfeel: sensation.cvaAffective?.mouthfeel ?? null,
      cvaAffOverall: sensation.cvaAffective?.overall ?? null,
      cvaAffNonUniformCups: sensation.cvaAffective?.nonUniformCups ?? null,
      cvaAffDefectiveCups: sensation.cvaAffective?.defectiveCups ?? null,
      cvaAffScore: sensation.cvaAffective?.cvaScore ?? null,
    };
  }

  // Create a new recipe
  public static async create(input: RecipeInput): Promise<Recipe> {
    const id = uuidv4();
    const now = new Date();
    const recipeName = this.generateRecipeName(input);
    const coffeeWaterRatio = this.calculateRatio(input.measurements.coffeeBeans, input.measurements.water);
    const evalData = this.extractEvaluationData(input);

    const sql = `
      INSERT INTO recipes (
        recipe_id, recipe_name, date_created, date_modified, is_favorite,
        origin, processing_method, altitude, roasting_date, roasting_level,
        water_temperature, brewing_method, grinder_model, grinder_unit,
        filtering_tools, turbulence, additional_notes,
        coffee_beans, water, coffee_water_ratio, brewed_coffee_weight, tds, extraction_yield,
        evaluation_system,
        overall_impression, acidity, body, sweetness, flavor, aftertaste, balance, tasting_notes,
        sca_fragrance, sca_aroma, sca_flavor, sca_aftertaste, sca_acidity_quality, sca_acidity_intensity,
        sca_body_quality, sca_body_level, sca_balance, sca_overall, sca_uniformity, sca_clean_cup,
        sca_sweetness, sca_taint_defects, sca_fault_defects, sca_final_score,
        cva_desc_fragrance_intensity, cva_desc_aroma_intensity, cva_desc_flavor_intensity, cva_desc_aftertaste_intensity,
        cva_desc_acidity_intensity, cva_desc_sweetness_intensity, cva_desc_mouthfeel_intensity,
        cva_desc_olfactory_descriptors, cva_desc_retronasal_descriptors, cva_desc_main_tastes, cva_desc_mouthfeel_descriptors,
        cva_aff_fragrance, cva_aff_aroma, cva_aff_flavor, cva_aff_aftertaste, cva_aff_acidity,
        cva_aff_sweetness, cva_aff_mouthfeel, cva_aff_overall, cva_aff_non_uniform_cups, cva_aff_defective_cups, cva_aff_score
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
        $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47,
        $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67
      )
    `;

    const params = [
      // Basic recipe info
      id, recipeName, now, now, input.isFavorite,
      input.beanInfo.origin, input.beanInfo.processingMethod, 
      input.beanInfo.altitude ?? null, 
      input.beanInfo.roastingDate ? new Date(input.beanInfo.roastingDate) : null, 
      input.beanInfo.roastingLevel ?? null,
      input.brewingParameters.waterTemperature ?? null, input.brewingParameters.brewingMethod ?? null,
      input.brewingParameters.grinderModel, input.brewingParameters.grinderUnit,
      input.brewingParameters.filteringTools ?? null, input.brewingParameters.turbulence ?? null,
      input.brewingParameters.additionalNotes ?? null,
      input.measurements.coffeeBeans, input.measurements.water, coffeeWaterRatio,
      input.measurements.brewedCoffeeWeight ?? null, input.measurements.tds ?? null, input.measurements.extractionYield ?? null,
      
      // Evaluation data
      evalData.evaluationSystem,
      evalData.overallImpression, evalData.acidity, evalData.body, evalData.sweetness,
      evalData.flavor, evalData.aftertaste, evalData.balance, evalData.tastingNotes,
      
      // Traditional SCA
      evalData.scaFragrance, evalData.scaAroma, evalData.scaFlavor, evalData.scaAftertaste,
      evalData.scaAcidityQuality, evalData.scaAcidityIntensity, evalData.scaBodyQuality, evalData.scaBodyLevel,
      evalData.scaBalance, evalData.scaOverall, evalData.scaUniformity, evalData.scaCleanCup,
      evalData.scaSweetness, evalData.scaTaintDefects, evalData.scaFaultDefects, evalData.scaFinalScore,
      
      // CVA Descriptive
      evalData.cvaDescFragranceIntensity, evalData.cvaDescAromaIntensity, evalData.cvaDescFlavorIntensity, evalData.cvaDescAftertasteIntensity,
      evalData.cvaDescAcidityIntensity, evalData.cvaDescSweetnessIntensity, evalData.cvaDescMouthfeelIntensity,
      evalData.cvaDescOlfactoryDescriptors, evalData.cvaDescRetronasalDescriptors, evalData.cvaDescMainTastes, evalData.cvaDescMouthfeelDescriptors,
      
      // CVA Affective
      evalData.cvaAffFragrance, evalData.cvaAffAroma, evalData.cvaAffFlavor, evalData.cvaAffAftertaste, evalData.cvaAffAcidity,
      evalData.cvaAffSweetness, evalData.cvaAffMouthfeel, evalData.cvaAffOverall, evalData.cvaAffNonUniformCups, evalData.cvaAffDefectiveCups, evalData.cvaAffScore
    ];

    await db.run(sql, params);
    
    const created = await this.findById(id);
    if (!created) {
      throw new Error('Failed to create recipe');
    }

    return created;
  }

  // Find recipe by ID
  public static async findById(id: string): Promise<Recipe | null> {
    const sql = 'SELECT * FROM recipes WHERE recipe_id = $1';
    const row = await db.get<RecipeRow>(sql, [id]);
    
    if (!row) {
      return null;
    }

    const recipe = this.rowToRecipe(row);
    
    // Get collections for this recipe
    const collectionsSql = `
      SELECT c.name FROM collections c 
      INNER JOIN recipe_collections rc ON c.collection_id = rc.collection_id 
      WHERE rc.recipe_id = $1
    `;
    const collections = await db.all<{ name: string }>(collectionsSql, [id]);
    recipe.collections = collections.map(c => c.name);

    return recipe;
  }

  // Get all recipes
  public static async findAll(): Promise<Recipe[]> {
    const sql = 'SELECT * FROM recipes ORDER BY date_modified DESC';
    const rows = await db.all<RecipeRow>(sql);
    
    const recipes = [];
    for (const row of rows) {
      const recipe = this.rowToRecipe(row);
      
      // Get collections for each recipe
      const collectionsSql = `
        SELECT c.name FROM collections c 
        INNER JOIN recipe_collections rc ON c.collection_id = rc.collection_id 
        WHERE rc.recipe_id = $1
      `;
      const collections = await db.all<{ name: string }>(collectionsSql, [row.recipe_id]);
      recipe.collections = collections.map(c => c.name);
      
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

    const now = new Date();
    const recipeName = this.generateRecipeName(input);
    const coffeeWaterRatio = this.calculateRatio(input.measurements.coffeeBeans, input.measurements.water);
    const evalData = this.extractEvaluationData(input);

    const sql = `
      UPDATE recipes SET
        recipe_name = $1, date_modified = $2, is_favorite = $3,
        origin = $4, processing_method = $5, altitude = $6, roasting_date = $7, roasting_level = $8,
        water_temperature = $9, brewing_method = $10, grinder_model = $11, grinder_unit = $12,
        filtering_tools = $13, turbulence = $14, additional_notes = $15,
        coffee_beans = $16, water = $17, coffee_water_ratio = $18, brewed_coffee_weight = $19, tds = $20, extraction_yield = $21,
        evaluation_system = $22,
        overall_impression = $23, acidity = $24, body = $25, sweetness = $26, flavor = $27, 
        aftertaste = $28, balance = $29, tasting_notes = $30,
        sca_fragrance = $31, sca_aroma = $32, sca_flavor = $33, sca_aftertaste = $34, sca_acidity_quality = $35, sca_acidity_intensity = $36,
        sca_body_quality = $37, sca_body_level = $38, sca_balance = $39, sca_overall = $40, sca_uniformity = $41, sca_clean_cup = $42,
        sca_sweetness = $43, sca_taint_defects = $44, sca_fault_defects = $45, sca_final_score = $46,
        cva_desc_fragrance_intensity = $47, cva_desc_aroma_intensity = $48, cva_desc_flavor_intensity = $49, cva_desc_aftertaste_intensity = $50,
        cva_desc_acidity_intensity = $51, cva_desc_sweetness_intensity = $52, cva_desc_mouthfeel_intensity = $53,
        cva_desc_olfactory_descriptors = $54, cva_desc_retronasal_descriptors = $55, cva_desc_main_tastes = $56, cva_desc_mouthfeel_descriptors = $57,
        cva_aff_fragrance = $58, cva_aff_aroma = $59, cva_aff_flavor = $60, cva_aff_aftertaste = $61, cva_aff_acidity = $62,
        cva_aff_sweetness = $63, cva_aff_mouthfeel = $64, cva_aff_overall = $65, cva_aff_non_uniform_cups = $66, cva_aff_defective_cups = $67, cva_aff_score = $68
      WHERE recipe_id = $69
    `;

    const params = [
      // Basic recipe info
      recipeName, now, input.isFavorite,
      input.beanInfo.origin, input.beanInfo.processingMethod,
      input.beanInfo.altitude ?? null, 
      input.beanInfo.roastingDate ? new Date(input.beanInfo.roastingDate) : null, 
      input.beanInfo.roastingLevel ?? null,
      input.brewingParameters.waterTemperature ?? null, input.brewingParameters.brewingMethod ?? null,
      input.brewingParameters.grinderModel, input.brewingParameters.grinderUnit,
      input.brewingParameters.filteringTools ?? null, input.brewingParameters.turbulence ?? null,
      input.brewingParameters.additionalNotes ?? null,
      input.measurements.coffeeBeans, input.measurements.water, coffeeWaterRatio,
      input.measurements.brewedCoffeeWeight ?? null, input.measurements.tds ?? null, input.measurements.extractionYield ?? null,
      
      // Evaluation data
      evalData.evaluationSystem,
      evalData.overallImpression, evalData.acidity, evalData.body, evalData.sweetness,
      evalData.flavor, evalData.aftertaste, evalData.balance, evalData.tastingNotes,
      
      // Traditional SCA
      evalData.scaFragrance, evalData.scaAroma, evalData.scaFlavor, evalData.scaAftertaste,
      evalData.scaAcidityQuality, evalData.scaAcidityIntensity, evalData.scaBodyQuality, evalData.scaBodyLevel,
      evalData.scaBalance, evalData.scaOverall, evalData.scaUniformity, evalData.scaCleanCup,
      evalData.scaSweetness, evalData.scaTaintDefects, evalData.scaFaultDefects, evalData.scaFinalScore,
      
      // CVA Descriptive
      evalData.cvaDescFragranceIntensity, evalData.cvaDescAromaIntensity, evalData.cvaDescFlavorIntensity, evalData.cvaDescAftertasteIntensity,
      evalData.cvaDescAcidityIntensity, evalData.cvaDescSweetnessIntensity, evalData.cvaDescMouthfeelIntensity,
      evalData.cvaDescOlfactoryDescriptors, evalData.cvaDescRetronasalDescriptors, evalData.cvaDescMainTastes, evalData.cvaDescMouthfeelDescriptors,
      
      // CVA Affective
      evalData.cvaAffFragrance, evalData.cvaAffAroma, evalData.cvaAffFlavor, evalData.cvaAffAftertaste, evalData.cvaAffAcidity,
      evalData.cvaAffSweetness, evalData.cvaAffMouthfeel, evalData.cvaAffOverall, evalData.cvaAffNonUniformCups, evalData.cvaAffDefectiveCups, evalData.cvaAffScore,
      
      // WHERE clause
      id
    ];

    await db.run(sql, params);
    return this.findById(id);
  }

  // Delete recipe
  public static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM recipes WHERE recipe_id = $1';
    const result = await db.run(sql, [id]);
    return result.rowCount! > 0;
  }

  // Toggle favorite status
  public static async toggleFavorite(id: string): Promise<Recipe | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const sql = 'UPDATE recipes SET is_favorite = $1, date_modified = $2 WHERE recipe_id = $3';
    const newFavoriteStatus = !existing.isFavorite;
    const now = new Date();
    
    await db.run(sql, [newFavoriteStatus, now, id]);
    return this.findById(id);
  }

  // Get recipes count
  public static async count(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM recipes';
    const result = await db.get<{ count: number }>(sql);
    return result?.count ?? 0;
  }
}

export default RecipeModel;