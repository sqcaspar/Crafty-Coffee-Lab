import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabase.js';
import type { Collection, CollectionStats, CollectionColor, CollectionInput, CollectionUpdate } from '../../shared/index.js';

export class CollectionModel {
  // Convert database row to Collection interface
  private static async rowToCollection(row: any): Promise<Collection> {
    const client = supabase.getClient();
    
    // Get recipe IDs for this collection
    const recipeRows = await supabase.handleResponse(async () => {
      return client
        .from('recipe_collections')
        .select('recipe_id')
        .eq('collection_id', row.collection_id);
    });
    
    // Calculate collection statistics
    const stats = await this.calculateStats(row.collection_id);
    
    return {
      collectionId: row.collection_id,
      name: row.name,
      description: row.description ?? undefined,
      color: row.color as CollectionColor,
      isPrivate: row.is_private,
      isDefault: row.is_default,
      tags: Array.isArray(row.tags) ? row.tags : [],
      dateCreated: new Date(row.date_created).toISOString(),
      dateModified: new Date(row.date_modified).toISOString(),
      recipeIds: recipeRows.map(r => r.recipe_id),
      stats,
    };
  }

  // Calculate collection statistics
  private static async calculateStats(collectionId: string): Promise<CollectionStats> {
    const client = supabase.getClient();
    
    const recipes = await supabase.handleResponse(async () => {
      return client
        .from('recipe_collections')
        .select(`
          recipes (
            overall_impression,
            brewing_method,
            origin,
            date_created
          )
        `)
        .eq('collection_id', collectionId);
    });

    const flatRecipes = recipes.map((rc: any) => rc.recipes).filter((r: any) => r);
    const totalRecipes = flatRecipes.length;
    
    if (totalRecipes === 0) {
      return {
        totalRecipes: 0,
        averageOverallImpression: 0,
        lastActivityDate: new Date().toISOString(),
      };
    }

    // Calculate averages and most common values
    const ratingsSum = flatRecipes.reduce((sum: number, recipe: any) => sum + (recipe.overall_impression || 0), 0);
    const averageOverallImpression = ratingsSum / totalRecipes;
    
    const brewingMethods = flatRecipes.map((r: any) => r.brewing_method).filter(Boolean);
    const origins = flatRecipes.map((r: any) => r.origin).filter(Boolean);
    
    const mostUsedBrewingMethod = this.getMostCommon(brewingMethods);
    const mostUsedOrigin = this.getMostCommon(origins);
    
    const dates = flatRecipes.map((r: any) => new Date(r.date_created).toISOString()).sort();
    const dateRangeStart = dates[0];
    const dateRangeEnd = dates[dates.length - 1];

    // Get last activity date from recipe_collections table
    const lastActivityResult = await supabase.handleResponse(async () => {
      return client
        .from('recipe_collections')
        .select('date_assigned')
        .eq('collection_id', collectionId)
        .order('date_assigned', { ascending: false })
        .limit(1);
    });
    
    const lastActivityDate = lastActivityResult && lastActivityResult.length > 0 
      ? new Date(lastActivityResult[0]!.date_assigned).toISOString()
      : new Date().toISOString();

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
    const client = supabase.getClient();
    const id = uuidv4();

    const collectionData = {
      collection_id: id,
      name: input.name.trim(),
      description: input.description?.trim() ?? null,
      color: input.color,
      is_private: input.isPrivate,
      is_default: input.isDefault,
      tags: input.tags || [],
    };

    const result = await supabase.handleResponse(async () => {
      return client.from('collections').insert(collectionData).select().single();
    });

    return this.rowToCollection(result);
  }

  // Find collection by ID
  public static async findById(id: string): Promise<Collection | null> {
    const client = supabase.getClient();
    
    const result = await supabase.handleOptionalResponse(async () => {
      return client.from('collections').select('*').eq('collection_id', id).single();
    });
    
    if (!result) {
      return null;
    }

    return this.rowToCollection(result);
  }

  // Find collection by name
  public static async findByName(name: string): Promise<Collection | null> {
    const client = supabase.getClient();
    
    const result = await supabase.handleOptionalResponse(async () => {
      return client.from('collections').select('*').eq('name', name.trim()).single();
    });
    
    if (!result) {
      return null;
    }

    return this.rowToCollection(result);
  }

  // Get all collections with optional filtering
  public static async findAll(filters?: {
    isPrivate?: boolean;
    color?: CollectionColor;
    searchQuery?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Collection[]> {
    const client = supabase.getClient();
    
    let query = client.from('collections').select('*');

    // Apply filters
    if (filters?.isPrivate !== undefined) {
      query = query.eq('is_private', filters.isPrivate);
    }

    if (filters?.color) {
      query = query.eq('color', filters.color);
    }

    if (filters?.searchQuery) {
      query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }

    // Apply sorting
    const validSortFields = ['name', 'date_created', 'date_modified'];
    const sortBy = validSortFields.includes(filters?.sortBy || '') ? filters!.sortBy! : 'name';
    const ascending = filters?.sortOrder !== 'desc';
    query = query.order(sortBy, { ascending });

    const rows = await supabase.handleResponse(async () => query);
    
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

    const client = supabase.getClient();
    
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.description !== undefined) updateData.description = updates.description?.trim() ?? null;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.isPrivate !== undefined) updateData.is_private = updates.isPrivate;
    if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;
    if (updates.tags !== undefined) updateData.tags = updates.tags;

    await client.from('collections').update(updateData).eq('collection_id', id);

    return this.findById(id);
  }

  // Delete collection
  public static async delete(id: string): Promise<boolean> {
    const client = supabase.getClient();
    
    await client.from('collections').delete().eq('collection_id', id);

    return true; // Supabase delete returns success if no error
  }

  // Add recipe to collection
  public static async addRecipe(collectionId: string, recipeId: string): Promise<boolean> {
    const client = supabase.getClient();
    
    try {
      await client
        .from('recipe_collections')
        .insert({ collection_id: collectionId, recipe_id: recipeId });
      return true;
    } catch (error) {
      // If it's a duplicate key error, that's fine - recipe is already in collection
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string;
        if (message.includes('duplicate') || message.includes('unique')) {
          return true;
        }
      }
      throw error;
    }
  }

  // Remove recipe from collection
  public static async removeRecipe(collectionId: string, recipeId: string): Promise<boolean> {
    const client = supabase.getClient();
    
    await client
      .from('recipe_collections')
      .delete()
      .eq('collection_id', collectionId)
      .eq('recipe_id', recipeId);

    return true;
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
    const client = supabase.getClient();
    
    const collectionRows = await supabase.handleResponse(async () => {
      return client
        .from('recipe_collections')
        .select(`
          collections (*)
        `)
        .eq('recipe_id', recipeId)
        .order('collections(name)', { ascending: true });
    });
    
    const collections = [];
    for (const rc of collectionRows) {
      if (rc.collections) {
        const collection = await this.rowToCollection(rc.collections);
        collections.push(collection);
      }
    }

    return collections;
  }

  // Check if collection name exists
  public static async nameExists(name: string, excludeId?: string): Promise<boolean> {
    const client = supabase.getClient();
    
    let query = client.from('collections').select('collection_id', { count: 'exact', head: true }).eq('name', name.trim());
    
    if (excludeId) {
      query = query.neq('collection_id', excludeId);
    }
    
    const { count } = await query;
    return (count ?? 0) > 0;
  }

  // Get collections count
  public static async count(): Promise<number> {
    const client = supabase.getClient();
    
    const { count } = await client.from('collections').select('*', { count: 'exact', head: true });
    return count ?? 0;
  }

  // Get recipe count for a collection
  public static async getRecipeCount(collectionId: string): Promise<number> {
    const client = supabase.getClient();
    
    const { count } = await client
      .from('recipe_collections')
      .select('*', { count: 'exact', head: true })
      .eq('collection_id', collectionId);

    return count ?? 0;
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
    const client = supabase.getClient();
    
    // Get collections with recipe counts and average ratings using a subquery approach
    let collectionsQuery = client.from('collections').select(`
      *,
      recipe_collections (
        recipe_id,
        date_assigned,
        recipes (
          overall_impression
        )
      )
    `);

    // Apply filters
    if (filters?.isPrivate !== undefined) {
      collectionsQuery = collectionsQuery.eq('is_private', filters.isPrivate);
    }

    if (filters?.color) {
      collectionsQuery = collectionsQuery.eq('color', filters.color);
    }

    if (filters?.searchQuery) {
      collectionsQuery = collectionsQuery.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }

    // Apply sorting (we'll sort in JavaScript since complex aggregations aren't directly supported)
    const validSortFields = ['name', 'date_created', 'date_modified'];
    const sortBy = validSortFields.includes(filters?.sortBy || '') ? filters!.sortBy! : 'name';
    const ascending = filters?.sortOrder !== 'desc';
    collectionsQuery = collectionsQuery.order(sortBy, { ascending });

    const collections = await supabase.handleResponse(async () => collectionsQuery);

    return collections.map(collection => {
      const recipeConnections = collection.recipe_collections || [];
      const recipeCount = recipeConnections.length;
      
      // Calculate average rating from connected recipes
      const ratingsSum = recipeConnections.reduce((sum: number, rc: any) => {
        return sum + (rc.recipes?.overall_impression || 0);
      }, 0);
      const averageRating = recipeCount > 0 ? ratingsSum / recipeCount : 0;
      
      // Find most recent activity
      const activityDates = recipeConnections.map((rc: any) => new Date(rc.date_assigned).getTime());
      const latestActivity = activityDates.length > 0 
        ? Math.max(...activityDates)
        : new Date(collection.date_created).getTime();

      return {
        collectionId: collection.collection_id,
        name: collection.name,
        description: collection.description ?? undefined,
        color: collection.color as CollectionColor,
        isPrivate: collection.is_private,
        isDefault: collection.is_default,
        tags: Array.isArray(collection.tags) ? collection.tags : [],
        dateCreated: new Date(collection.date_created).toISOString(),
        dateModified: new Date(collection.date_modified).toISOString(),
        recipeCount,
        averageRating: Math.round(averageRating * 100) / 100,
        lastActivityDate: new Date(latestActivity).toISOString(),
      };
    });
  }
}

export default CollectionModel;