/**
 * Water Temperature Constants
 * 
 * Defines the optimal water temperature range for coffee brewing.
 * Temperatures from 80°C to 100°C in descending order (hottest to coolest).
 * This range covers the ideal extraction temperatures for most brewing methods.
 */

// Generate temperature range from 100°C to 80°C (descending order)
const generateTemperatureRange = (max: number, min: number): number[] => {
  const range: number[] = [];
  for (let temp = max; temp >= min; temp--) {
    range.push(temp);
  }
  return range;
};

// Water temperature range (100°C to 80°C)
export const WATER_TEMPERATURE_RANGE = generateTemperatureRange(100, 80);

// Water temperature options for dropdown (descending order)
export const WATER_TEMPERATURE_OPTIONS = WATER_TEMPERATURE_RANGE.map(temp => ({
  value: temp.toString(), // Select component expects string values
  label: `${temp}°C`
}));

// Temperature constants for validation and logic
export const MIN_WATER_TEMPERATURE = 80;
export const MAX_WATER_TEMPERATURE = 100;

// Helper function to check if a temperature is within valid range
export const isValidWaterTemperature = (temperature: number): boolean => {
  return temperature >= MIN_WATER_TEMPERATURE && temperature <= MAX_WATER_TEMPERATURE;
};

// Helper function to get the closest valid temperature
export const getClosestValidTemperature = (temperature: number): number => {
  if (temperature < MIN_WATER_TEMPERATURE) {
    return MIN_WATER_TEMPERATURE;
  }
  if (temperature > MAX_WATER_TEMPERATURE) {
    return MAX_WATER_TEMPERATURE;
  }
  // Round to nearest integer within valid range
  return Math.round(temperature);
};

// Get temperature label with unit
export const getTemperatureLabel = (temperature: number): string => {
  return `${temperature}°C`;
};

// Convert string temperature to number (for form data)
export const parseTemperature = (temperatureStr: string): number | undefined => {
  const parsed = parseInt(temperatureStr, 10);
  if (isNaN(parsed)) {
    return undefined;
  }
  return isValidWaterTemperature(parsed) ? parsed : undefined;
};

// Migration helper for existing temperature data
export const migrateTemperature = (temperature: number): number | null => {
  // If within range, keep as-is
  if (isValidWaterTemperature(temperature)) {
    return Math.round(temperature); // Round to integer
  }
  
  // Handle common brewing temperatures outside range
  if (temperature >= 101 && temperature <= 105) {
    return MAX_WATER_TEMPERATURE; // Boiling water -> 100°C
  }
  
  if (temperature >= 75 && temperature < MIN_WATER_TEMPERATURE) {
    return MIN_WATER_TEMPERATURE; // Close to range -> 80°C
  }
  
  // Cold brew and room temperature (below 75°C) 
  if (temperature <= 30) {
    return null; // Keep as special case or exclude
  }
  
  // Unreasonable temperatures
  if (temperature > 120 || temperature < 0) {
    return null; // Invalid data
  }
  
  // Default: round to closest valid temperature
  return getClosestValidTemperature(temperature);
};

// Recommended temperatures for different brewing methods
export const RECOMMENDED_TEMPERATURES = {
  LIGHT_ROAST: 95, // Higher temperature for light roasts
  MEDIUM_ROAST: 90, // Standard temperature for medium roasts  
  DARK_ROAST: 85,   // Lower temperature for dark roasts
  COLD_BREW: null,  // Room temperature (not in our range)
  ESPRESSO: 90,     // Standard espresso temperature
  POUR_OVER: 93,    // Popular pour-over temperature
  FRENCH_PRESS: 92  // French press optimal temperature
} as const;