# Coffee Brewing Recipe Tracker - Development Blueprint

## Project Architecture Overview

### Technology Stack Selection
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: SQLite (for MVP simplicity, easily upgradeable to PostgreSQL)
- **Validation**: Zod (shared between frontend and backend)
- **Testing**: Jest + React Testing Library + Supertest
- **Build Tools**: Vite for frontend, standard Node.js for backend

### Project Structure
```
coffee-brewing-tracker/
├── frontend/                 # React application
├── backend/                  # Express API server
├── shared/                   # Shared types and validation schemas
├── docs/                     # Documentation
└── scripts/                  # Build and deployment scripts
```

## Development Phases Breakdown

### Phase 1: Foundation (Steps 1-4)
- Project setup and basic infrastructure
- Database schema and models
- Basic API endpoints
- Frontend shell with navigation

### Phase 2: Core Recipe Management (Steps 5-8)
- Recipe input form with validation
- Recipe display and listing
- Basic CRUD operations
- Recipe editing functionality

### Phase 3: Search and Filter (Steps 9-11)
- Search functionality implementation
- Filter system development
- Advanced querying capabilities

### Phase 4: Collections and Favorites (Steps 12-13)
- Favorites functionality
- Collections management
- Recipe organization features

### Phase 5: Export and Polish (Steps 14-16)
- Export functionality (CSV/Excel)
- UI/UX improvements
- Testing and deployment preparation

## Detailed Development Steps

### Step 1: Project Foundation
**Goal**: Set up basic project structure with build tools and development environment
**Duration**: 1-2 hours
**Dependencies**: None
**Deliverables**: 
- Working development environment
- Basic project structure
- Package configuration files

### Step 2: Database Schema and Models
**Goal**: Create database schema and basic data models
**Duration**: 2-3 hours
**Dependencies**: Step 1
**Deliverables**:
- SQLite database setup
- Recipe table schema
- Collections table schema
- Basic database utilities

### Step 3: Shared Types and Validation
**Goal**: Create TypeScript types and Zod validation schemas
**Duration**: 1-2 hours
**Dependencies**: Step 2
**Deliverables**:
- TypeScript interfaces for all data models
- Zod schemas for validation
- Shared utilities for type safety

### Step 4: Basic API Infrastructure
**Goal**: Set up Express server with basic endpoints
**Duration**: 2-3 hours
**Dependencies**: Steps 2, 3
**Deliverables**:
- Express server setup
- Basic CRUD endpoints for recipes
- Error handling middleware
- API testing setup

### Step 5: Frontend Shell and Navigation
**Goal**: Create basic React app with tab navigation
**Duration**: 2-3 hours
**Dependencies**: Step 3
**Deliverables**:
- React app with TypeScript
- Tab-based navigation system
- Basic layout components
- Routing setup

### Step 6: Recipe Input Form - Basic Structure
**Goal**: Create recipe input form with all fields
**Duration**: 3-4 hours
**Dependencies**: Steps 3, 5
**Deliverables**:
- Complete form structure
- Form state management
- Basic field components
- Form submission handling

### Step 7: Form Validation and Error Handling
**Goal**: Implement comprehensive form validation
**Duration**: 2-3 hours
**Dependencies**: Step 6
**Deliverables**:
- Real-time field validation
- Error message display
- Form submission validation
- Auto-calculation for ratios

### Step 8: Recipe Storage and Retrieval
**Goal**: Connect form to backend for data persistence
**Duration**: 2-3 hours
**Dependencies**: Steps 4, 7
**Deliverables**:
- API integration for recipe saving
- Recipe retrieval functionality
- Error handling for API calls
- Success/failure feedback

### Step 9: Recipe Display and Listing
**Goal**: Create recipe list view with card layout
**Duration**: 3-4 hours
**Dependencies**: Step 8
**Deliverables**:
- Recipe card components
- Recipe list display
- Pagination or infinite scroll
- Recipe detail modal/page

### Step 10: Recipe Editing and Deletion
**Goal**: Enable recipe modification and removal
**Duration**: 2-3 hours
**Dependencies**: Step 9
**Deliverables**:
- Edit recipe functionality
- Delete recipe with confirmation
- Update API endpoints
- Optimistic updates

### Step 11: Basic Search Functionality
**Goal**: Implement text-based recipe search
**Duration**: 2-3 hours
**Dependencies**: Step 9
**Deliverables**:
- Search input component
- Backend search implementation
- Real-time search results
- Search result highlighting

### Step 12: Advanced Filtering System
**Goal**: Create comprehensive filtering options
**Duration**: 3-4 hours
**Dependencies**: Step 11
**Deliverables**:
- Filter components (dropdowns, sliders, multi-select)
- Combined filter logic
- Filter persistence
- Clear filters functionality

### Step 13: Favorites System
**Goal**: Implement recipe favoriting
**Duration**: 2-3 hours
**Dependencies**: Step 10
**Deliverables**:
- Favorite toggle functionality
- Favorites tab implementation
- Favorite status persistence
- Favorites-only filtering

### Step 14: Collections Management
**Goal**: Create custom recipe collections
**Duration**: 3-4 hours
**Dependencies**: Step 13
**Deliverables**:
- Collection creation/management
- Add/remove recipes from collections
- Collection display
- Collection-based filtering

### Step 15: Export Functionality
**Goal**: Implement CSV and Excel export
**Duration**: 3-4 hours
**Dependencies**: Step 12
**Deliverables**:
- Export API endpoints
- CSV generation
- Excel file generation
- Export with current filters

### Step 16: Final Testing and Polish
**Goal**: Comprehensive testing and UI improvements
**Duration**: 4-6 hours
**Dependencies**: All previous steps
**Deliverables**:
- Complete test suite
- Performance optimizations
- UI/UX improvements
- Documentation updates

## Individual LLM Implementation Prompts

### Prompt 1: Project Foundation Setup

```
Create a coffee brewing recipe tracker application foundation with the following requirements:

1. Set up a monorepo structure with three main directories:
   - `frontend/` (React + TypeScript + Vite)
   - `backend/` (Node.js + Express + TypeScript)
   - `shared/` (shared types and utilities)

2. Initialize package.json files with appropriate dependencies:
   - Frontend: React, TypeScript, Vite, Tailwind CSS, @types packages
   - Backend: Express, TypeScript, ts-node, nodemon, cors
   - Shared: TypeScript only

3. Create basic configuration files:
   - tsconfig.json for each directory
   - vite.config.ts for frontend
   - tailwind.config.js for styling
   - .gitignore file
   - Basic README.md

4. Set up npm scripts for:
   - Starting development servers
   - Building for production
   - Running tests
   - Running both frontend and backend simultaneously

5. Create a basic file structure with placeholder files:
   - Frontend: App.tsx, main.tsx, index.html
   - Backend: server.ts, app.ts
   - Shared: types.ts

Ensure all configurations work together and the development environment can be started with simple npm commands. Include error handling for missing dependencies and clear documentation for setup.
```

### Prompt 2: Database Schema and Models

```
Create a comprehensive database schema and models for the coffee brewing recipe tracker with these specifications:

1. Set up SQLite database with the following tables:
   - `recipes` table with all fields from the specification
   - `collections` table for custom recipe groupings
   - `recipe_collections` junction table for many-to-many relationship

2. Create the recipes table schema with these exact fields:
   - id (UUID primary key)
   - recipe_name (TEXT)
   - date_created (DATETIME)
   - date_modified (DATETIME)
   - is_favorite (BOOLEAN)
   - origin (TEXT, required)
   - processing_method (TEXT, required)
   - altitude (INTEGER)
   - roasting_date (DATE)
   - roasting_level (TEXT)
   - water_temperature (REAL)
   - brewing_method (TEXT)
   - grinder_model (TEXT, required)
   - grinder_unit (TEXT, required)
   - filtering_tools (TEXT)
   - turbulence (TEXT)
   - additional_notes (TEXT)
   - coffee_beans (REAL, required)
   - water (REAL, required)
   - coffee_water_ratio (REAL, calculated)
   - tds (REAL)
   - extraction_yield (REAL)
   - overall_impression (INTEGER, required, 1-10)
   - acidity (INTEGER, 1-10)
   - body (INTEGER, 1-10)
   - sweetness (INTEGER, 1-10)
   - flavor (INTEGER, 1-10)
   - aftertaste (INTEGER, 1-10)
   - balance (INTEGER, 1-10)
   - tasting_notes (TEXT)

3. Create database utility functions:
   - Database connection management
   - Table creation with proper constraints
   - Migration system for future schema changes
   - Basic CRUD operations as helper functions

4. Include proper indexing for:
   - Search operations (recipe_name, origin, tasting_notes)
   - Filtering operations (brewing_method, roasting_level, overall_impression)
   - Date-based queries (date_created, date_modified)

5. Add data seeding functionality with 3-5 sample recipes for testing

Place all database code in `backend/src/database/` with separate files for schema, models, and utilities. Ensure proper TypeScript typing throughout.
```

### Prompt 3: Shared Types and Validation Schemas

```
Create comprehensive TypeScript types and Zod validation schemas for the coffee brewing recipe tracker:

1. Define TypeScript interfaces in `shared/src/types.ts`:
   - `Recipe` interface matching the database schema exactly
   - `RecipeInput` interface for form submissions (without auto-generated fields)
   - `Collection` interface for recipe collections
   - `SearchFilters` interface for filtering functionality
   - `ExportOptions` interface for export settings

2. Create Zod schemas in `shared/src/validation.ts`:
   - `RecipeSchema` for complete recipe validation
   - `RecipeInputSchema` for form input validation
   - `CollectionSchema` for collection validation
   - `SearchFiltersSchema` for filter validation

3. Validation rules must enforce:
   - Required fields: origin, processing_method, grinder_model, grinder_unit, coffee_beans, water, overall_impression
   - Number validation for all numeric fields (no range restrictions)
   - Date validation for date fields
   - String length limits where appropriate (recipe_name max 200 chars)
   - Enum validation for: roasting_level, brewing_method
   - Range validation for rating fields (1-10)

4. Create utility functions:
   - `validateRecipe()` function that returns detailed error information
   - `calculateCoffeeWaterRatio()` function for auto-calculations
   - `formatRecipeForDisplay()` for consistent data presentation
   - Type guards for runtime type checking

5. Export configuration:
   - All types and schemas should be easily importable
   - Include JSDoc comments for all interfaces
   - Provide example objects for each type

6. Enum definitions for:
   - RoastingLevel: 'light', 'medium', 'dark', 'custom'
   - BrewingMethod: 'pour-over', 'french-press', 'aeropress', 'cold-brew'
   - SortOptions: 'date-created', 'overall-impression', 'recipe-name'

Ensure all schemas can be used both client-side and server-side with proper error messages for validation failures.
```

### Prompt 4: Basic API Infrastructure

```
Create a comprehensive Express.js API server for the coffee brewing recipe tracker with these requirements:

1. Set up Express server in `backend/src/server.ts`:
   - CORS configuration for frontend integration
   - JSON body parsing middleware
   - Error handling middleware
   - Request logging for development
   - Environment variable configuration

2. Create API routes in `backend/src/routes/`:
   - `recipes.ts` with full CRUD endpoints
   - `collections.ts` for collection management
   - `export.ts` for data export functionality

3. Implement these recipe endpoints with proper HTTP methods:
   - GET /api/recipes - List all recipes with optional filtering
   - POST /api/recipes - Create new recipe
   - GET /api/recipes/:id - Get specific recipe
   - PUT /api/recipes/:id - Update recipe
   - DELETE /api/recipes/:id - Delete recipe

4. Request/Response handling:
   - Use Zod schemas from shared package for validation
   - Implement proper error responses with status codes
   - Return consistent JSON response format: `{ success: boolean, data?: any, error?: string }`
   - Handle database errors gracefully

5. Middleware functions:
   - Request validation middleware using Zod schemas
   - Error handling with detailed error messages
   - Request logging for debugging
   - CORS headers for development

6. Database integration:
   - Connect API endpoints to database functions from previous step
   - Implement proper transaction handling where needed
   - Add basic query optimization
   - Handle concurrent access safely

7. Testing setup:
   - Create test configuration with separate test database
   - Set up basic endpoint tests using Supertest
   - Include tests for successful operations and error cases
   - Test data validation and error responses

8. Development features:
   - Hot reload with nodemon
   - Environment-specific configurations
   - Basic logging system
   - Health check endpoint at /api/health

Ensure all endpoints return proper HTTP status codes and handle edge cases appropriately. Include comprehensive error messages for debugging.
```

### Prompt 5: Frontend Shell and Navigation

```
Create a React frontend shell with tab-based navigation for the coffee brewing recipe tracker:

1. Set up main React application in `frontend/src/`:
   - App.tsx as the main component
   - main.tsx for React 18 root rendering
   - Basic HTML template in index.html

2. Create a tab-based navigation system with three main tabs:
   - "Input" - Recipe creation and editing form
   - "Recipes" - Recipe listing and management
   - "Favorites" - Favorited recipes and collections

3. Implement navigation components in `frontend/src/components/`:
   - `Navigation.tsx` - Main tab navigation bar
   - `Layout.tsx` - Page layout with header, navigation, and content area
   - `TabContent.tsx` - Content area that changes based on active tab

4. Set up routing (without external router - use state-based navigation):
   - Active tab state management
   - URL hash updates for bookmarkable tabs
   - Navigation state persistence in localStorage

5. Create placeholder components for each tab:
   - `RecipeInput.tsx` - Recipe form placeholder
   - `RecipeList.tsx` - Recipe listing placeholder
   - `FavoritesList.tsx` - Favorites view placeholder

6. Styling with Tailwind CSS:
   - Responsive design (minimum 1024px width as specified)
   - Clean, modern UI following coffee-themed color palette
   - Active tab highlighting
   - Consistent spacing and typography
   - Basic button and card component styles

7. Application state management:
   - Use React Context for global state (active tab, loading states)
   - Local state for component-specific data
   - Basic error boundary for error handling

8. Development setup:
   - Hot module replacement configured
   - TypeScript strict mode enabled
   - ESLint configuration for code quality
   - Basic component organization structure

9. Header section with:
   - Application title "Coffee Brewing Recipe Tracker"
   - Basic branding/logo area
   - Navigation tabs with proper accessibility

10. Footer section with:
    - Export options placeholder
    - Basic app information
    - Version number display

Ensure the navigation works smoothly with proper visual feedback and the layout is ready for content components to be added in subsequent steps.
```

### Prompt 6: Recipe Input Form - Basic Structure

```
Create a comprehensive recipe input form for the coffee brewing recipe tracker with these specifications:

1. Build the main form component `RecipeInput.tsx` with four organized sections:
   - Bean Information
   - Brewing Parameters
   - Measurements
   - Sensation Record

2. Bean Information section with fields:
   - Origin (required, text input with country suggestions)
   - Processing Method (required, dropdown/select)
   - Altitude (optional, number input with "meters" label)
   - Roasting Date (optional, date input)
   - Roasting Level (optional, radio buttons: light, medium, dark, custom)

3. Brewing Parameters section with fields:
   - Water Temperature (optional, number input with "°C" label)
   - Brewing Method (optional, dropdown: pour-over, french-press, aeropress, cold-brew)
   - Grinder Model (required, text input)
   - Grinder Unit (required, text input)
   - Filtering Tools (optional, text input)
   - Turbulence (optional, text input)
   - Additional Notes (optional, textarea)

4. Measurements section with fields:
   - Coffee Beans (required, number input with "grams" label)
   - Water (required, number input with "grams" label)
   - Coffee-to-Water Ratio (read-only, auto-calculated display)
   - TDS (optional, number input with "%" label)
   - Extraction Yield (optional, number input with "%" label)

5. Sensation Record section with fields:
   - Overall Impression (required, 1-10 scale with slider/rating component)
   - Acidity, Body, Sweetness, Flavor, Aftertaste, Balance (all optional, 1-10 sliders)
   - Tasting Notes (optional, large textarea)

6. Form functionality:
   - Auto-generate recipe name with timestamp if not provided
   - Real-time coffee-to-water ratio calculation
   - Form state management with React hooks
   - Clear form functionality
   - Form data persistence in localStorage (auto-save draft)

7. Input components to create:
   - `NumberInput.tsx` - Reusable number input with validation
   - `TextInput.tsx` - Standard text input with label and error display
   - `Select.tsx` - Dropdown select component
   - `RatingSlider.tsx` - 1-10 scale rating component
   - `TextArea.tsx` - Multi-line text input

8. Form layout and styling:
   - Responsive grid layout within sections
   - Clear section dividers and headings
   - Proper field spacing and alignment
   - Required field indicators (*)
   - Save and Clear buttons at bottom

9. Form state management:
   - Single form state object matching RecipeInput type
   - Controlled components for all inputs
   - Handle nested object updates properly
   - Form dirty state tracking

10. Basic validation display:
    - Show required field indicators
    - Placeholder validation error display (to be implemented in next step)
    - Disable save button when form is invalid

Ensure the form is fully functional for data entry with proper TypeScript typing and follows the shared types from the previous step. Focus on user experience with logical field ordering and clear visual hierarchy.
```

### Prompt 7: Form Validation and Error Handling

```
Implement comprehensive form validation and error handling for the recipe input form:

1. Create validation hook `useRecipeValidation.ts`:
   - Use Zod schemas from shared package
   - Real-time field validation
   - Form-level validation for save operations
   - Return validation state and error messages

2. Real-time validation features:
   - Validate fields on blur and change events
   - Show inline error messages below each field
   - Visual indicators for invalid fields (red borders)
   - Clear errors when fields become valid

3. Field-specific validation rules:
   - Required fields: origin, processing_method, grinder_model, grinder_unit, coffee_beans, water, overall_impression
   - Number validation: coffee_beans, water, altitude, water_temperature, tds, extraction_yield
   - Range validation: all sensation record fields (1-10)
   - Date validation: roasting_date must not be in future
   - String length: recipe_name max 200 characters

4. Enhanced input components with validation:
   - Update `NumberInput.tsx` to show validation errors
   - Update `TextInput.tsx` with error styling
   - Update `RatingSlider.tsx` with proper bounds checking
   - Add error message display to all form components

5. Auto-calculation implementation:
   - Coffee-to-water ratio calculation (beans/water) with proper rounding
   - Update calculation in real-time when either field changes
   - Display ratio in common formats (1:15, 1:16, etc.)
   - Handle edge cases (division by zero, invalid inputs)

6. Form submission validation:
   - Comprehensive validation before save attempt
   - Collect all validation errors
   - Display summary of errors if save is attempted with invalid data
   - Focus on first invalid field for better UX

7. Error display components:
   - `ErrorMessage.tsx` - Individual field error display
   - `ValidationSummary.tsx` - List of all form errors
   - Toast notifications for save success/failure
   - Loading states during save operations

8. Form state enhancements:
   - Track validation state for each field
   - Form dirty state management
   - Unsaved changes warning
   - Auto-save draft to localStorage

9. User experience improvements:
   - Progressive validation (don't show errors until user interaction)
   - Clear validation feedback
   - Disable save button until form is valid
   - Success feedback when validation passes

10. Accessibility features:
    - Proper ARIA labels for screen readers
    - Error announcements for assistive technology
    - Keyboard navigation support
    - Focus management for validation errors

11. Edge case handling:
    - Empty form submission
    - Network connectivity issues
    - Invalid number inputs
    - Date parsing errors
    - Large text input handling

Create comprehensive validation that provides clear feedback while maintaining good user experience. Ensure all validation logic is reusable and properly typed.
```

### Prompt 8: Recipe Storage and Retrieval

```
Implement recipe storage and retrieval functionality connecting the form to the backend API:

1. Create API service layer in `frontend/src/services/`:
   - `api.ts` - Base API configuration and utilities
   - `recipeService.ts` - Recipe-specific API calls
   - `types.ts` - API response types

2. Recipe service functions:
   - `createRecipe(recipe: RecipeInput): Promise<Recipe>` - Save new recipe
   - `updateRecipe(id: string, recipe: RecipeInput): Promise<Recipe>` - Update existing
   - `getRecipe(id: string): Promise<Recipe>` - Fetch single recipe
   - `getAllRecipes(): Promise<Recipe[]>` - Fetch all recipes
   - `deleteRecipe(id: string): Promise<void>` - Delete recipe

3. API client configuration:
   - Base URL configuration from environment variables
   - Request/response interceptors
   - Error handling for network issues
   - Request timeout configuration
   - Retry logic for failed requests

4. Form integration with API:
   - Update `RecipeInput.tsx` to handle save operations
   - Loading states during save/update operations
   - Success/error feedback with toast notifications
   - Form reset after successful save
   - Navigate to recipe list after save

5. Error handling implementation:
   - Network error handling
   - Validation error display from server
   - Conflict resolution for concurrent edits
   - Offline detection and queuing

6. Loading and success states:
   - Create `LoadingSpinner.tsx` component
   - Create `Toast.tsx` notification component
   - Loading overlay for form during save
   - Success animation/feedback

7. Form mode handling:
   - Create/edit mode detection
   - Load existing recipe data for edit mode
   - URL parameter handling for edit mode
   - Form title updates based on mode

8. Local storage integration:
   - Save form drafts automatically
   - Restore drafts on page reload
   - Clear drafts after successful save
   - Handle draft conflicts with server data

9. Optimistic updates:
   - Update UI immediately on successful save
   - Revert changes if save fails
   - Show pending state for ongoing operations
   - Handle race conditions properly

10. Recipe state management:
    - Context provider for recipe data
    - Cache recently accessed recipes
    - Invalidate cache on updates
    - Global loading and error states

11. Form enhancement features:
    - Auto-save drafts every 30 seconds
    - Warn user before leaving with unsaved changes
    - Show last saved timestamp
    - Keyboard shortcuts for save (Ctrl+S)

12. Data transformation:
    - Convert form data to API format
    - Handle date/time formatting
    - Clean up empty optional fields
    - Generate UUIDs for new recipes

Ensure robust error handling and user feedback throughout the save/load process. Implement proper TypeScript typing for all API interactions and maintain consistency with the shared types.
```

### Prompt 9: Recipe Display and Listing

```
Create a comprehensive recipe display and listing system for viewing saved recipes:

1. Build main recipe list component `RecipeList.tsx`:
   - Grid layout of recipe cards
   - Responsive design (3-4 cards per row on desktop)
   - Loading state while fetching recipes
   - Empty state when no recipes exist
   - Pagination or infinite scroll for large datasets

2. Create `RecipeCard.tsx` component with:
   - Recipe name prominently displayed
   - Key information summary: origin, brewing method, overall impression
   - Date created/modified
   - Favorite status indicator (star icon)
   - Quick action buttons: Edit, Delete, Favorite toggle
   - Click to expand/view full details

3. Recipe detail modal/expanded view:
   - `RecipeDetail.tsx` component showing all recipe information
   - Organized sections matching the input form layout
   - Read-only display of all fields with proper formatting
   - Edit and Delete actions
   - Close/back navigation

4. Recipe card information display:
   - Recipe name (with auto-generated fallback)
   - Origin country with flag icon if possible
   - Brewing method badge/tag
   - Overall impression rating (stars or numeric)
   - Coffee-to-water ratio
   - Date created (relative time: "3 days ago")

5. Action buttons functionality:
   - Edit: Switch to edit mode with pre-populated form
   - Delete: Confirmation modal before deletion
   - Favorite: Toggle favorite status with visual feedback
   - Add to Collection: Quick collection assignment

6. List management features:
   - Select multiple recipes (checkboxes)
   - Bulk operations: delete, add to collection, favorite
   - Sort options: date created, name, overall impression
   - Sort direction toggle (ascending/descending)

7. State management for recipe list:
   - Fetch recipes on component mount
   - Update list after create/edit/delete operations
   - Optimistic updates for quick actions
   - Error handling for failed operations

8. Loading and error states:
   - Loading skeletons for recipe cards
   - Error message display with retry option
   - Empty state illustration and call-to-action
   - Individual card loading states for updates

9. Recipe formatting utilities:
   - Date formatting functions
   - Rating display (stars, numbers, bars)
   - Truncate long text fields appropriately
   - Format numbers with proper units

10. Interactive features:
    - Hover effects on cards
    - Smooth animations for actions
    - Keyboard navigation support
    - Focus management for accessibility

11. Performance optimizations:
    - Virtual scrolling for large lists
    - Image lazy loading if recipe photos added later
    - Debounced search/filter operations
    - Memoized components to prevent unnecessary re-renders

12. Context menu or dropdown for additional actions:
    - Duplicate recipe
    - Export individual recipe
    - Share recipe (for future features)
    - View brewing history (for future features)

13. Visual design elements:
    - Coffee-themed color scheme
    - Consistent card shadows and borders
    - Proper spacing and typography
    - Status indicators (favorite, new, recently modified)

Ensure the listing provides a great user experience for browsing and managing recipes with clear visual hierarchy and intuitive interactions.
```

### Prompt 10: Recipe Editing and Deletion

```
Implement recipe editing and deletion functionality with proper user experience and data integrity:

1. Edit mode implementation:
   - Add edit functionality to `RecipeInput.tsx`
   - Detect edit vs create mode via URL parameters or props
   - Pre-populate form with existing recipe data
   - Update form title and submit button text for edit mode

2. Recipe loading for edit:
   - Fetch recipe data by ID when entering edit mode
   - Handle loading states while fetching
   - Error handling if recipe not found
   - Form population with proper data transformation

3. Update API integration:
   - Modify form submission to use PUT for updates vs POST for creates
   - Handle update conflicts (recipe modified by another user)
   - Optimistic updates in the UI
   - Proper error handling for update failures

4. Edit navigation and routing:
   - URL structure for edit mode: `/recipes/:id/edit`
   - Navigation from recipe list to edit form
   - Breadcrumb navigation showing current action
   - Cancel edit functionality returning to previous view

5. Delete functionality implementation:
   - Delete button on recipe cards and detail views
   - Confirmation modal with recipe details
   - Permanent deletion warning
   - Soft delete option (for future recovery)

6. Delete confirmation modal `DeleteConfirmationModal.tsx`:
   - Recipe name and key details display
   - Clear warning about permanent deletion
   - Cancel and confirm actions
   - Loading state during deletion process
   - Success/error feedback

7. Bulk operations for multiple recipes:
   - Multi-select functionality on recipe list
   - Bulk delete with confirmation
   - Bulk edit for common fields (collections, favorites)
   - Progress indicator for bulk operations

8. Data integrity and safety:
   - Prevent deletion of recipes in collections (warn user)
   - Undo functionality for recent deletions
   - Backup creation before destructive operations
   - Validation of edit permissions

9. User experience enhancements:
   - Unsaved changes warning when leaving edit mode
   - Auto-save drafts during editing
   - Form dirty state indicators
   - Keyboard shortcuts (Ctrl+S to save, Escape to cancel)

10. Edit history and versioning:
    - Track modification timestamps
    - Show "last modified" information
    - Basic edit history (who changed what, when)
    - Revert to previous version capability

11. Error handling and recovery:
    - Handle network failures during save/delete
    - Retry mechanisms for failed operations
    - Local storage backup for edit sessions
    - Recovery from crashes or browser closures

12. Concurrent editing protection:
    - Lock recipes being edited by other users
    - Conflict resolution when multiple edits occur
    - Real-time update notifications
    - Merge conflict resolution interface

13. Performance considerations:
    - Debounced auto-save to prevent excessive API calls
    - Optimistic UI updates for better responsiveness
    - Cancel ongoing requests when navigating away
    - Efficient re-rendering on form updates

14. Accessibility and usability:
    - Clear visual indicators for edit vs view mode
    - Proper focus management in modals
    - Screen reader announcements for status changes
    - Keyboard navigation for all interactive elements

Ensure robust edit and delete operations that maintain data integrity while providing excellent user experience with clear feedback and error recovery options.
```

### Prompt 11: Basic Search Functionality

```
Implement comprehensive search functionality for finding recipes by various criteria:

1. Create search component `SearchBar.tsx`:
   - Text input with search icon
   - Real-time search with debouncing (300ms delay)
   - Clear search button (X icon)
   - Search placeholder text with helpful hints
   - Keyboard shortcuts (Ctrl+K to focus search)

2. Search implementation in recipe service:
   - Update `recipeService.ts` with search endpoints
   - Backend API integration for search queries
   - Support for partial text matching
   - Case-insensitive search functionality

3. Search scope and fields:
   - Recipe name (primary search)
   - Tasting notes (full-text search)
   - Origin/country name
   - Processing method
   - Additional notes field

4. Search results handling:
   - Filter existing recipe list based on search terms
   - Highlight matching text in search results
   - Show search result count
   - "No results found" state with suggestions

5. Search UI integration:
   - Add search bar to recipe list header
   - Search results replace normal recipe list
   - Maintain search state across tab navigation
   - URL parameters for bookmarkable searches

6. Advanced search features:
   - Search suggestions/autocomplete
   - Recent searches dropdown
   - Search history persistence
   - Popular searches display

7. Search result enhancements:
   - Highlight matching text in recipe cards
   - Rank results by relevance
   - Show which field contained the match
   - Snippet preview of matching content

8. Search state management:
   - Global search context for cross-tab functionality
   - Search query persistence in URL/localStorage
   - Loading states during search operations
   - Error handling for search failures

9. Performance optimizations:
   - Debounced search to prevent excessive API calls
   - Client-side caching of search results
   - Incremental search for better performance
   - Search result pagination for large result sets

10. Search analytics and feedback:
    - Track popular search terms
    - Search result click-through rates
    - "Did you mean?" suggestions for typos
    - No results feedback improvement

11. Search accessibility:
    - Proper ARIA labels for search controls
    - Keyboard navigation in search results
    - Screen reader announcements for result updates
    - Focus management during search operations

12. Search result display:
    - Maintain card layout for consistency
    - Add search relevance indicators
    - Show search term context in results
    - Quick filter options based on search results

13. Integration with filtering:
    - Combine search with existing filters
    - Search within filtered results
    - Clear search while maintaining filters
    - Advanced search form for complex queries

14. Mobile and responsive considerations:
    - Collapsible search on mobile
    - Touch-friendly search controls
    - Responsive search result layout
    - Voice search capability (future feature)

Ensure search provides fast, relevant results with excellent user experience and proper error handling throughout the search process.
```

### Prompt 12: Advanced Filtering System

```
Create a comprehensive filtering system that allows users to find recipes using multiple criteria:

1. Build main filter component `FilterPanel.tsx`:
   - Collapsible/expandable filter panel
   - Filter sections organized by category
   - Apply/Reset filter buttons
   - Active filter count indicator
   - Save filter combinations for future use

2. Individual filter components:
   - `OriginFilter.tsx` - Dropdown with country autocomplete
   - `BrewingMethodFilter.tsx` - Multi-select checkboxes
   - `RoastingLevelFilter.tsx` - Multi-select checkboxes  
   - `RatingRangeFilter.tsx` - Dual-handle slider (min/max overall impression)
   - `DateRangeFilter.tsx` - Date range picker for creation/modification dates

3. Filter categories and options:
   - **Origin**: Dropdown populated with unique countries from recipes
   - **Roasting Level**: light, medium, dark, custom (multi-select)
   - **Brewing Method**: pour-over, french-press, aeropress, cold-brew (multi-select)
   - **Overall Impression**: Range slider (1-10) with min/max values
   - **Date Range**: Created between specific dates
   - **Favorites**: Show only favorites toggle
   - **Collections**: Filter by specific collections

4. Filter state management:
   - `useFilters.ts` hook for filter state
   - Combine multiple filters with AND logic
   - Filter persistence in URL parameters
   - Reset individual filters or all filters

5. Backend filter integration:
   - Update recipe API to accept filter parameters
   - Efficient database queries with proper indexing
   - Handle complex filter combinations
   - Return filtered result counts

6. Filter UI/UX features:
   - Real-time result count updates as filters change
   - Visual indicators for active filters
   - Quick filter pills showing applied filters
   - One-click filter removal from pills

7. Advanced filter combinations:
   - Multiple origin selection
   - Rating ranges (e.g., 7-9 overall impression)
   - Date ranges with preset options (last week, month, year)
   - Exclude certain values (negative filtering)

8. Filter result display:
   - Show number of matching recipes
   - "Clear all filters" option
   - Export filtered results functionality
   - Save current filter set as preset

9. Filter presets and saved searches:
   - Save commonly used filter combinations
   - Quick access to saved filters
   - Share filter URLs with others
   - Default filters for new users

10. Performance optimizations:
    - Debounced filter application
    - Client-side filtering for small datasets
    - Incremental loading for large filtered sets
    - Cache filter results for better performance

11. Filter accessibility:
    - Keyboard navigation through filter options
    - Screen reader support for filter changes
    - Clear focus indicators
    - Proper labeling for all filter controls

12. Mobile filter experience:
    - Collapsible filter drawer on mobile
    - Touch-friendly filter controls
    - Sticky filter apply button
    - Simplified filter interface for small screens

13. Filter analytics:
    - Track most used filters
    - Popular filter combinations
    - Filter abandonment rates
    - Zero-result filter tracking

14. Integration with search:
    - Combine text search with filters
    - Search within filtered results
    - Filter suggestions based on search terms
    - Clear separation of search vs filter

15. Visual filter feedback:
    - Active filter highlighting
    - Filter result preview
    - Loading states during filter operations
    - Empty state when no results match filters

Ensure the filtering system is intuitive, performant, and provides clear feedback about applied filters and their results.
```

### Prompt 13: Favorites System

```
Implement a comprehensive favorites system for marking and managing preferred recipes:

1. Create favorites functionality in recipes:
   - Add favorite toggle button to recipe cards
   - Heart icon with filled/unfilled states
   - Optimistic UI updates for immediate feedback
   - Batch favorite operations for multiple recipes

2. Favorites toggle implementation:
   - `FavoriteButton.tsx` component with hover effects
   - API integration for updating favorite status
   - Loading states during favorite operations
   - Error handling with rollback on failure

3. Favorites tab implementation:
   - `FavoritesList.tsx` component showing only favorited recipes
   - Same card layout as main recipe list
   - Empty state when no favorites exist
   - Quick unfavorite action from favorites view

4. Database and API updates:
   - Update recipe schema to include `is_favorite` boolean
   - API endpoints for toggling favorite status
   - Bulk favorite operations endpoint
   - Proper indexing for favorite queries

5. Favorites statistics and insights:
   - Count of total favorites
   - Favorite recipes by category (origin, brewing method)
   - Most favorited recipe types
   - Trending favorites over time

6. Favorites organization:
   - Sort favorites by date favorited, rating, or name
   - Group favorites by categories
   - Search within favorites only
   - Filter favorites by other criteria

7. Favorites import/export:
   - Export favorites list separately
   - Backup and restore favorites
   - Share favorite recipes with others
   - Import favorites from other users

8. User experience enhancements:
   - Visual distinction for favorite recipes in all views
   - Quick access to favorites from main navigation
   - Favorite count in tab title
   - Recently favorited section

9. Favorites management:
   - Bulk unfavorite operations
   - Favorite all recipes from a search result
   - Undo recent favorite/unfavorite actions
   - Favorite recipe recommendations based on preferences

10. Performance optimizations:
    - Cache favorite status for quick display
    - Optimistic updates with server sync
    - Batch API calls for multiple favorite changes
    - Efficient database queries for favorites

11. Favorites accessibility:
    - Clear indication of favorite status for screen readers
    - Keyboard shortcuts for favoriting (F key)
    - Proper ARIA labels for favorite buttons
    - Focus management in favorites list

12. Integration with collections:
    - Auto-collection for all favorites
    - Move favorites to specific collections
    - Smart collections based on favorite patterns
    - Prevent unfavoriting recipes in certain collections

13. Favorites analytics:
    - Track favorite rates across recipes
    - Popular characteristics of favorited recipes
    - User favorite patterns and preferences
    - A/B testing for favorite button placement

14. Visual design for favorites:
    - Consistent heart icon across the application
    - Favorite badge on recipe cards
    - Color coding for favorite recipes
    - Smooth animations for favorite toggle

15. Mobile favorites experience:
    - Touch-friendly favorite buttons
    - Swipe to favorite gesture
    - Favorites quick access in mobile navigation
    - Simplified favorites management on small screens

Ensure the favorites system is intuitive and provides quick access to users' preferred recipes with proper visual feedback and error handling.
```

### Prompt 14: Collections Management

```
Implement a comprehensive collections system for organizing recipes into custom groups:

1. Create collections data model and API:
   - `collections` table with id, name, description, created_date
   - `recipe_collections` junction table for many-to-many relationships
   - API endpoints for CRUD operations on collections
   - Endpoint for adding/removing recipes from collections

2. Collections management UI:
   - `CollectionsManager.tsx` component for creating/editing collections
   - `CollectionCard.tsx` for displaying collection information
   - Collection list with recipe count and preview
   - Create/Edit/Delete collection functionality

3. Collection creation and editing:
   - `CreateCollectionModal.tsx` with name and description fields
   - Validation for collection names (unique, length limits)
   - Color/icon selection for visual distinction
   - Preview of recipes that will be included

4. Add recipes to collections:
   - "Add to Collection" button on recipe cards
   - Multi-select dropdown showing available collections
   - Bulk add multiple recipes to collections
   - Quick collection creation from recipe view

5. Collections display and navigation:
   - Collections tab in main navigation
   - Grid layout of collection cards
   - Recipe count and sample recipe preview in cards
   - Click to view recipes in collection

6. Collection recipe view:
   - `CollectionRecipes.tsx` showing recipes within a collection
   - Same recipe card layout with collection-specific actions
   - Remove from collection functionality
   - Collection breadcrumb navigation

7. Smart collections (auto-populated):
   - "Recently Added" collection
   - "High Rated" collection (8+ overall impression)
   - "Favorites" collection (sync with favorites)
   - Collections by origin country or brewing method

8. Collection management features:
   - Rename/edit collection details
   - Delete collection (with confirmation)
   - Duplicate collection functionality
   - Merge collections together

9. Collection sharing and export:
   - Export entire collection to CSV/Excel
   - Share collection URL with others
   - Import collections from other users
   - Public/private collection settings

10. Collection organization:
    - Sort collections by name, date created, recipe count
    - Search within collections
    - Filter collections by type (manual vs auto)
    - Collection tags/categories

11. Recipe multi-collection support:
    - Recipe can belong to multiple collections
    - Show all collections for a recipe
    - Quick jump between collections containing same recipe
    - Collection intersection views

12. Collections statistics:
    - Most popular collections
    - Average recipes per collection
    - Collection usage analytics
    - Recipe overlap between collections

13. Collections UI/UX:
    - Drag-and-drop recipe organization
    - Visual collection themes/colors
    - Collection cover images from recipes
    - Empty collection state with helpful guidance

14. Performance considerations:
    - Lazy load collection contents
    - Cache collection membership data
    - Efficient queries for collection operations
    - Pagination for large collections

15. Collections accessibility:
    - Keyboard navigation in collection management
    - Screen reader support for collection actions
    - Proper focus management in modals
    - Clear labeling for collection controls

16. Mobile collections experience:
    - Touch-friendly collection management
    - Swipe actions for adding/removing recipes
    - Simplified collection creation flow
    - Responsive collection grid layout

Ensure collections provide powerful organization capabilities while maintaining simplicity and clear user experience throughout the management process.
```

### Prompt 15: Export Functionality

```
Implement comprehensive data export functionality supporting multiple formats and export options:

1. Create export service layer:
   - `exportService.ts` for handling export operations
   - Support for CSV and Excel (.xlsx) formats
   - Export API endpoints in backend
   - File generation and download handling

2. Export options and UI:
   - `ExportModal.tsx` for export configuration
   - Export format selection (CSV/Excel)
   - Export scope options: All recipes, Filtered results, Selected recipes
   - Export customization: field selection, date ranges

3. CSV export implementation:
   - Flatten nested recipe data structure
   - Proper CSV escaping and formatting
   - Configurable column headers
   - Handle special characters and newlines in data

4. Excel export features:
   - Multiple worksheets (recipes, collections, summary)
   - Proper cell formatting (dates, numbers, text)
   - Column auto-sizing and styling
   - Header row formatting with bold/colors

5. Export data structure:
   - Map nested JSON to flat column structure
   - Column mapping as specified in requirements
   - Handle optional fields gracefully
   - Consistent date and number formatting

6. Backend export implementation:
   - Server-side file generation for better performance
   - Streaming for large datasets
   - Temporary file cleanup
   - Memory-efficient processing

7. Export customization options:
   - Select specific fields to include/exclude
   - Custom date range filtering
   - Sort options for exported data
   - Include/exclude collections and favorites data

8. Export UI integration:
   - Export buttons in footer and recipe list
   - Progress indicators for large exports
   - Download notification and status
   - Export history and recent downloads

9. Filtered export functionality:
   - Export currently filtered recipe set
   - Maintain filter context during export
   - Export selected recipes from multi-select
   - Preview export data before download

10. Large dataset handling:
    - Streaming export for thousands of recipes
    - Progress bars for long-running exports
    - Background processing for large files
    - Cancel export operation capability

11. Export file naming:
    - Timestamp-based filenames
    - Custom filename options
    - Include filter criteria in filename
    - Prevent filename conflicts

12. Error handling and validation:
    - Handle export failures gracefully
    - Validate data before export
    - Network error recovery
    - File size limit warnings

13. Export analytics:
    - Track most exported data types
    - Export format preferences
    - File size statistics
    - Export failure rates

14. Performance optimizations:
    - Cache export data for repeat downloads
    - Compress large export files
    - Parallel processing for multi-format exports
    - Client-side export for small datasets

15. Export accessibility:
    - Keyboard shortcuts for export (Ctrl+E)
    - Screen reader announcements for export status
    - Clear progress indicators
    - Accessible export configuration options

16. Mobile export experience:
    - Touch-friendly export controls
    - Simplified export options on mobile
    - Native file sharing integration
    - Mobile-optimized file downloads

17. Advanced export features:
    - Scheduled/automated exports
    - Email export delivery
    - Export templates and presets
    - Batch export multiple collections

Ensure robust export functionality that handles various data sizes and formats while providing clear user feedback throughout the export process.
```

### Prompt 16: Final Testing and Polish

```
Implement comprehensive testing, performance optimizations, and final UI/UX polish for production readiness:

1. Comprehensive test suite setup:
   - Frontend unit tests for all components using Jest + React Testing Library
   - Backend API tests using Supertest
   - Integration tests for complete user workflows
   - End-to-end tests for critical user journeys

2. Frontend component testing:
   - Test all form validation scenarios
   - Recipe CRUD operation tests
   - Search and filter functionality tests
   - Export functionality tests
   - Error boundary and error handling tests

3. Backend API testing:
   - Test all endpoints with valid/invalid data
   - Database integration tests
   - Authentication and authorization tests (for future)
   - Performance tests for large datasets
   - Error handling and edge case tests

4. User workflow testing:
   - Complete recipe creation workflow
   - Edit and delete operations
   - Search and filtering combinations
   - Collections management workflow
   - Export functionality end-to-end

5. Performance optimizations:
   - Code splitting for faster initial load
   - Lazy loading of non-critical components
   - Image optimization and lazy loading
   - Database query optimization
   - Bundle size analysis and reduction

6. UI/UX improvements:
   - Consistent spacing and typography throughout
   - Smooth animations and transitions
   - Loading states for all async operations
   - Error states with helpful messages
   - Empty states with clear calls-to-action

7. Accessibility audit and improvements:
   - WCAG 2.1 compliance checking
   - Keyboard navigation testing
   - Screen reader compatibility
   - Color contrast validation
   - Focus management improvements

8. Cross-browser testing:
   - Chrome, Firefox, Safari, Edge compatibility
   - Mobile browser testing
   - Feature degradation for older browsers
   - Polyfills for missing features

9. Error handling improvements:
   - Global error boundary implementation
   - User-friendly error messages
   - Error reporting and logging
   - Graceful degradation for failures
   - Retry mechanisms for recoverable errors

10. Performance monitoring:
    - Core Web Vitals optimization
    - Bundle size monitoring
    - API response time tracking
    - Database query performance
    - Memory leak detection and fixes

11. Security audit:
    - Input sanitization verification
    - XSS protection testing
    - CSRF protection implementation
    - Data validation on all inputs
    - Security headers configuration

12. Documentation completion:
    - User guide and help documentation
    - API documentation with examples
    - Developer setup instructions
    - Deployment guide
    - Troubleshooting guide

13. Final UI polish:
    - Consistent icon usage throughout
    - Professional color scheme refinement
    - Responsive design validation
    - Print styles for recipe pages
    - Favicon and app icons

14. Data validation and cleanup:
    - Validate all existing data integrity
    - Clean up test data
    - Optimize database indexes
    - Set up data backup procedures
    - Migration scripts for schema updates

15. Deployment preparation:
    - Production build optimization
    - Environment variable configuration
    - SSL certificate setup
    - Database backup procedures
    - Monitoring and logging setup

16. User acceptance testing:
    - Real user testing scenarios
    - Feedback collection and implementation
    - Usability testing with coffee enthusiasts
    - Performance testing on various devices
    - Bug fixes based on user feedback

Create a production-ready application with comprehensive testing, excellent performance, and polished user experience that meets all specification requirements.
```

## Implementation Summary

This blueprint provides a complete roadmap for building the Coffee Brewing Recipe Tracker in 16 incremental steps. Each step builds upon previous work while maintaining focus on specific functionality. The approach emphasizes:

- **Test-driven development** with comprehensive testing at each stage
- **Incremental progress** with working functionality after each step
- **Best practices** in code organization and architecture
- **User experience** focus throughout development
- **Performance** considerations from the beginning
- **Accessibility** built-in rather than added later

Each prompt is designed to be self-contained while building on previous work, ensuring no orphaned code and maintaining project coherence throughout development.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"id": "1", "content": "Analyze specification and create high-level project blueprint", "status": "completed", "priority": "high"}, {"id": "2", "content": "Break down blueprint into iterative development chunks", "status": "completed", "priority": "high"}, {"id": "3", "content": "Refine chunks into properly-sized development steps", "status": "completed", "priority": "high"}, {"id": "4", "content": "Create individual LLM prompts for each development step", "status": "completed", "priority": "high"}, {"id": "5", "content": "Review and finalize blueprint document", "status": "completed", "priority": "medium"}]