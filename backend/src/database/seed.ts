import { RecipeModel } from './models/Recipe.js';
import { CollectionModel } from './models/Collection.js';
import { db } from './connection.js';
import type { RecipeInput, RoastingLevel, BrewingMethod } from 'coffee-tracker-shared';

// Sample recipe data for development and testing
const sampleRecipes: RecipeInput[] = [
  {
    recipeName: 'Ethiopian Yirgacheffe - Morning Brew',
    isFavorite: true,
    collections: [],
    beanInfo: {
      origin: 'Ethiopia',
      processingMethod: 'Washed',
      altitude: 1800,
      roastingDate: '2024-01-15',
      roastingLevel: 'light' as RoastingLevel
    },
    brewingParameters: {
      waterTemperature: 93,
      brewingMethod: 'pour-over' as BrewingMethod,
      grinderModel: 'Baratza Encore',
      grinderUnit: 'Medium-Fine',
      filteringTools: 'Hario V60',
      turbulence: 'Gentle circular pour',
      additionalNotes: 'Bloomed for 45 seconds, total brew time 3:30'
    },
    measurements: {
      coffeeBeans: 22,
      water: 350,
      tds: 1.35,
      extractionYield: 20.5
    },
    sensationRecord: {
      overallImpression: 9,
      acidity: 8,
      body: 6,
      sweetness: 7,
      flavor: 9,
      aftertaste: 8,
      balance: 8,
      tastingNotes: 'Bright floral notes with hints of lemon and tea-like finish. Clean and complex cup with excellent clarity.'
    }
  },
  {
    recipeName: 'Colombian Huila - French Press',
    isFavorite: false,
    collections: [],
    beanInfo: {
      origin: 'Colombia',
      processingMethod: 'Natural',
      altitude: 1650,
      roastingDate: '2024-01-12',
      roastingLevel: 'medium' as RoastingLevel
    },
    brewingParameters: {
      waterTemperature: 96,
      brewingMethod: 'french-press' as BrewingMethod,
      grinderModel: 'Comandante C40',
      grinderUnit: 'Coarse',
      filteringTools: 'French Press',
      turbulence: 'Single stir at 1 minute',
      additionalNotes: '4 minute steep time, plunged slowly'
    },
    measurements: {
      coffeeBeans: 30,
      water: 500,
      tds: 1.28,
      extractionYield: 21.3
    },
    sensationRecord: {
      overallImpression: 7,
      acidity: 5,
      body: 8,
      sweetness: 8,
      flavor: 7,
      aftertaste: 6,
      balance: 7,
      tastingNotes: 'Rich and full-bodied with chocolate and caramel notes. Slightly muted acidity, good for morning drinking.'
    }
  },
  {
    recipeName: 'Guatemalan Antigua - AeroPress',
    isFavorite: true,
    collections: [],
    beanInfo: {
      origin: 'Guatemala',
      processingMethod: 'Washed',
      altitude: 1500,
      roastingDate: '2024-01-10',
      roastingLevel: 'medium' as RoastingLevel
    },
    brewingParameters: {
      waterTemperature: 85,
      brewingMethod: 'aeropress' as BrewingMethod,
      grinderModel: 'Timemore C2',
      grinderUnit: 'Medium',
      filteringTools: 'AeroPress with metal filter',
      turbulence: 'Inverted method, stirred 3 times',
      additionalNotes: '1:30 steep, pressed over 30 seconds'
    },
    measurements: {
      coffeeBeans: 18,
      water: 270,
      tds: 1.42,
      extractionYield: 19.8
    },
    sensationRecord: {
      overallImpression: 8,
      acidity: 6,
      body: 7,
      sweetness: 8,
      flavor: 8,
      aftertaste: 7,
      balance: 8,
      tastingNotes: 'Smooth and balanced with notes of dark chocolate and orange peel. Clean finish with subtle spice notes.'
    }
  },
  {
    recipeName: 'Brazilian Santos - Cold Brew',
    isFavorite: false,
    collections: [],
    beanInfo: {
      origin: 'Brazil',
      processingMethod: 'Pulped Natural',
      altitude: 1200,
      roastingDate: '2024-01-08',
      roastingLevel: 'dark' as RoastingLevel
    },
    brewingParameters: {
      waterTemperature: 22, // Room temperature
      brewingMethod: 'cold-brew' as BrewingMethod,
      grinderModel: 'Baratza Encore',
      grinderUnit: 'Extra Coarse',
      filteringTools: 'Cold brew maker',
      turbulence: 'Initial stir only',
      additionalNotes: '12 hour steep at room temperature, then refrigerated'
    },
    measurements: {
      coffeeBeans: 100,
      water: 800,
      tds: 1.15,
      extractionYield: 18.5
    },
    sensationRecord: {
      overallImpression: 6,
      acidity: 3,
      body: 9,
      sweetness: 6,
      flavor: 6,
      aftertaste: 5,
      balance: 6,
      tastingNotes: 'Low acidity, full body with nutty and chocolate notes. Slightly bitter finish, good with milk.'
    }
  },
  {
    recipeName: 'Kenyan AA - Chemex',
    isFavorite: true,
    collections: [],
    beanInfo: {
      origin: 'Kenya',
      processingMethod: 'Washed',
      altitude: 1700,
      roastingDate: '2024-01-14',
      roastingLevel: 'light' as RoastingLevel
    },
    brewingParameters: {
      waterTemperature: 94,
      brewingMethod: 'pour-over' as BrewingMethod,
      grinderModel: 'Baratza Virtuoso+',
      grinderUnit: 'Medium-Coarse',
      filteringTools: 'Chemex with bonded filters',
      turbulence: 'Slow spiral pour',
      additionalNotes: 'Pre-infusion 30s, total time 5:30'
    },
    measurements: {
      coffeeBeans: 42,
      water: 700,
      tds: 1.31,
      extractionYield: 20.1
    },
    sensationRecord: {
      overallImpression: 9,
      acidity: 9,
      body: 7,
      sweetness: 6,
      flavor: 9,
      aftertaste: 8,
      balance: 8,
      tastingNotes: 'Bright blackcurrant acidity with wine-like complexity. Juicy and clean with long, pleasant finish.'
    }
  }
];

// Sample collections
const sampleCollections = [
  {
    name: 'Morning Favorites',
    description: 'My go-to recipes for starting the day'
  },
  {
    name: 'Light Roasts',
    description: 'Collection of bright, acidic light roast recipes'
  },
  {
    name: 'Experimental Brews',
    description: 'Testing new techniques and parameters'
  }
];

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');

    // Check if data already exists
    const recipeCount = await RecipeModel.count();
    if (recipeCount > 0) {
      console.log('📊 Database already contains data, skipping seed');
      return;
    }

    // Create sample collections first
    console.log('📁 Creating sample collections...');
    const createdCollections = [];
    for (const collectionData of sampleCollections) {
      const collection = await CollectionModel.create(collectionData.name, collectionData.description);
      createdCollections.push(collection);
      console.log(`✅ Created collection: ${collection.name}`);
    }

    // Create sample recipes
    console.log('☕ Creating sample recipes...');
    const createdRecipes = [];
    for (const recipeData of sampleRecipes) {
      const recipe = await RecipeModel.create(recipeData);
      createdRecipes.push(recipe);
      console.log(`✅ Created recipe: ${recipe.recipeName}`);
    }

    // Add recipes to collections based on characteristics
    console.log('🔗 Linking recipes to collections...');
    
    const morningFavorites = createdCollections.find(c => c.name === 'Morning Favorites');
    const lightRoasts = createdCollections.find(c => c.name === 'Light Roasts');
    const experimental = createdCollections.find(c => c.name === 'Experimental Brews');

    // Add favorite recipes to Morning Favorites
    for (const recipe of createdRecipes) {
      if (recipe.isFavorite && morningFavorites) {
        await CollectionModel.addRecipe(morningFavorites.id, recipe.recipeId);
      }
      
      // Add light roasts to Light Roasts collection
      if (recipe.beanInfo.roastingLevel === 'light' && lightRoasts) {
        await CollectionModel.addRecipe(lightRoasts.id, recipe.recipeId);
      }
      
      // Add AeroPress recipe to experimental (as an example)
      if (recipe.brewingParameters.brewingMethod === 'aeropress' && experimental) {
        await CollectionModel.addRecipe(experimental.id, recipe.recipeId);
      }
    }

    const finalRecipeCount = await RecipeModel.count();
    const finalCollectionCount = await CollectionModel.count();

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${finalRecipeCount} recipes and ${finalCollectionCount} collections`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

export const clearDatabase = async (): Promise<void> => {
  try {
    console.log('🧹 Clearing database...');
    
    // Delete all recipe-collection relationships
    await db.run('DELETE FROM recipe_collections');
    
    // Delete all recipes and collections
    await db.run('DELETE FROM recipes');
    await db.run('DELETE FROM collections');
    
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};