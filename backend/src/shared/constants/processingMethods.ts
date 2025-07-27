/**
 * Coffee Processing Method Constants
 * 
 * Defines the most common coffee processing methods used worldwide.
 * These methods represent different ways of processing coffee cherries
 * after harvest, which significantly impact the final flavor profile.
 */

// Coffee processing methods enum
export enum ProcessingMethod {
  WASHED = 'Washed',
  NATURAL = 'Natural', 
  HONEY = 'Honey',
  SEMI_WASHED = 'Semi-Washed',
  ANAEROBIC = 'Anaerobic',
  CARBONIC_MACERATION = 'Carbonic Maceration',
  EXPERIMENTAL = 'Experimental'
}

// Processing method options for dropdown
export const PROCESSING_METHOD_OPTIONS = [
  { 
    value: ProcessingMethod.WASHED, 
    label: 'Washed (Wet Process)',
    description: 'Clean and bright flavor profile'
  },
  { 
    value: ProcessingMethod.NATURAL, 
    label: 'Natural (Dry Process)',
    description: 'Fruity and sweet characteristics'
  },
  { 
    value: ProcessingMethod.HONEY, 
    label: 'Honey (Pulped Natural)',
    description: 'Sweet with some fruit notes'
  },
  { 
    value: ProcessingMethod.SEMI_WASHED, 
    label: 'Semi-Washed',
    description: 'Indonesian specialty method'
  },
  { 
    value: ProcessingMethod.ANAEROBIC, 
    label: 'Anaerobic',
    description: 'Fermentation process for unique flavors'
  },
  { 
    value: ProcessingMethod.CARBONIC_MACERATION, 
    label: 'Carbonic Maceration',
    description: 'Wine-inspired process for complexity'
  },
  { 
    value: ProcessingMethod.EXPERIMENTAL, 
    label: 'Experimental',
    description: 'Innovative or custom processes'
  }
];

// Array of all processing method values for validation
export const ALL_PROCESSING_METHODS = Object.values(ProcessingMethod);

// Helper function to check if a string is a valid processing method
export const isValidProcessingMethod = (method: string): method is ProcessingMethod => {
  return ALL_PROCESSING_METHODS.includes(method as ProcessingMethod);
};

// Migration helper - maps common variations to standard processing methods
export const PROCESSING_METHOD_MIGRATION_MAP: Record<string, ProcessingMethod> = {
  // Common variations and mappings
  'Wet Process': ProcessingMethod.WASHED,
  'Wet': ProcessingMethod.WASHED,
  'Fully Washed': ProcessingMethod.WASHED,
  'Washed Process': ProcessingMethod.WASHED,
  
  'Dry Process': ProcessingMethod.NATURAL,
  'Dry': ProcessingMethod.NATURAL,
  'Natural Process': ProcessingMethod.NATURAL,
  'Sun Dried': ProcessingMethod.NATURAL,
  'Sundried': ProcessingMethod.NATURAL,
  
  'Pulped Natural': ProcessingMethod.HONEY,
  'Honey Process': ProcessingMethod.HONEY,
  'Semi-Natural': ProcessingMethod.HONEY,
  'Demi-Sec': ProcessingMethod.HONEY,
  
  'Wet Hulled': ProcessingMethod.SEMI_WASHED,
  'Giling Basah': ProcessingMethod.SEMI_WASHED,
  'Indonesian': ProcessingMethod.SEMI_WASHED,
  
  'Anaerobic Fermentation': ProcessingMethod.ANAEROBIC,
  'Anaerobic Natural': ProcessingMethod.ANAEROBIC,
  'Anaerobic Washed': ProcessingMethod.ANAEROBIC,
  
  'Carbonic': ProcessingMethod.CARBONIC_MACERATION,
  'CM': ProcessingMethod.CARBONIC_MACERATION,
  'Wine Process': ProcessingMethod.CARBONIC_MACERATION,
  
  'Custom': ProcessingMethod.EXPERIMENTAL,
  'Special': ProcessingMethod.EXPERIMENTAL,
  'Innovative': ProcessingMethod.EXPERIMENTAL,
  'Other': ProcessingMethod.EXPERIMENTAL
};

// Get migrated processing method for a given string
export const getMigratedProcessingMethod = (method: string): ProcessingMethod | null => {
  // Direct match
  if (isValidProcessingMethod(method)) {
    return method as ProcessingMethod;
  }
  
  // Check migration map
  const migrated = PROCESSING_METHOD_MIGRATION_MAP[method];
  if (migrated) {
    return migrated;
  }
  
  // Case-insensitive search in migration map
  const lowerMethod = method.toLowerCase();
  for (const [key, value] of Object.entries(PROCESSING_METHOD_MIGRATION_MAP)) {
    if (key.toLowerCase() === lowerMethod) {
      return value;
    }
  }
  
  return null;
};

// Get processing method description
export const getProcessingMethodDescription = (method: ProcessingMethod): string => {
  const option = PROCESSING_METHOD_OPTIONS.find(opt => opt.value === method);
  return option?.description || '';
};