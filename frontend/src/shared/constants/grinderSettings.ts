/**
 * Grinder Setting Constants
 * 
 * Defines the numeric range for coffee grinder settings from 1 to 40.
 * This standardized scale covers the full range from extra fine to extra coarse
 * grind sizes commonly used in coffee brewing.
 */

// Generate grinder setting range from 1 to 40
const generateGrinderSettingRange = (min: number, max: number): string[] => {
  const range: string[] = [];
  for (let setting = min; setting <= max; setting++) {
    range.push(setting.toString());
  }
  return range;
};

// Grinder setting range (1 to 40 as strings for Select component)
export const GRINDER_SETTING_RANGE = generateGrinderSettingRange(1, 40);

// Grinder setting options for dropdown with descriptive labels for key ranges
export const GRINDER_SETTING_OPTIONS = GRINDER_SETTING_RANGE.map(setting => {
  const num = parseInt(setting, 10);
  let label = setting;
  
  // Add descriptive labels for key ranges
  if (num === 1) label = "1 (Extra Fine)";
  else if (num === 5) label = "5 (Fine)";
  else if (num === 10) label = "10 (Medium-Fine)";
  else if (num === 15) label = "15 (Medium-Fine)";
  else if (num === 20) label = "20 (Medium)";
  else if (num === 25) label = "25 (Medium)";
  else if (num === 30) label = "30 (Medium-Coarse)";
  else if (num === 35) label = "35 (Coarse)";
  else if (num === 40) label = "40 (Extra Coarse)";
  
  return {
    value: setting,
    label: label
  };
});

// Constants for validation and logic
export const MIN_GRINDER_SETTING = 1;
export const MAX_GRINDER_SETTING = 40;

// Helper function to check if a grinder setting is within valid range
export const isValidGrinderSetting = (setting: string): boolean => {
  const num = parseInt(setting, 10);
  return !isNaN(num) && num >= MIN_GRINDER_SETTING && num <= MAX_GRINDER_SETTING;
};

// Helper function to get the closest valid grinder setting
export const getClosestValidGrinderSetting = (setting: string): string => {
  const num = parseInt(setting, 10);
  if (isNaN(num)) return "20"; // Default to medium setting
  
  if (num < MIN_GRINDER_SETTING) return MIN_GRINDER_SETTING.toString();
  if (num > MAX_GRINDER_SETTING) return MAX_GRINDER_SETTING.toString();
  
  return num.toString();
};

// Get grinder setting label with description
export const getGrinderSettingLabel = (setting: string): string => {
  const option = GRINDER_SETTING_OPTIONS.find(opt => opt.value === setting);
  return option ? option.label : setting;
};

// Migration helper for existing descriptive grinder setting data
export const migrateGrinderSetting = (grinderSetting: string): string => {
  if (!grinderSetting || grinderSetting.trim() === '') {
    return '20'; // Default to medium setting
  }

  const trimmedSetting = grinderSetting.trim();
  
  // Check if it's already a valid numeric setting
  if (isValidGrinderSetting(trimmedSetting)) {
    return trimmedSetting;
  }
  
  // Common descriptive mappings to numeric settings
  const descriptiveMappings: Record<string, string> = {
    // Extra Fine (Espresso, Turkish)
    'extra fine': '2',
    'very fine': '3',
    'turkish': '1',
    'espresso': '4',
    
    // Fine (Espresso, Moka pot)
    'fine': '6',
    'fine grind': '6',
    'moka pot': '7',
    'aeropress fine': '8',
    
    // Medium-Fine (Pour over, drip)
    'medium-fine': '12',
    'medium fine': '12',
    'pour over': '13',
    'v60': '14',
    'chemex fine': '11',
    'drip': '15',
    
    // Medium (Most common setting)
    'medium': '20',
    'medium grind': '20',
    'auto drip': '22',
    'cone filter': '18',
    'flat filter': '25',
    
    // Medium-Coarse (Chemex, pour over)
    'medium-coarse': '28',
    'medium coarse': '28',
    'chemex': '30',
    'clever dripper': '26',
    
    // Coarse (French press, cold brew)
    'coarse': '33',
    'coarse grind': '33',
    'french press': '35',
    'press pot': '35',
    'cold brew': '37',
    
    // Extra Coarse (Cold brew, cowboy coffee)
    'extra coarse': '38',
    'very coarse': '39',
    'cowboy coffee': '40',
    'percolator': '36'
  };
  
  // Check for case-insensitive matches
  const lowerCaseSetting = trimmedSetting.toLowerCase();
  if (descriptiveMappings[lowerCaseSetting]) {
    return descriptiveMappings[lowerCaseSetting];
  }
  
  // Extract numbers from mixed strings (e.g., "Setting 20", "20 clicks")
  const numberMatch = trimmedSetting.match(/\d+/);
  if (numberMatch) {
    const extractedNumber = numberMatch[0];
    if (isValidGrinderSetting(extractedNumber)) {
      return extractedNumber;
    }
  }
  
  // Default to medium setting if no mapping found
  return '20';
};

// Recommended grinder settings for different brewing methods
export const RECOMMENDED_GRINDER_SETTINGS = {
  ESPRESSO: ['3', '4', '5', '6'],
  MOKA_POT: ['6', '7', '8'],
  AEROPRESS: ['8', '10', '12'],
  POUR_OVER: ['12', '14', '16'],
  DRIP_COFFEE: ['15', '18', '20'],
  CHEMEX: ['26', '28', '30'],
  FRENCH_PRESS: ['32', '34', '36'],
  COLD_BREW: ['36', '38', '40']
};

// Helper to get recommended settings for a brewing method
export const getRecommendedSettingsForMethod = (brewingMethod: string): string[] => {
  const methodMap: Record<string, string[]> = {
    'espresso': RECOMMENDED_GRINDER_SETTINGS.ESPRESSO,
    'moka-pot': RECOMMENDED_GRINDER_SETTINGS.MOKA_POT,
    'aeropress': RECOMMENDED_GRINDER_SETTINGS.AEROPRESS,
    'pour-over': RECOMMENDED_GRINDER_SETTINGS.POUR_OVER,
    'drip': RECOMMENDED_GRINDER_SETTINGS.DRIP_COFFEE,
    'chemex': RECOMMENDED_GRINDER_SETTINGS.CHEMEX,
    'french-press': RECOMMENDED_GRINDER_SETTINGS.FRENCH_PRESS,
    'cold-brew': RECOMMENDED_GRINDER_SETTINGS.COLD_BREW
  };
  
  return methodMap[brewingMethod.toLowerCase()] || ['20']; // Default to medium
};