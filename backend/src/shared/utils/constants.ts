// Application constants and configuration values

/**
 * Validation limits and constraints
 */
export const VALIDATION_LIMITS = {
  // Text field limits
  RECIPE_NAME_MAX_LENGTH: 200,
  ORIGIN_MAX_LENGTH: 100,
  PROCESSING_METHOD_MAX_LENGTH: 50,
  GRINDER_MODEL_MAX_LENGTH: 100,
  GRINDER_UNIT_MAX_LENGTH: 50,
  FILTERING_TOOLS_MAX_LENGTH: 100,
  TURBULENCE_MAX_LENGTH: 200,
  ADDITIONAL_NOTES_MAX_LENGTH: 1000,
  TASTING_NOTES_MAX_LENGTH: 2000,
  
  // Collection limits
  COLLECTION_NAME_MAX_LENGTH: 100,
  COLLECTION_DESCRIPTION_MAX_LENGTH: 500,
  
  // Numeric limits
  MAX_ALTITUDE: 10000, // meters
  MAX_TEMPERATURE: 120, // celsius
  MAX_COFFEE_AMOUNT: 1000, // grams
  MAX_WATER_AMOUNT: 10000, // grams
  MAX_TDS: 100, // percentage
  MAX_EXTRACTION_YIELD: 100, // percentage
  
  // Rating scales
  RATING_MIN: 1,
  RATING_MAX: 10,
  
  // Search and pagination limits
  SEARCH_TERM_MAX_LENGTH: 200,
  MAX_SELECTED_ORIGINS: 50,
  MAX_SELECTED_COLLECTIONS: 20,
  PAGINATION_MAX_LIMIT: 1000,
  DEFAULT_PAGE_SIZE: 20,
  
  // Export limits
  MAX_EXPORT_RECORDS: 10000,
  MAX_SELECTED_RECIPES: 1000,
  EXPORT_FILENAME_MAX_LENGTH: 100,
  
  // File size limits
  MAX_EXPORT_FILE_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

/**
 * Default values for various fields
 */
export const DEFAULT_VALUES = {
  // Recipe defaults
  FAVORITE_STATUS: false,
  COFFEE_WATER_RATIO: 16.0,
  BREWING_TEMPERATURE: 93, // celsius
  OVERALL_IMPRESSION: 5,
  
  // Search defaults
  SORT_FIELD: 'date-modified' as const,
  SORT_DIRECTION: 'desc' as const,
  PAGE_SIZE: 20,
  INCLUDE_FAVORITES: false,
  INCLUDE_UNCOLLECTED: true,
  
  // Export defaults
  EXPORT_FORMAT: 'csv' as const,
  EXPORT_SCOPE: 'all' as const,
  INCLUDE_TIMESTAMP: true,
  INCLUDE_HEADERS: true,
  CSV_DELIMITER: ',',
  CSV_QUOTE_CHAR: '"',
  EXCEL_WORKSHEET_NAME: 'Recipes',
  
  // Date formats
  DATE_FORMAT: 'YYYY-MM-DD',
  DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
  DISPLAY_DATE_FORMAT: 'MMM DD, YYYY',
} as const;

/**
 * SCA (Specialty Coffee Association) brewing standards
 */
export const SCA_STANDARDS = {
  // Optimal brewing ratios (coffee:water)
  OPTIMAL_RATIO_MIN: 15.0,
  OPTIMAL_RATIO_MAX: 17.0,
  IDEAL_RATIO: 16.0,
  
  // Water temperature ranges (celsius)
  TEMPERATURE_MIN: 90,
  TEMPERATURE_MAX: 96,
  IDEAL_TEMPERATURE: 93,
  
  // TDS (Total Dissolved Solids) standards
  TDS_UNDER_EXTRACTED_MAX: 1.15,
  TDS_IDEAL_MIN: 1.15,
  TDS_IDEAL_MAX: 1.35,
  TDS_STRONG_MAX: 1.55,
  
  // Extraction yield standards
  EXTRACTION_UNDER_MAX: 18,
  EXTRACTION_IDEAL_MIN: 18,
  EXTRACTION_IDEAL_MAX: 22,
  EXTRACTION_STRONG_MAX: 24,
  
  // Brewing time recommendations (seconds)
  POUR_OVER_TIME_MIN: 180, // 3 minutes
  POUR_OVER_TIME_MAX: 240, // 4 minutes
  FRENCH_PRESS_TIME: 240, // 4 minutes
  AEROPRESS_TIME_MIN: 60, // 1 minute
  AEROPRESS_TIME_MAX: 120, // 2 minutes
  COLD_BREW_TIME_MIN: 43200, // 12 hours
  COLD_BREW_TIME_MAX: 86400, // 24 hours
} as const;

/**
 * Brewing method specific recommendations
 */
export const BREWING_RECOMMENDATIONS = {
  'pour-over': {
    ratio: { min: 15, max: 17, ideal: 16 },
    temperature: { min: 90, max: 96, ideal: 93 },
    grindSize: 'Medium-fine',
    brewTime: { min: 180, max: 240 },
    description: 'Clean, bright, and nuanced flavors'
  },
  'french-press': {
    ratio: { min: 14, max: 17, ideal: 15 },
    temperature: { min: 92, max: 98, ideal: 95 },
    grindSize: 'Coarse',
    brewTime: { min: 240, max: 240 },
    description: 'Full-bodied, rich, and immersive'
  },
  'aeropress': {
    ratio: { min: 13, max: 18, ideal: 15 },
    temperature: { min: 80, max: 90, ideal: 85 },
    grindSize: 'Medium-fine',
    brewTime: { min: 60, max: 120 },
    description: 'Smooth, clean, and versatile'
  },
  'cold-brew': {
    ratio: { min: 6, max: 10, ideal: 8 },
    temperature: { min: 20, max: 25, ideal: 22 },
    grindSize: 'Extra coarse',
    brewTime: { min: 43200, max: 86400 },
    description: 'Low acidity, smooth, and refreshing'
  }
} as const;

/**
 * Grind size recommendations
 */
export const GRIND_SIZES = {
  EXTRA_COARSE: 'Extra Coarse',
  COARSE: 'Coarse',
  MEDIUM_COARSE: 'Medium-Coarse',
  MEDIUM: 'Medium',
  MEDIUM_FINE: 'Medium-Fine',
  FINE: 'Fine',
  EXTRA_FINE: 'Extra Fine'
} as const;

/**
 * Common coffee origins and their characteristics
 */
export const COFFEE_ORIGINS = {
  'Ethiopia': {
    characteristics: ['Floral', 'Fruity', 'Wine-like', 'Tea-like'],
    commonProcessing: ['Washed', 'Natural'],
    typicalAltitude: [1800, 2200]
  },
  'Colombia': {
    characteristics: ['Balanced', 'Nutty', 'Chocolate', 'Caramel'],
    commonProcessing: ['Washed', 'Honey'],
    typicalAltitude: [1200, 2000]
  },
  'Kenya': {
    characteristics: ['Bright', 'Wine-like', 'Blackcurrant', 'Juicy'],
    commonProcessing: ['Washed'],
    typicalAltitude: [1400, 2100]
  },
  'Guatemala': {
    characteristics: ['Full-bodied', 'Spicy', 'Chocolate', 'Smoky'],
    commonProcessing: ['Washed', 'Natural'],
    typicalAltitude: [1300, 2000]
  },
  'Brazil': {
    characteristics: ['Nutty', 'Chocolate', 'Low acidity', 'Heavy body'],
    commonProcessing: ['Pulped Natural', 'Natural'],
    typicalAltitude: [800, 1600]
  },
  'Costa Rica': {
    characteristics: ['Bright', 'Clean', 'Citrus', 'Honey'],
    commonProcessing: ['Honey', 'Washed'],
    typicalAltitude: [1200, 1800]
  }
} as const;

/**
 * API configuration constants
 */
export const API_CONFIG = {
  // Request timeouts (milliseconds)
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  EXPORT_TIMEOUT: 300000, // 5 minutes
  UPLOAD_TIMEOUT: 60000, // 1 minute
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Rate limiting
  REQUESTS_PER_MINUTE: 60,
  BURST_LIMIT: 10,
  
  // File download expiry
  DOWNLOAD_LINK_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * UI configuration constants
 */
export const UI_CONFIG = {
  // Animation durations (milliseconds)
  ANIMATION_FAST: 200,
  ANIMATION_NORMAL: 300,
  ANIMATION_SLOW: 500,
  
  // Debounce delays
  SEARCH_DEBOUNCE: 300,
  AUTOSAVE_DEBOUNCE: 1000,
  RESIZE_DEBOUNCE: 100,
  
  // Breakpoints (pixels)
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1200,
  
  // Grid and layout
  CARD_MIN_WIDTH: 300,
  CARD_MAX_WIDTH: 400,
  SIDEBAR_WIDTH: 280,
  
  // Colors (for programmatic use)
  COLORS: {
    PRIMARY: '#0ea5e9',
    SECONDARY: '#64748b',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6',
  }
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  DRAFT_RECIPE: 'coffee_tracker_draft_recipe',
  USER_PREFERENCES: 'coffee_tracker_user_prefs',
  SEARCH_HISTORY: 'coffee_tracker_search_history',
  FAVORITE_FILTERS: 'coffee_tracker_favorite_filters',
  LAST_EXPORT_OPTIONS: 'coffee_tracker_last_export',
  THEME_PREFERENCE: 'coffee_tracker_theme',
} as const;

/**
 * Error messages and codes
 */
export const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Validation failed',
  RECIPE_NOT_FOUND: 'Recipe not found',
  COLLECTION_NOT_FOUND: 'Collection not found',
  DUPLICATE_NAME: 'Name already exists',
  NETWORK_ERROR: 'Network connection failed',
  SERVER_ERROR: 'Server error occurred',
  UNAUTHORIZED: 'Unauthorized access',
  RATE_LIMIT: 'Too many requests',
  FILE_TOO_LARGE: 'File size exceeds limit',
  INVALID_FORMAT: 'Invalid file format',
} as const;