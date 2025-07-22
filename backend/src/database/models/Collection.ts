import { v4 as uuidv4 } from 'uuid';
import { db } from '../connection.js';
import type { Collection, CollectionStats, CollectionColor, CollectionInput, CollectionUpdate } from 'coffee-tracker-shared';

interface CollectionRow {
  collection_id: string;
  name: string;
  description: string | null;
  color: string;
  is_private: number;
  is_default: number;
  tags: string | null;
  date_created: string;
  date_modified: string;
}

export class CollectionModel {
  // Convert database row to Collection interface
  private static async rowToCollection(row: CollectionRow): Promise<Collection> {
    // Get recipe IDs for this collection
    const recipesSql = 'SELECT recipe_id FROM recipe_collections WHERE collection_id = ?';
    const recipeRows = await db.all<{ recipe_id: string }>(recipesSql, [row.collection_id]);
    
    // Calculate collection statistics
    const stats = await this.calculateStats(row.collection_id);
    
    return {
      collectionId: row.collection_id,
      name: row.name,
      description: row.description ?? undefined,
      color: row.color as CollectionColor,
      isPrivate: Boolean(row.is_private),
      isDefault: Boolean(row.is_default),
      tags: row.tags ? JSON.parse(row.tags) : [],
      dateCreated: row.date_created,
      dateModified: row.date_modified,
      recipeIds: recipeRows.map(r => r.recipe_id),
      stats,
    };
  }

  // Calculate collection statistics
  private static async calculateStats(collectionId: string): Promise<CollectionStats> {
    const recipesSql = `
      SELECT r.overall_impression, r.brewing_method, r.origin, r.date_created
      FROM recipes r
      INNER JOIN recipe_collections rc ON r.recipe_id = rc.recipe_id
      WHERE rc.collection_id = ?
    `;
    
    const recipes = await db.all<{
      overall_impression: number;
      brewing_method: string | null;
      origin: string;
      date_created: string;
    }>(recipesSql, [collectionId]);

    const totalRecipes = recipes.length;
    
    if (totalRecipes === 0) {
      return {
        totalRecipes: 0,
        averageOverallImpression: 0,
        lastActivityDate: new Date().toISOString(),
      };
    }

    // Calculate averages and most common values
    const averageOverallImpression = recipes.reduce((sum, recipe) => sum + recipe.overall_impression, 0) / totalRecipes;
    
    const brewingMethods = recipes.map(r => r.brewing_method).filter(Boolean);
    const origins = recipes.map(r => r.origin).filter(Boolean);
    
    const mostUsedBrewingMethod = this.getMostCommon(brewingMethods);
    const mostUsedOrigin = this.getMostCommon(origins);
    
    const dates = recipes.map(r => r.date_created).sort();
    const dateRangeStart = dates[0];
    const dateRangeEnd = dates[dates.length - 1];

    // Get last activity date from recipe_collections table
    const lastActivitySql = 'SELECT MAX(date_assigned) as last_activity FROM recipe_collections WHERE collection_id = ?';
    const lastActivityRow = await db.get<{ last_activity: string }>(lastActivitySql, [collectionId]);
    const lastActivityDate = lastActivityRow?.last_activity || new Date().toISOString();

    return {
      totalRecipes,
      averageOverallImpression: Math.round(averageOverallImpression * 100) / 100,
      mostUsedBrewingMethod,
      mostUsedOrigin,
      dateRangeStart: totalRecipes > 0 ? dateRangeStart : undefined,
      dateRangeEnd: totalRecipes > 0 ? dateRangeEnd : undefined,
      lastActivityDate,
    };
  }

  // Helper method to find most common value in array
  private static getMostCommon(arr: (string | null)[]): string | undefined {
    if (arr.length === 0) return undefined;
    
    const counts: Record<string, number> = {};
    arr.forEach(item => {
      if (item) {
        counts[item] = (counts[item] || 0) + 1;
      }
    });

    let maxCount = 0;
    let mostCommon: string | undefined;
    
    Object.entries(counts).forEach(([item, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    });

    return mostCommon;
  }

  // Create a new collection
  public static async create(input: CollectionInput): Promise<Collection> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const sql = `
      INSERT INTO collections (
        collection_id, name, description, color, is_private, is_default, 
        tags, date_created, date_modified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      id,
      input.name.trim(),
      input.description?.trim() ?? null,
      input.color,
      input.isPrivate ? 1 : 0,
      input.isDefault ? 1 : 0,
      JSON.stringify(input.tags || []),
      now,
      now
    ];

    await db.run(sql, params);
    
    const created = await this.findById(id);
    if (!created) {
      throw new Error('Failed to create collection');
    }

    return created;
  }

  // Find collection by ID
  public static async findById(id: string): Promise<Collection | null> {
    const sql = 'SELECT * FROM collections WHERE collection_id = ?';
    const row = await db.get<CollectionRow>(sql, [id]);
    
    if (!row) {
      return null;
    }

    return this.rowToCollection(row);
  }

  // Find collection by name
  public static async findByName(name: string): Promise<Collection | null> {
    const sql = 'SELECT * FROM collections WHERE name = ?';
    const row = await db.get<CollectionRow>(sql, [name.trim()]);
    
    if (!row) {
      return null;
    }

    return this.rowToCollection(row);
  }

  // Get all collections with optional filtering
  public static async findAll(filters?: {
    isPrivate?: boolean;
    color?: CollectionColor;
    searchQuery?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Collection[]> {
    let sql = 'SELECT * FROM collections WHERE 1=1';
    const params: any[] = [];

    // Apply filters
    if (filters?.isPrivate !== undefined) {
      sql += ' AND is_private = ?';
      params.push(filters.isPrivate ? 1 : 0);
    }

    if (filters?.color) {
      sql += ' AND color = ?';
      params.push(filters.color);
    }

    if (filters?.searchQuery) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      const searchPattern = `%${filters.searchQuery}%`;
      params.push(searchPattern, searchPattern);
    }

    // Apply sorting
    const validSortFields = ['name', 'date_created', 'date_modified'];
    const sortBy = validSortFields.includes(filters?.sortBy || '') ? filters!.sortBy : 'name';
    const sortOrder = filters?.sortOrder === 'desc' ? 'DESC' : 'ASC';
    sql += ` ORDER BY ${sortBy} ${sortOrder}`;

    const rows = await db.all<CollectionRow>(sql, params);
    
    const collections = [];
    for (const row of rows) {
      const collection = await this.rowToCollection(row);
      collections.push(collection);
    }

    return collections;
  }

  // Update collection
  public static async update(id: string, updates: CollectionUpdate): Promise<Collection | null> {
    const existing = await this.findById(id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    
    const sql = `
      UPDATE collections SET 
        name = ?, 
        description = ?, 
        color = ?, 
        is_private = ?, 
        is_default = ?, 
        tags = ?, 
        date_modified = ?
      WHERE collection_id = ?
    `;
    
    const params = [
      updates.name?.trim() ?? existing.name,
      updates.description?.trim() ?? existing.description ?? null,
      updates.color ?? existing.color,
      updates.isPrivate !== undefined ? (updates.isPrivate ? 1 : 0) : (existing.isPrivate ? 1 : 0),
      updates.isDefault !== undefined ? (updates.isDefault ? 1 : 0) : (existing.isDefault ? 1 : 0),
      updates.tags !== undefined ? JSON.stringify(updates.tags) : JSON.stringify(existing.tags),
      now,
      id
    ];

    await db.run(sql, params);
    return this.findById(id);
  }

  // Delete collection
  public static async delete(id: string): Promise<boolean> {
    // This will also delete associated recipe_collections due to CASCADE
    const sql = 'DELETE FROM collections WHERE collection_id = ?';
    const result = await db.run(sql, [id]);
    return result.changes! > 0;
  }

  // Add recipe to collection
  public static async addRecipe(collectionId: string, recipeId: string): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const sql = 'INSERT INTO recipe_collections (collection_id, recipe_id, date_assigned) VALUES (?, ?, ?)';
      await db.run(sql, [collectionId, recipeId, now]);
      return true;
    } catch (error) {
      // If it's a duplicate key error, that's fine - recipe is already in collection
      if (error && typeof error === 'object' && 'code' in error && error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
        return true;
      }
      throw error;
    }
  }

  // Remove recipe from collection
  public static async removeRecipe(collectionId: string, recipeId: string): Promise<boolean> {
    const sql = 'DELETE FROM recipe_collections WHERE collection_id = ? AND recipe_id = ?';
    const result = await db.run(sql, [collectionId, recipeId]);
    return result.changes! > 0;
  }

  // Batch add recipes to collection
  public static async batchAddRecipes(collectionId: string, recipeIds: string[]): Promise<{ added: string[], failed: string[] }> {
    const added: string[] = [];
    const failed: string[] = [];

    for (const recipeId of recipeIds) {
      try {
        const success = await this.addRecipe(collectionId, recipeId);
        if (success) {
          added.push(recipeId);
        } else {
          failed.push(recipeId);
        }
      } catch (error) {
        failed.push(recipeId);
      }
    }

    return { added, failed };
  }

  // Batch remove recipes from collection
  public static async batchRemoveRecipes(collectionId: string, recipeIds: string[]): Promise<{ removed: string[], failed: string[] }> {
    const removed: string[] = [];
    const failed: string[] = [];

    for (const recipeId of recipeIds) {
      try {
        const success = await this.removeRecipe(collectionId, recipeId);
        if (success) {
          removed.push(recipeId);
        } else {
          failed.push(recipeId);
        }
      } catch (error) {
        failed.push(recipeId);
      }
    }

    return { removed, failed };
  }

  // Get collections for a specific recipe
  public static async findByRecipeId(recipeId: string): Promise<Collection[]> {
    const sql = `
      SELECT c.* FROM collections c 
      INNER JOIN recipe_collections rc ON c.collection_id = rc.collection_id 
      WHERE rc.recipe_id = ?
      ORDER BY c.name ASC
    `;
    const rows = await db.all<CollectionRow>(sql, [recipeId]);
    
    const collections = [];
    for (const row of rows) {
      const collection = await this.rowToCollection(row);
      collections.push(collection);
    }

    return collections;
  }

  // Check if collection name exists
  public static async nameExists(name: string, excludeId?: string): Promise<boolean> {
    let sql = 'SELECT COUNT(*) as count FROM collections WHERE name = ?';
    const params: string[] = [name.trim()];
    
    if (excludeId) {
      sql += ' AND collection_id != ?';
      params.push(excludeId);
    }
    
    const result = await db.get<{ count: number }>(sql, params);
    return (result?.count ?? 0) > 0;
  }

  // Get collections count
  public static async count(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM collections';
    const result = await db.get<{ count: number }>(sql);
    return result?.count ?? 0;
  }

  // Get recipe count for a collection
  public static async getRecipeCount(collectionId: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM recipe_collections WHERE collection_id = ?';
    const result = await db.get<{ count: number }>(sql, [collectionId]);
    return result?.count ?? 0;
  }

  // Get collection summaries for efficient display
  public static async findAllSummaries(filters?: {
    isPrivate?: boolean;
    color?: CollectionColor;
    searchQuery?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Array<{
    collectionId: string;
    name: string;
    description?: string;
    color: CollectionColor;
    isPrivate: boolean;
    isDefault: boolean;
    tags: string[];
    dateCreated: string;
    dateModified: string;
    recipeCount: number;
    averageRating: number;
    lastActivityDate: string;
  }>> {
    let sql = `
      SELECT 
        c.*,
        COUNT(rc.recipe_id) as recipe_count,
        COALESCE(AVG(r.overall_impression), 0) as average_rating,
        COALESCE(MAX(rc.date_assigned), c.date_created) as last_activity
      FROM collections c
      LEFT JOIN recipe_collections rc ON c.collection_id = rc.collection_id
      LEFT JOIN recipes r ON rc.recipe_id = r.recipe_id
      WHERE 1=1
    `;
    
    const params: any[] = [];

    // Apply filters
    if (filters?.isPrivate !== undefined) {
      sql += ' AND c.is_private = ?';
      params.push(filters.isPrivate ? 1 : 0);
    }

    if (filters?.color) {
      sql += ' AND c.color = ?';
      params.push(filters.color);
    }

    if (filters?.searchQuery) {
      sql += ' AND (c.name LIKE ? OR c.description LIKE ?)';
      const searchPattern = `%${filters.searchQuery}%`;
      params.push(searchPattern, searchPattern);
    }

    sql += ' GROUP BY c.collection_id';

    // Apply sorting
    const validSortFields = ['name', 'date_created', 'date_modified', 'recipe_count'];
    let sortBy = validSortFields.includes(filters?.sortBy || '') ? filters!.sortBy : 'name';
    
    if (sortBy === 'recipe_count') {
      sortBy = 'recipe_count';
    } else {
      sortBy = `c.${sortBy}`;
    }
    
    const sortOrder = filters?.sortOrder === 'desc' ? 'DESC' : 'ASC';
    sql += ` ORDER BY ${sortBy} ${sortOrder}`;

    const rows = await db.all<CollectionRow & {
      recipe_count: number;
      average_rating: number;
      last_activity: string;
    }>(sql, params);

    return rows.map(row => ({
      collectionId: row.collection_id,
      name: row.name,
      description: row.description ?? undefined,
      color: row.color as CollectionColor,
      isPrivate: Boolean(row.is_private),
      isDefault: Boolean(row.is_default),
      tags: row.tags ? JSON.parse(row.tags) : [],
      dateCreated: row.date_created,
      dateModified: row.date_modified,
      recipeCount: row.recipe_count,
      averageRating: Math.round(row.average_rating * 100) / 100,
      lastActivityDate: row.last_activity,
    }));
  }
}

export default CollectionModel;