/**
 * Coffee Origin Constants
 * 
 * Defines the top 15 coffee-producing countries organized by continent.
 * These countries represent the most significant coffee origins globally
 * and provide users with a structured selection for recipe origin data.
 */

// Individual coffee origin countries
export enum CoffeeOrigin {
  // South America
  BRAZIL = 'Brazil',
  COLOMBIA = 'Colombia', 
  PERU = 'Peru',
  ECUADOR = 'Ecuador',
  
  // Central America & Mexico
  GUATEMALA = 'Guatemala',
  MEXICO = 'Mexico',
  HONDURAS = 'Honduras',
  COSTA_RICA = 'Costa Rica',
  NICARAGUA = 'Nicaragua',
  
  // Africa
  ETHIOPIA = 'Ethiopia',
  KENYA = 'Kenya',
  RWANDA = 'Rwanda',
  
  // Asia & Oceania
  INDONESIA = 'Indonesia',
  VIETNAM = 'Vietnam',
  YEMEN = 'Yemen'
}

// Continent groupings for the dropdown
export interface CoffeeOriginGroup {
  continent: string;
  countries: CoffeeOrigin[];
}

export const COFFEE_ORIGIN_GROUPS: CoffeeOriginGroup[] = [
  {
    continent: 'South America',
    countries: [
      CoffeeOrigin.BRAZIL,
      CoffeeOrigin.COLOMBIA,
      CoffeeOrigin.PERU,
      CoffeeOrigin.ECUADOR
    ]
  },
  {
    continent: 'Central America & Mexico',
    countries: [
      CoffeeOrigin.GUATEMALA,
      CoffeeOrigin.MEXICO,
      CoffeeOrigin.HONDURAS,
      CoffeeOrigin.COSTA_RICA,
      CoffeeOrigin.NICARAGUA
    ]
  },
  {
    continent: 'Africa',
    countries: [
      CoffeeOrigin.ETHIOPIA,
      CoffeeOrigin.KENYA,
      CoffeeOrigin.RWANDA
    ]
  },
  {
    continent: 'Asia & Oceania',
    countries: [
      CoffeeOrigin.INDONESIA,
      CoffeeOrigin.VIETNAM,
      CoffeeOrigin.YEMEN
    ]
  }
];

// Array of all coffee origin values for validation
export const ALL_COFFEE_ORIGINS = Object.values(CoffeeOrigin);

// Helper function to get continent for a given country
export const getContinentForOrigin = (origin: CoffeeOrigin): string => {
  for (const group of COFFEE_ORIGIN_GROUPS) {
    if (group.countries.includes(origin)) {
      return group.continent;
    }
  }
  return 'Unknown';
};

// Helper function to check if a string is a valid coffee origin
export const isValidCoffeeOrigin = (origin: string): origin is CoffeeOrigin => {
  return ALL_COFFEE_ORIGINS.includes(origin as CoffeeOrigin);
};

// Migration helper - maps common variations to standard origins
export const ORIGIN_MIGRATION_MAP: Record<string, CoffeeOrigin> = {
  // Common variations and mappings
  'Brazilian': CoffeeOrigin.BRAZIL,
  'Colombia': CoffeeOrigin.COLOMBIA,
  'Colombian': CoffeeOrigin.COLOMBIA,
  'Ethiopia': CoffeeOrigin.ETHIOPIA,
  'Ethiopian': CoffeeOrigin.ETHIOPIA,
  'Guatemalan': CoffeeOrigin.GUATEMALA,
  'Kenyan': CoffeeOrigin.KENYA,
  'Honduran': CoffeeOrigin.HONDURAS,
  'Costa Rican': CoffeeOrigin.COSTA_RICA,
  'Nicaraguan': CoffeeOrigin.NICARAGUA,
  'Mexican': CoffeeOrigin.MEXICO,
  'Peruvian': CoffeeOrigin.PERU,
  'Ecuadoran': CoffeeOrigin.ECUADOR,
  'Ecuadorian': CoffeeOrigin.ECUADOR,
  'Indonesian': CoffeeOrigin.INDONESIA,
  'Vietnamese': CoffeeOrigin.VIETNAM,
  'Yemeni': CoffeeOrigin.YEMEN,
  'Rwandan': CoffeeOrigin.RWANDA,
  
  // Alternative spellings
  'Brasil': CoffeeOrigin.BRAZIL,
  'Kenia': CoffeeOrigin.KENYA,
  'Etiopia': CoffeeOrigin.ETHIOPIA,
  'Etiopía': CoffeeOrigin.ETHIOPIA,
  'México': CoffeeOrigin.MEXICO,
  'Perú': CoffeeOrigin.PERU,
  'Viet Nam': CoffeeOrigin.VIETNAM,
  'Việt Nam': CoffeeOrigin.VIETNAM
};

// Get migrated origin for a given string
export const getMigratedOrigin = (origin: string): CoffeeOrigin | null => {
  // Direct match
  if (isValidCoffeeOrigin(origin)) {
    return origin as CoffeeOrigin;
  }
  
  // Check migration map
  const migrated = ORIGIN_MIGRATION_MAP[origin];
  if (migrated) {
    return migrated;
  }
  
  // Case-insensitive search in migration map
  const lowerOrigin = origin.toLowerCase();
  for (const [key, value] of Object.entries(ORIGIN_MIGRATION_MAP)) {
    if (key.toLowerCase() === lowerOrigin) {
      return value;
    }
  }
  
  return null;
};