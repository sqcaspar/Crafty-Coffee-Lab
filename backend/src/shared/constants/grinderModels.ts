/**
 * Grinder Model Constants
 * 
 * Defines the most popular non-machine coffee grinder models available in the market.
 * Includes both manual and electric grinders commonly used by coffee enthusiasts.
 * Features an "Others" option to allow custom grinder model input.
 */

// Top 10 most popular non-machine coffee grinder models
export enum GrinderModel {
  BARATZA_ENCORE = 'Baratza Encore',
  COMANDANTE_C40 = 'Comandante C40',
  TIMEMORE_C2 = 'Timemore C2',
  BARATZA_VIRTUOSO_PLUS = 'Baratza Virtuoso+',
  ONEZPRESSO_JX_PRO = '1Zpresso JX-Pro',
  HARIO_MINI_MILL = 'Hario Mini Mill',
  PORLEX_MINI = 'Porlex Mini',
  BARATZA_VARIO = 'Baratza Vario',
  TIMEMORE_C3 = 'Timemore C3',
  KNOCK_FELDGRIND = 'Knock Feldgrind',
  OTHERS = 'Others' // Special value that enables custom text input
}

// All grinder model values for validation and migration
export const ALL_GRINDER_MODELS = Object.values(GrinderModel);

// Grinder model options for dropdown (in order of popularity)
export const GRINDER_MODEL_OPTIONS = [
  { value: GrinderModel.BARATZA_ENCORE, label: 'Baratza Encore' },
  { value: GrinderModel.COMANDANTE_C40, label: 'Comandante C40' },
  { value: GrinderModel.TIMEMORE_C2, label: 'Timemore C2' },
  { value: GrinderModel.BARATZA_VIRTUOSO_PLUS, label: 'Baratza Virtuoso+' },
  { value: GrinderModel.ONEZPRESSO_JX_PRO, label: '1Zpresso JX-Pro' },
  { value: GrinderModel.HARIO_MINI_MILL, label: 'Hario Mini Mill' },
  { value: GrinderModel.PORLEX_MINI, label: 'Porlex Mini' },
  { value: GrinderModel.BARATZA_VARIO, label: 'Baratza Vario' },
  { value: GrinderModel.TIMEMORE_C3, label: 'Timemore C3' },
  { value: GrinderModel.KNOCK_FELDGRIND, label: 'Knock Feldgrind' },
  { value: GrinderModel.OTHERS, label: 'Others (specify below)' }
];

// Special value identifier for custom input
export const OTHERS_VALUE = GrinderModel.OTHERS;

// Helper function to check if a grinder model is a predefined option
export const isPredefinedGrinderModel = (model: string): boolean => {
  return ALL_GRINDER_MODELS.includes(model as GrinderModel) && model !== OTHERS_VALUE;
};

// Helper function to check if grinder model requires custom input
export const requiresCustomInput = (model: string): boolean => {
  return model === OTHERS_VALUE;
};

// Get grinder model label for display
export const getGrinderModelLabel = (model: string): string => {
  const option = GRINDER_MODEL_OPTIONS.find(opt => opt.value === model);
  return option ? option.label : model; // Return original value if not found in predefined options
};

// Migration helper for existing grinder model data
export const migrateGrinderModel = (grinderModel: string): string => {
  if (!grinderModel || grinderModel.trim() === '') {
    return '';
  }

  const trimmedModel = grinderModel.trim();
  
  // Check if it's already a valid enum value
  if (ALL_GRINDER_MODELS.includes(trimmedModel as GrinderModel)) {
    return trimmedModel;
  }
  
  // Common variations and mappings to standard names
  const commonMappings: Record<string, GrinderModel> = {
    // Baratza variations
    'baratza encore': GrinderModel.BARATZA_ENCORE,
    'encore': GrinderModel.BARATZA_ENCORE,
    'baratza virtuoso+': GrinderModel.BARATZA_VIRTUOSO_PLUS,
    'baratza virtuoso plus': GrinderModel.BARATZA_VIRTUOSO_PLUS,
    'virtuoso+': GrinderModel.BARATZA_VIRTUOSO_PLUS,
    'virtuoso plus': GrinderModel.BARATZA_VIRTUOSO_PLUS,
    'baratza vario': GrinderModel.BARATZA_VARIO,
    'vario': GrinderModel.BARATZA_VARIO,
    
    // Comandante variations
    'comandante c40': GrinderModel.COMANDANTE_C40,
    'comandante': GrinderModel.COMANDANTE_C40,
    'c40': GrinderModel.COMANDANTE_C40,
    
    // Timemore variations
    'timemore c2': GrinderModel.TIMEMORE_C2,
    'timemore c3': GrinderModel.TIMEMORE_C3,
    'c2': GrinderModel.TIMEMORE_C2,
    'c3': GrinderModel.TIMEMORE_C3,
    
    // 1Zpresso variations
    '1zpresso jx-pro': GrinderModel.ONEZPRESSO_JX_PRO,
    '1zpresso jx pro': GrinderModel.ONEZPRESSO_JX_PRO,
    'jx-pro': GrinderModel.ONEZPRESSO_JX_PRO,
    'jx pro': GrinderModel.ONEZPRESSO_JX_PRO,
    
    // Hario variations
    'hario mini mill': GrinderModel.HARIO_MINI_MILL,
    'hario mini-mill': GrinderModel.HARIO_MINI_MILL,
    'mini mill': GrinderModel.HARIO_MINI_MILL,
    'hario': GrinderModel.HARIO_MINI_MILL,
    
    // Porlex variations
    'porlex mini': GrinderModel.PORLEX_MINI,
    'porlex': GrinderModel.PORLEX_MINI,
    
    // Knock variations
    'knock feldgrind': GrinderModel.KNOCK_FELDGRIND,
    'feldgrind': GrinderModel.KNOCK_FELDGRIND,
    'knock': GrinderModel.KNOCK_FELDGRIND
  };
  
  // Check for case-insensitive matches
  const lowerCaseModel = trimmedModel.toLowerCase();
  if (commonMappings[lowerCaseModel]) {
    return commonMappings[lowerCaseModel];
  }
  
  // If no mapping found, return original value (will be treated as custom)
  return trimmedModel;
};

// Recommended grinder models for different brewing methods
export const RECOMMENDED_GRINDERS = {
  POUR_OVER: [GrinderModel.BARATZA_ENCORE, GrinderModel.COMANDANTE_C40, GrinderModel.TIMEMORE_C2],
  ESPRESSO: [GrinderModel.BARATZA_VARIO, GrinderModel.ONEZPRESSO_JX_PRO, GrinderModel.BARATZA_VIRTUOSO_PLUS],
  FRENCH_PRESS: [GrinderModel.BARATZA_ENCORE, GrinderModel.HARIO_MINI_MILL, GrinderModel.TIMEMORE_C3],
  AEROPRESS: [GrinderModel.TIMEMORE_C2, GrinderModel.PORLEX_MINI, GrinderModel.COMANDANTE_C40],
  COLD_BREW: [GrinderModel.BARATZA_ENCORE, GrinderModel.KNOCK_FELDGRIND, GrinderModel.TIMEMORE_C3]
} as const;