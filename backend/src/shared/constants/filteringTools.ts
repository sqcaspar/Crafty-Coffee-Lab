/**
 * Filtering Tools Constants
 * 
 * Defines the main categories of coffee filtering tools used in various brewing methods.
 * These three categories cover the most common filter types in coffee brewing.
 */

// Main filtering tool categories
export enum FilteringTool {
  PAPER = 'Paper',
  METAL = 'Metal',
  CLOTH = 'Cloth'
}

// All filtering tool values for validation and migration
export const ALL_FILTERING_TOOLS = Object.values(FilteringTool);

// Filtering tool options for dropdown with descriptive labels
export const FILTERING_TOOL_OPTIONS = [
  { 
    value: FilteringTool.PAPER, 
    label: 'Paper (V60, Chemex, pour-over filters)' 
  },
  { 
    value: FilteringTool.METAL, 
    label: 'Metal (French press, permanent filters)' 
  },
  { 
    value: FilteringTool.CLOTH, 
    label: 'Cloth (Sock filters, nel drip)' 
  }
];

// Helper function to check if a filtering tool is a valid enum value
export const isValidFilteringTool = (tool: string): boolean => {
  return ALL_FILTERING_TOOLS.includes(tool as FilteringTool);
};

// Get filtering tool label for display
export const getFilteringToolLabel = (tool: string): string => {
  const option = FILTERING_TOOL_OPTIONS.find(opt => opt.value === tool);
  return option ? option.label : tool;
};

// Migration helper for existing descriptive filtering tool data
export const migrateFilteringTool = (filteringTool: string): string | null => {
  if (!filteringTool || filteringTool.trim() === '') {
    return null; // Keep as undefined for optional field
  }

  const trimmedTool = filteringTool.trim();
  
  // Check if it's already a valid enum value
  if (isValidFilteringTool(trimmedTool)) {
    return trimmedTool;
  }
  
  // Common descriptive mappings to filter types
  const lowerCaseTool = trimmedTool.toLowerCase();
  
  // Paper filter keywords
  const paperKeywords = [
    'paper', 'filter', 'v60', 'hario', 'chemex', 'kalita', 'melitta', 
    'pour over', 'pour-over', 'dripper', 'cone filter', 'flat filter',
    'bonded', 'white filter', 'brown filter', 'natural filter',
    'bleached', 'unbleached', 'disposable'
  ];
  
  // Metal filter keywords
  const metalKeywords = [
    'metal', 'steel', 'mesh', 'french press', 'press pot', 'plunger',
    'aeropress metal', 'permanent', 'reusable', 'stainless', 'gold',
    'titanium', 'portafilter', 'basket', 'espresso', 'perforated',
    'screen', 'sieve'
  ];
  
  // Cloth filter keywords
  const clothKeywords = [
    'cloth', 'fabric', 'sock', 'nel', 'flannel', 'cotton', 'linen',
    'textile', 'drip sock', 'coffee sock', 'traditional'
  ];
  
  // Check for paper filter matches
  if (paperKeywords.some(keyword => lowerCaseTool.includes(keyword))) {
    return FilteringTool.PAPER;
  }
  
  // Check for metal filter matches
  if (metalKeywords.some(keyword => lowerCaseTool.includes(keyword))) {
    return FilteringTool.METAL;
  }
  
  // Check for cloth filter matches
  if (clothKeywords.some(keyword => lowerCaseTool.includes(keyword))) {
    return FilteringTool.CLOTH;
  }
  
  // For complex or unrecognized descriptions, return the original value
  // This maintains backward compatibility for custom descriptions
  return trimmedTool;
};

// Recommended filtering tools for different brewing methods
export const RECOMMENDED_FILTERING_TOOLS = {
  POUR_OVER: FilteringTool.PAPER,
  V60: FilteringTool.PAPER,
  CHEMEX: FilteringTool.PAPER,
  KALITA: FilteringTool.PAPER,
  DRIPPER: FilteringTool.PAPER,
  FRENCH_PRESS: FilteringTool.METAL,
  AEROPRESS: FilteringTool.PAPER, // Default, though metal option exists
  ESPRESSO: FilteringTool.METAL,
  MOKA_POT: FilteringTool.METAL,
  COLD_BREW: FilteringTool.METAL,
  NEL_DRIP: FilteringTool.CLOTH,
  SIPHON: FilteringTool.CLOTH,
  TURKISH: null // No filter typically used
} as const;

// Get recommended filtering tool for a brewing method
export const getRecommendedFilteringTool = (brewingMethod: string): FilteringTool | null => {
  const methodMap: Record<string, FilteringTool | null> = {
    'pour-over': RECOMMENDED_FILTERING_TOOLS.POUR_OVER,
    'v60': RECOMMENDED_FILTERING_TOOLS.V60,
    'chemex': RECOMMENDED_FILTERING_TOOLS.CHEMEX,
    'kalita': RECOMMENDED_FILTERING_TOOLS.KALITA,
    'dripper': RECOMMENDED_FILTERING_TOOLS.DRIPPER,
    'french-press': RECOMMENDED_FILTERING_TOOLS.FRENCH_PRESS,
    'aeropress': RECOMMENDED_FILTERING_TOOLS.AEROPRESS,
    'espresso': RECOMMENDED_FILTERING_TOOLS.ESPRESSO,
    'moka-pot': RECOMMENDED_FILTERING_TOOLS.MOKA_POT,
    'cold-brew': RECOMMENDED_FILTERING_TOOLS.COLD_BREW,
    'nel-drip': RECOMMENDED_FILTERING_TOOLS.NEL_DRIP,
    'siphon': RECOMMENDED_FILTERING_TOOLS.SIPHON,
    'turkish': RECOMMENDED_FILTERING_TOOLS.TURKISH
  };
  
  return methodMap[brewingMethod.toLowerCase()] || null;
};

// Filtering tool descriptions and characteristics
export const FILTERING_TOOL_DESCRIPTIONS = {
  [FilteringTool.PAPER]: {
    description: 'Paper filters provide the cleanest cup by removing oils and fine particles',
    characteristics: ['Clean taste', 'No sediment', 'Disposable', 'Absorbs oils'],
    examples: ['V60 filters', 'Chemex filters', 'Kalita filters', 'Melitta filters'],
    brewingMethods: ['Pour-over', 'Drip coffee', 'AeroPress', 'Chemex']
  },
  [FilteringTool.METAL]: {
    description: 'Metal filters allow oils and fine particles through, creating a fuller body',
    characteristics: ['Full body', 'Retains oils', 'Reusable', 'Some sediment'],
    examples: ['French press mesh', 'Gold filters', 'Permanent filters', 'Espresso baskets'],
    brewingMethods: ['French press', 'Espresso', 'Cold brew', 'Moka pot']
  },
  [FilteringTool.CLOTH]: {
    description: 'Cloth filters balance clarity and body, offering unique flavor characteristics',
    characteristics: ['Balanced body', 'Unique texture', 'Reusable', 'Traditional method'],
    examples: ['Nel drip filters', 'Coffee socks', 'Flannel filters', 'Traditional cloth'],
    brewingMethods: ['Nel drip', 'Siphon', 'Traditional brewing', 'Specialty methods']
  }
};