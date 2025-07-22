import { v4 as uuidv4 } from 'uuid';
import { db } from '../connection.js';
import type { Recipe, RecipeInput, RoastingLevel, BrewingMethod } from 'coffee-tracker-shared';

interface RecipeRow {
  id: string;
  recipe_name: string;
  date_created: string;
  date_modified: string;
  is_favorite: number; // SQLite stores boolean as integer
  origin: string;
  processing_method: string;
  altitude: number | null;
  roasting_date: string | null;
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
  tds: number | null;
  extraction_yield: number | null;
  overall_impression: number;
  acidity: number | null;
  body: number | null;
  sweetness: number | null;
  flavor: number | null;
  aftertaste: number | null;
  balance: number | null;
  tasting_notes: string | null;
}

export class RecipeModel {
  // Convert database row to Recipe interface
  private static rowToRecipe(row: RecipeRow): Recipe {
    return {
      recipeId: row.id,
      recipeName: row.recipe_name,
      dateCreated: row.date_created,
      dateModified: row.date_modified,
      isFavorite: Boolean(row.is_favorite),
      collections: [], // Will be populated by separate query
      beanInfo: {
        origin: row.origin,
        processingMethod: row.processing_method,
        altitude: row.altitude ?? undefined,
        roastingDate: row.roasting_date ?? undefined,
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
        tds: row.tds ?? undefined,
        extractionYield: row.extraction_yield ?? undefined,
      },
      sensationRecord: {
        overallImpression: row.overall_impression,
        acidity: row.acidity ?? undefined,
        body: row.body ?? undefined,
        sweetness: row.sweetness ?? undefined,
        flavor: row.flavor ?? undefined,
        aftertaste: row.aftertaste ?? undefined,
        balance: row.balance ?? undefined,
        tastingNotes: row.tasting_notes ?? undefined,
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

  // Create a new recipe
  public static async create(input: RecipeInput): Promise<Recipe> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const recipeName = this.generateRecipeName(input);
    const coffeeWaterRatio = this.calculateRatio(input.measurements.coffeeBeans, input.measurements.water);

    const sql = `
      INSERT INTO recipes (
        id, recipe_name, date_created, date_modified, is_favorite,
        origin, processing_method, altitude, roasting_date, roasting_level,
        water_temperature, brewing_method, grinder_model, grinder_unit,
        filtering_tools, turbulence, additional_notes,
        coffee_beans, water, coffee_water_ratio, tds, extraction_yield,
        overall_impression, acidity, body, sweetness, flavor, aftertaste, balance, tasting_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      id, recipeName, now, now, input.isFavorite ? 1 : 0,
      input.beanInfo.origin, input.beanInfo.processingMethod, 
      input.beanInfo.altitude ?? null, input.beanInfo.roastingDate ?? null, input.beanInfo.roastingLevel ?? null,
      input.brewingParameters.waterTemperature ?? null, input.brewingParameters.brewingMethod ?? null,
      input.brewingParameters.grinderModel, input.brewingParameters.grinderUnit,
      input.brewingParameters.filteringTools ?? null, input.brewingParameters.turbulence ?? null,
      input.brewingParameters.additionalNotes ?? null,
      input.measurements.coffeeBeans, input.measurements.water, coffeeWaterRatio,
      input.measurements.tds ?? null, input.measurements.extractionYield ?? null,
      input.sensationRecord.overallImpression, input.sensationRecord.acidity ?? null,
      input.sensationRecord.body ?? null, input.sensationRecord.sweetness ?? null,
      input.sensationRecord.flavor ?? null, input.sensationRecord.aftertaste ?? null,
      input.sensationRecord.balance ?? null, input.sensationRecord.tastingNotes ?? null
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
    const sql = 'SELECT * FROM recipes WHERE id = ?';
    const row = await db.get<RecipeRow>(sql, [id]);
    
    if (!row) {
      return null;
    }

    const recipe = this.rowToRecipe(row);
    
    // Get collections for this recipe
    const collectionsSql = `
      SELECT c.name FROM collections c 
      INNER JOIN recipe_collections rc ON c.id = rc.collection_id 
      WHERE rc.recipe_id = ?
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
        INNER JOIN recipe_collections rc ON c.id = rc.collection_id 
        WHERE rc.recipe_id = ?
      `;
      const collections = await db.all<{ name: string }>(collectionsSql, [row.id]);
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

    const now = new Date().toISOString();
    const recipeName = this.generateRecipeName(input);
    const coffeeWaterRatio = this.calculateRatio(input.measurements.coffeeBeans, input.measurements.water);

    const sql = `
      UPDATE recipes SET
        recipe_name = ?, date_modified = ?, is_favorite = ?,
        origin = ?, processing_method = ?, altitude = ?, roasting_date = ?, roasting_level = ?,
        water_temperature = ?, brewing_method = ?, grinder_model = ?, grinder_unit = ?,
        filtering_tools = ?, turbulence = ?, additional_notes = ?,
        coffee_beans = ?, water = ?, coffee_water_ratio = ?, tds = ?, extraction_yield = ?,
        overall_impression = ?, acidity = ?, body = ?, sweetness = ?, flavor = ?, 
        aftertaste = ?, balance = ?, tasting_notes = ?
      WHERE id = ?
    `;

    const params = [
      recipeName, now, input.isFavorite ? 1 : 0,
      input.beanInfo.origin, input.beanInfo.processingMethod,
      input.beanInfo.altitude ?? null, input.beanInfo.roastingDate ?? null, input.beanInfo.roastingLevel ?? null,
      input.brewingParameters.waterTemperature ?? null, input.brewingParameters.brewingMethod ?? null,
      input.brewingParameters.grinderModel, input.brewingParameters.grinderUnit,
      input.brewingParameters.filteringTools ?? null, input.brewingParameters.turbulence ?? null,
      input.brewingParameters.additionalNotes ?? null,
      input.measurements.coffeeBeans, input.measurements.water, coffeeWaterRatio,
      input.measurements.tds ?? null, input.measurements.extractionYield ?? null,
      input.sensationRecord.overallImpression, input.sensationRecord.acidity ?? null,
      input.sensationRecord.body ?? null, input.sensationRecord.sweetness ?? null,
      input.sensationRecord.flavor ?? null, input.sensationRecord.aftertaste ?? null,
      input.sensationRecord.balance ?? null, input.sensationRecord.tastingNotes ?? null,
      id
    ];

    await db.run(sql, params);
    return this.findById(id);
  }

  // Delete recipe
  public static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM recipes WHERE id = ?';
    const result = await db.run(sql, [id]);
    return result.changes! > 0;
  }

  // Toggle favorite status
  public static async toggleFavorite(id: string): Promise<Recipe | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const sql = 'UPDATE recipes SET is_favorite = ?, date_modified = ? WHERE id = ?';
    const newFavoriteStatus = existing.isFavorite ? 0 : 1;
    const now = new Date().toISOString();
    
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