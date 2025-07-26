import { BrewingMethod, RoastingLevel } from '../shared/types/recipe';

// Helper function to format brewing method display
export const formatBrewingMethod = (method: BrewingMethod | undefined): string => {
  if (!method) return 'Unknown';
  
  const methodMap: Record<BrewingMethod, string> = {
    [BrewingMethod.POUR_OVER]: 'Pour-over',
    [BrewingMethod.FRENCH_PRESS]: 'French Press',
    [BrewingMethod.AEROPRESS]: 'Aeropress',
    [BrewingMethod.COLD_BREW]: 'Cold Brew',
  };
  
  return methodMap[method] || 'Unknown';
};

// Helper function to format roasting level display
export const formatRoastingLevel = (level: RoastingLevel | undefined): string => {
  if (!level) return 'Not specified';
  
  const levelMap: Record<RoastingLevel, string> = {
    [RoastingLevel.LIGHT]: 'Light',
    [RoastingLevel.MEDIUM]: 'Medium',
    [RoastingLevel.DARK]: 'Dark',
    [RoastingLevel.CUSTOM]: 'Custom',
  };
  
  return levelMap[level] || 'Unknown';
};

// Helper function to format relative date
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

// Helper function to format absolute date
export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'Not specified';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper function to calculate coffee-to-water ratio
export const calculateRatio = (coffeeBeans: number | undefined, water: number | undefined): string => {
  if (!coffeeBeans || !water || water === 0) return 'N/A';
  const ratio = water / coffeeBeans;
  return `1:${ratio.toFixed(1)}`;
};

// Helper function to render rating display
export const formatRating = (rating: number | undefined): string => {
  if (!rating) return 'Not rated';
  return `${rating}/10`;
};

// Helper function to generate rating stars
export const generateStars = (rating: number | undefined): string => {
  if (!rating) return '☆☆☆☆☆';
  
  const stars = Math.round(rating / 2); // Convert 1-10 to 1-5 stars
  const fullStars = Math.floor(stars);
  const emptyStars = 5 - fullStars;
  
  return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
};

// Helper function to format recipe duration or time-related info
export const formatDuration = (minutes: number | undefined): string => {
  if (!minutes) return 'Not specified';
  
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

// Helper function to truncate text with ellipsis
export const truncateText = (text: string | undefined, maxLength: number = 50): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

// Helper function to format temperature
export const formatTemperature = (temp: number | undefined): string => {
  if (!temp) return 'Not specified';
  return `${temp}°C`;
};

// Helper function to format weight measurements
export const formatWeight = (weight: number | undefined, unit: string = 'g'): string => {
  if (!weight) return 'Not specified';
  return `${weight}${unit}`;
};

// Helper function to format percentage
export const formatPercentage = (value: number | undefined): string => {
  if (!value) return 'Not measured';
  return `${value}%`;
};