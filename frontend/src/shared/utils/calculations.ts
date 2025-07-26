// Utility functions for coffee brewing calculations

/**
 * Calculate coffee-to-water ratio
 * @param coffeeBeans - Amount of coffee in grams
 * @param water - Amount of water in grams
 * @param precision - Number of decimal places (default: 2)
 * @returns Ratio as water/coffee (e.g., 15.5 means 1:15.5)
 */
export const calculateCoffeeWaterRatio = (
  coffeeBeans: number,
  water: number,
  precision: number = 2
): number => {
  if (coffeeBeans <= 0) {
    throw new Error('Coffee beans amount must be positive');
  }
  if (water <= 0) {
    throw new Error('Water amount must be positive');
  }
  
  const ratio = water / coffeeBeans;
  return Math.round(ratio * Math.pow(10, precision)) / Math.pow(10, precision);
};

/**
 * Format ratio for display (e.g., "1:15.5")
 * @param ratio - Calculated ratio
 * @returns Formatted string
 */
export const formatRatio = (ratio: number): string => {
  return `1:${ratio.toFixed(1)}`;
};

/**
 * Calculate extraction yield percentage
 * @param tds - Total Dissolved Solids percentage
 * @param coffeeWeight - Weight of coffee used in grams
 * @param drinkWeight - Weight of final drink in grams
 * @returns Extraction yield percentage
 */
export const calculateExtractionYield = (
  tds: number,
  coffeeWeight: number,
  drinkWeight: number
): number => {
  if (tds <= 0 || coffeeWeight <= 0 || drinkWeight <= 0) {
    throw new Error('All values must be positive');
  }
  
  const extractionYield = (tds * drinkWeight) / (coffeeWeight * 10);
  return Math.round(extractionYield * 100) / 100;
};

/**
 * Calculate strength (concentration) percentage
 * @param tds - Total Dissolved Solids percentage
 * @returns Strength percentage
 */
export const calculateStrength = (tds: number): number => {
  return tds;
};

/**
 * Determine brew strength category based on TDS
 * @param tds - Total Dissolved Solids percentage
 * @returns Strength category
 */
export const getStrengthCategory = (tds: number): string => {
  if (tds < 1.15) return 'Under-extracted';
  if (tds <= 1.35) return 'Ideal';
  if (tds <= 1.55) return 'Strong';
  return 'Over-extracted';
};

/**
 * Determine extraction category based on yield percentage
 * @param yield - Extraction yield percentage
 * @returns Extraction category
 */
export const getExtractionCategory = (extractionYield: number): string => {
  if (extractionYield < 18) return 'Under-extracted';
  if (extractionYield <= 22) return 'Ideal';
  if (extractionYield <= 24) return 'Strong';
  return 'Over-extracted';
};

/**
 * Calculate recommended brewing parameters based on method
 * @param method - Brewing method
 * @returns Recommended parameters
 */
export const getRecommendedParameters = (method: string) => {
  const recommendations = {
    'pour-over': {
      ratio: { min: 15, max: 17, ideal: 16 },
      temperature: { min: 90, max: 96, ideal: 93 },
      grindSize: 'Medium-fine',
      brewTime: '3-4 minutes'
    },
    'french-press': {
      ratio: { min: 14, max: 17, ideal: 15 },
      temperature: { min: 92, max: 98, ideal: 95 },
      grindSize: 'Coarse',
      brewTime: '4 minutes'
    },
    'aeropress': {
      ratio: { min: 13, max: 18, ideal: 15 },
      temperature: { min: 80, max: 90, ideal: 85 },
      grindSize: 'Medium-fine',
      brewTime: '1-2 minutes'
    },
    'cold-brew': {
      ratio: { min: 6, max: 10, ideal: 8 },
      temperature: { min: 20, max: 25, ideal: 22 },
      grindSize: 'Extra coarse',
      brewTime: '12-24 hours'
    }
  };
  
  return recommendations[method as keyof typeof recommendations] || null;
};

/**
 * Calculate water temperature based on altitude
 * @param altitude - Altitude in meters
 * @param baseTemp - Base temperature at sea level
 * @returns Adjusted temperature
 */
export const adjustTemperatureForAltitude = (
  altitude: number,
  baseTemp: number = 93
): number => {
  // Water boils at lower temperature at higher altitudes
  // Approximately 1°C decrease per 300m elevation
  const adjustment = Math.floor(altitude / 300);
  return Math.max(baseTemp - adjustment, 80); // Minimum practical brewing temp
};

/**
 * Convert between temperature units
 * @param temp - Temperature value
 * @param from - Source unit ('C' or 'F')
 * @param to - Target unit ('C' or 'F')
 * @returns Converted temperature
 */
export const convertTemperature = (
  temp: number,
  from: 'C' | 'F',
  to: 'C' | 'F'
): number => {
  if (from === to) return temp;
  
  if (from === 'C' && to === 'F') {
    return (temp * 9/5) + 32;
  } else {
    return (temp - 32) * 5/9;
  }
};

/**
 * Calculate total brewing time from start to finish
 * @param bloomTime - Bloom/pre-infusion time in seconds
 * @param pourTime - Pour time in seconds
 * @param steepTime - Steep time in seconds
 * @returns Total brewing time in seconds
 */
export const calculateTotalBrewTime = (
  bloomTime: number = 0,
  pourTime: number = 0,
  steepTime: number = 0
): number => {
  return bloomTime + pourTime + steepTime;
};

/**
 * Format time in seconds to readable format
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "3:30")
 */
export const formatBrewTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Calculate grind size recommendation based on brew method and time
 * @param method - Brewing method
 * @param targetTime - Target brew time in seconds
 * @returns Grind size recommendation
 */
export const recommendGrindSize = (method: string, targetTime: number): string => {
  const baseRecommendations = getRecommendedParameters(method);
  if (!baseRecommendations) return 'Medium';
  
  // Adjust based on target time vs recommended time
  const timeRange = baseRecommendations.brewTime;
  let minTime: number, maxTime: number;
  
  if (typeof timeRange === 'string') {
    const [minTimeStr, maxTimeStr] = timeRange.split('-');
    minTime = parseInt(minTimeStr?.replace(/[^0-9]/g, '') || '0') * 60;
    maxTime = parseInt(maxTimeStr?.replace(/[^0-9]/g, '') || '0') * 60;
  } else if (typeof timeRange === 'object' && timeRange && 'min' in timeRange && 'max' in timeRange) {
    minTime = (timeRange as any).min;
    maxTime = (timeRange as any).max;
  } else {
    minTime = 180; // Default 3 minutes
    maxTime = 240; // Default 4 minutes
  }
  
  const avgTime = (minTime + maxTime) / 2;
  
  if (targetTime > avgTime * 1.2) return 'Coarser';
  if (targetTime < avgTime * 0.8) return 'Finer';
  return baseRecommendations.grindSize;
};