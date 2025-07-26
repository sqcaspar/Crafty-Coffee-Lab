import { RecipeModel } from './models/Recipe.js';
import { CollectionModel } from './models/Collection.js';
import { CoffeeOrigin, ProcessingMethod, GrinderModel, FilteringTool } from 'coffee-tracker-shared';
import type { RecipeInput, RoastingLevel, BrewingMethod, CollectionColor, TurbulenceStep } from 'coffee-tracker-shared';

// Sample recipe data for development and testing
const sampleRecipes: RecipeInput[] = [
  {
    recipeName: 'Ethiopian Yirgacheffe - Morning Brew',
    isFavorite: true,
    collections: [],
    beanInfo: {
      coffeeBeanBrand: 'Blue Bottle Coffee',
      origin: CoffeeOrigin.ETHIOPIA,
      processingMethod: ProcessingMethod.WASHED,
      altitude: 1800,
      roastingDate: '2024-01-15',
      roastingLevel: 'light' as RoastingLevel
    },
    brewingParameters: {
      waterTemperature: 93,
      brewingMethod: 'pour-over' as BrewingMethod,
      grinderModel: GrinderModel.BARATZA_ENCORE,
      grinderUnit: '12',
      filteringTools: FilteringTool.PAPER,
      additionalNotes: 'Bloomed for 45 seconds, total brew time 3:30'
    },
    turbulenceInfo: {
      turbulence: [
        { actionTime: '0:00', actionDetails: 'Gentle Circle Water Pour', volume: '50ml' },
        { actionTime: '0:45', actionDetails: 'Continue Pouring', volume: '150ml' },
        { actionTime: '2:00', actionDetails: 'Final Pour', volume: '150ml' }
      ] as TurbulenceStep[]
    },
    measurements: {
      coffeeBeans: 22,
      water: 350,
      brewedCoffeeWeight: 320,
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
      coffeeBeanBrand: 'Counter Culture Coffee',
      origin: CoffeeOrigin.COLOMBIA,
      processingMethod: ProcessingMethod.NATURAL,
      altitude: 1650,
      roastingDate: '2024-01-12',
      roastingLevel: 'medium' as RoastingLevel
    },
    brewingParameters: {
      waterTemperature: 96,
      brewingMethod: 'french-press' as BrewingMethod,
      grinderModel: GrinderModel.COMANDANTE_C40,
      grinderUnit: '33',
      filteringTools: FilteringTool.METAL,
      additionalNotes: '4 minute steep time, plunged slowly'
    },
    turbulenceInfo: {
      turbulence: [
        { actionTime: '1:00', actionDetails: 'Single Stir', volume: '500ml' }
      ] as TurbulenceStep[]
    },
    measurements: {
      coffeeBeans: 30,
      water: 500,
      brewedCoffeeWeight: 485,
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
      coffeeBeanBrand: 'Intelligentsia Coffee',
      origin: CoffeeOrigin.GUATEMALA,
      processingMethod: ProcessingMethod.WASHED,
      altitude: 1500,
      roastingDate: '2024-01-10',
      roastingLevel: 'medium' as RoastingLevel
    },
    brewingParameters: {
      waterTemperature: 85,
      brewingMethod: 'aeropress' as BrewingMethod,
      grinderModel: GrinderModel.TIMEMORE_C2,
      grinderUnit: '20',
      filteringTools: FilteringTool.METAL,
      additionalNotes: '1:30 steep, pressed over 30 seconds'
    },
    turbulenceInfo: {
      turbulence: [
        { actionTime: '0:00', actionDetails: 'Invert and Add Coffee', volume: '270ml' },
        { actionTime: '0:30', actionDetails: 'First Stir', volume: '0ml' },
        { actionTime: '1:00', actionDetails: 'Second Stir', volume: '0ml' },
        { actionTime: '1:30', actionDetails: 'Final Stir and Press', volume: '0ml' }
      ] as TurbulenceStep[]
    },
    measurements: {
      coffeeBeans: 18,
      water: 270,
      brewedCoffeeWeight: 245,
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
      coffeeBeanBrand: 'Stumptown Coffee Roasters',
      origin: CoffeeOrigin.BRAZIL,
      processingMethod: ProcessingMethod.HONEY,
      altitude: 1200,
      roastingDate: '2024-01-08',
      roastingLevel: 'dark' as RoastingLevel
    },
    brewingParameters: {
      waterTemperature: undefined, // Cold brew uses room temperature (outside our 80-100°C range)
      brewingMethod: 'cold-brew' as BrewingMethod,
      grinderModel: GrinderModel.BARATZA_ENCORE,
      grinderUnit: '38',
      filteringTools: FilteringTool.METAL,
      additionalNotes: '12 hour steep at room temperature, then refrigerated'
    },
    turbulenceInfo: {
      turbulence: [
        { actionTime: '0:00', actionDetails: 'Initial Stir', volume: '800ml' }
      ] as TurbulenceStep[]
    },
    measurements: {
      coffeeBeans: 100,
      water: 800,
      brewedCoffeeWeight: 720,
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
      coffeeBeanBrand: 'Ritual Coffee Roasters',
      origin: CoffeeOrigin.KENYA,
      processingMethod: ProcessingMethod.WASHED,
      altitude: 1700,
      roastingDate: '2024-01-14',
      roastingLevel: 'light' as RoastingLevel
    },
    brewingParameters: {
      waterTemperature: 94,
      brewingMethod: 'pour-over' as BrewingMethod,
      grinderModel: GrinderModel.BARATZA_VIRTUOSO_PLUS,
      grinderUnit: '28',
      filteringTools: FilteringTool.PAPER,
      additionalNotes: 'Pre-infusion 30s, total time 5:30'
    },
    turbulenceInfo: {
      turbulence: [
        { actionTime: '0:00', actionDetails: 'Pre-infusion', volume: '84ml' },
        { actionTime: '0:30', actionDetails: 'Slow Spiral Pour', volume: '200ml' },
        { actionTime: '2:30', actionDetails: 'Continue Spiral Pour', volume: '200ml' },
        { actionTime: '4:00', actionDetails: 'Final Pour', volume: '216ml' }
      ] as TurbulenceStep[]
    },
    measurements: {
      coffeeBeans: 42,
      water: 700,
      brewedCoffeeWeight: 650,
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
    description: 'My go-to recipes for starting the day',
    color: 'blue' as CollectionColor,
    isPrivate: false,
    isDefault: false,
    tags: ['favorites', 'morning']
  },
  {
    name: 'Light Roasts',
    description: 'Collection of bright, acidic light roast recipes',
    color: 'orange' as CollectionColor,
    isPrivate: false,
    isDefault: false,
    tags: ['light-roast', 'bright']
  },
  {
    name: 'Experimental Brews',
    description: 'Testing new techniques and parameters',
    color: 'purple' as CollectionColor,
    isPrivate: false,
    isDefault: false,
    tags: ['experimental', 'testing']
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
      const collection = await CollectionModel.create(collectionData);
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
        await CollectionModel.addRecipe(morningFavorites.collectionId, recipe.recipeId);
      }
      
      // Add light roasts to Light Roasts collection
      if (recipe.beanInfo.roastingLevel === 'light' && lightRoasts) {
        await CollectionModel.addRecipe(lightRoasts.collectionId, recipe.recipeId);
      }
      
      // Add AeroPress recipe to experimental (as an example)
      if (recipe.brewingParameters.brewingMethod === 'aeropress' && experimental) {
        await CollectionModel.addRecipe(experimental.collectionId, recipe.recipeId);
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
    
    // Note: Database clearing should be done through Supabase dashboard for security
    // This function is kept for development purposes but doesn't execute actual clearing
    console.log('⚠️  Database clearing should be done through Supabase dashboard for security');
    console.log('✅ Database clear request acknowledged');
  } catch (error) {
    console.error('❌ Error in clear database function:', error);
    throw error;
  }
};