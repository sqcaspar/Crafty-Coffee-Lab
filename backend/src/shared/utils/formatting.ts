// Utility functions for data formatting and display

/**
 * Format date for display
 * @param dateString - ISO date string
 * @param format - Format type
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string,
  format: 'short' | 'medium' | 'long' | 'relative' = 'medium'
): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    
    case 'medium':
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    
    case 'long':
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    
    case 'relative':
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
      return `${Math.floor(diffDays / 365)}y ago`;
    
    default:
      return date.toLocaleDateString();
  }
};

/**
 * Format rating for display (stars or numeric)
 * @param rating - Rating value (1-10)
 * @param format - Display format
 * @returns Formatted rating string
 */
export const formatRating = (
  rating: number,
  format: 'stars' | 'numeric' | 'percentage' = 'numeric'
): string => {
  if (rating < 1 || rating > 10) {
    return 'N/A';
  }
  
  switch (format) {
    case 'stars':
      const fullStars = Math.floor(rating / 2);
      const halfStar = rating % 2 >= 1;
      return '★'.repeat(fullStars) + (halfStar ? '☆' : '') + '☆'.repeat(5 - fullStars - (halfStar ? 1 : 0));
    
    case 'percentage':
      return `${(rating * 10)}%`;
    
    case 'numeric':
    default:
      return `${rating}/10`;
  }
};

/**
 * Format number with proper units
 * @param value - Numeric value
 * @param unit - Unit type
 * @param precision - Decimal places
 * @returns Formatted string with units
 */
export const formatWithUnits = (
  value: number,
  unit: 'grams' | 'celsius' | 'percentage' | 'meters' | 'seconds',
  precision: number = 1
): string => {
  const formattedValue = value.toFixed(precision);
  
  switch (unit) {
    case 'grams':
      return `${formattedValue}g`;
    case 'celsius':
      return `${formattedValue}°C`;
    case 'percentage':
      return `${formattedValue}%`;
    case 'meters':
      return `${formattedValue}m`;
    case 'seconds':
      return `${formattedValue}s`;
    default:
      return formattedValue;
  }
};

/**
 * Format text for display (truncate, capitalize, etc.)
 * @param text - Input text
 * @param options - Formatting options
 * @returns Formatted text
 */
export const formatText = (
  text: string,
  options: {
    maxLength?: number;
    capitalize?: 'first' | 'words' | 'all';
    ellipsis?: boolean;
  } = {}
): string => {
  let formatted = text.trim();
  
  // Apply capitalization
  if (options.capitalize) {
    switch (options.capitalize) {
      case 'first':
        formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
        break;
      case 'words':
        formatted = formatted.replace(/\b\w/g, char => char.toUpperCase());
        break;
      case 'all':
        formatted = formatted.toUpperCase();
        break;
    }
  }
  
  // Apply length limit
  if (options.maxLength && formatted.length > options.maxLength) {
    formatted = formatted.slice(0, options.maxLength);
    if (options.ellipsis !== false) {
      formatted += '...';
    }
  }
  
  return formatted;
};

/**
 * Format brewing method for display
 * @param method - Brewing method enum value
 * @returns Human-readable method name
 */
export const formatBrewingMethod = (method: string): string => {
  const methodMap: Record<string, string> = {
    'pour-over': 'Pour Over',
    'french-press': 'French Press',
    'aeropress': 'AeroPress',
    'cold-brew': 'Cold Brew'
  };
  
  return methodMap[method] || formatText(method, { capitalize: 'words' });
};

/**
 * Format roasting level for display
 * @param level - Roasting level enum value
 * @returns Human-readable level name
 */
export const formatRoastingLevel = (level: string): string => {
  return formatText(level, { capitalize: 'first' });
};

/**
 * Format recipe name with fallback
 * @param name - Recipe name
 * @param fallback - Fallback components
 * @returns Display-ready recipe name
 */
export const formatRecipeName = (
  name: string | undefined,
  fallback?: {
    origin?: string;
    date?: string;
    method?: string;
  }
): string => {
  if (name?.trim()) {
    return formatText(name, { maxLength: 50 });
  }
  
  // Generate fallback name
  if (fallback?.origin) {
    const date = fallback.date ? formatDate(fallback.date, 'short') : 'Recent';
    const method = fallback.method ? ` (${formatBrewingMethod(fallback.method)})` : '';
    return `${fallback.origin} - ${date}${method}`;
  }
  
  return 'Untitled Recipe';
};

/**
 * Format file size for display
 * @param bytes - Size in bytes
 * @returns Human-readable file size
 */
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
};

/**
 * Format count with pluralization
 * @param count - Number to format
 * @param singular - Singular form
 * @param plural - Plural form (optional, will add 's' if not provided)
 * @returns Formatted count string
 */
export const formatCount = (
  count: number,
  singular: string,
  plural?: string
): string => {
  const pluralForm = plural || `${singular}s`;
  return `${count} ${count === 1 ? singular : pluralForm}`;
};

/**
 * Format search results count
 * @param count - Number of results
 * @param total - Total available
 * @returns Formatted results string
 */
export const formatSearchResults = (count: number, total?: number): string => {
  if (total !== undefined) {
    return `${count} of ${total} recipes`;
  }
  return formatCount(count, 'recipe');
};

/**
 * Format validation errors for user display
 * @param errors - Array of error messages
 * @returns Formatted error string
 */
export const formatValidationErrorsList = (errors: string[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0] || '';
  
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
};

/**
 * Extract and format first sentence from text
 * @param text - Full text
 * @param maxLength - Maximum length
 * @returns First sentence or truncated text
 */
export const extractSummary = (text: string, maxLength: number = 100): string => {
  if (!text?.trim()) return '';
  
  // Try to find first sentence
  const sentences = text.split(/[.!?]+/);
  const firstSentence = sentences[0]?.trim();
  
  if (firstSentence && firstSentence.length <= maxLength) {
    return firstSentence + '.';
  }
  
  // Fallback to truncation
  return formatText(text, { maxLength, ellipsis: true });
};