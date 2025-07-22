# CLAUDE.md - Coffee Brewing Recipe Tracker

## Project Overview
A comprehensive web application for coffee enthusiasts to record, track, and manage their brewing recipes and outcomes. Built with React + TypeScript frontend, Node.js + Express backend, and SQLite database.

## Project Status
- **Current Phase**: Step 15 (Export Functionality) - ✅ COMPLETED
- **Next Phase**: Step 16 (remaining features)
- **Completion**: Steps 1-15 fully implemented and functional

## Architecture Overview

### Frontend (`/frontend/`)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)
- **Build Tool**: Vite with hot reload
- **Package Manager**: npm

### Backend (`/backend/`)
- **Framework**: Node.js + Express + TypeScript  
- **Database**: SQLite with custom ORM models
- **API**: RESTful endpoints with validation middleware
- **Build**: TypeScript compilation to `/dist/`

### Shared (`/shared/`)
- **Purpose**: Shared TypeScript interfaces and utilities
- **Exports**: Types, validation schemas, constants
- **Usage**: Imported by both frontend and backend

## Development Servers

### Frontend Development
```bash
cd frontend
npm run dev        # Starts Vite dev server on http://localhost:3000
```

### Backend Development  
```bash
cd backend
npm run dev        # Starts nodemon server on http://localhost:3001
```

### Build Commands
```bash
# Frontend build
cd frontend && npm run build

# Backend build  
cd backend && npm run build

# Full project build
npm run build      # (from root, if script exists)
```

## Key Features Implemented

### ✅ Core Recipe Management (Steps 1-12)
- **Recipe Input**: 5-section form (bean info, brewing parameters, measurements, tasting notes)
- **Recipe List**: Grid/card view with search, filtering, sorting
- **Recipe Detail**: Full recipe view with edit/delete capabilities
- **Advanced Search**: Real-time search across all recipe fields
- **Advanced Filtering**: 8 filter types (origin, method, rating, dates, etc.)
- **Favorites System**: Star/unstar recipes with dedicated favorites view
- **Data Validation**: Comprehensive validation with error handling

### ✅ Collection Management (Step 14)
- **Collections CRUD**: Create, edit, delete, and manage recipe collections
- **Visual Organization**: Color themes and tags for collections
- **Collection Assignment**: Add/remove recipes to/from multiple collections
- **Collection Statistics**: Recipe counts, average ratings, activity tracking
- **Privacy Controls**: Public/private collection settings

### ✅ Export System (Step 15)
- **Multiple Formats**: CSV, Excel (.xlsx), JSON, PDF, Print
- **Excel Features**: Multi-sheet workbooks with statistics and collection data
- **Server-side Export**: API endpoints for large dataset exports
- **Filtered Exports**: Export current search/filter results
- **Progress Tracking**: Real-time export progress indicators

## Database Schema

### Tables
- **recipes**: Main recipe data with all brewing information
- **collections**: Recipe organization with metadata
- **recipe_collections**: Many-to-many relationship table

### Key Fields
```sql
-- recipes table
recipe_id (UUID), recipe_name, date_created, date_modified, is_favorite,
origin, processing_method, altitude, roasting_date, roasting_level,
water_temperature, brewing_method, grinder_model, grinder_unit,
coffee_beans, water, coffee_water_ratio, tds, extraction_yield,
overall_impression, acidity, body, sweetness, flavor, aftertaste, balance, tasting_notes

-- collections table  
collection_id (UUID), name, description, color, is_private, is_default,
tags (JSON), date_created, date_modified
```

## API Endpoints

### Recipes (`/api/recipes`)
- `GET /` - Get all recipes
- `GET /:id` - Get recipe by ID  
- `POST /` - Create new recipe
- `PUT /:id` - Update recipe
- `DELETE /:id` - Delete recipe
- `PUT /:id/favorite` - Toggle favorite status
- `GET /export/csv` - Export all recipes as CSV
- `POST /export/filtered` - Export filtered recipes

### Collections (`/api/collections`)
- `GET /` - Get all collections
- `GET /:id` - Get collection by ID
- `POST /` - Create new collection  
- `PUT /:id` - Update collection
- `DELETE /:id` - Delete collection
- `POST /:id/recipes/:recipeId` - Add recipe to collection
- `DELETE /:id/recipes/:recipeId` - Remove recipe from collection

## Component Architecture

### Main Components
- **App.tsx**: Root component with tab navigation
- **Navigation.tsx**: 4-tab interface (Input, Recipes, Collections, Favorites)
- **TabContent.tsx**: Tab content router
- **RecipeInput.tsx**: Comprehensive recipe form
- **RecipeList.tsx**: Recipe grid with search/filter
- **RecipeDetail.tsx**: Full recipe view modal
- **CollectionsList.tsx**: Collection management interface
- **ExportModal.tsx**: Export configuration and progress

### Shared Components (`/components/ui/`)
- **LoadingSpinner**: Reusable loading indicator
- **Toast**: Notification system
- **Modal components**: Various modal dialogs

### Form Components (`/components/forms/`)
- **TextInput, NumberInput, Select, TextArea**: Validated form inputs
- **RatingSlider**: 1-10 rating input
- **ValidationSummary**: Error display

## Services Architecture

### Frontend Services (`/src/services/`)
- **recipeService.ts**: Recipe CRUD operations with error handling
- **collectionService.ts**: Collection management operations
- **exportService.ts**: Comprehensive export functionality
- **api.ts**: Base API client with retry logic and timeout handling

### Key Service Features
- **Error Handling**: Comprehensive error handling with user feedback
- **Loading States**: Progress tracking for long operations
- **Retry Logic**: Automatic retry for failed requests
- **Type Safety**: Full TypeScript integration

## State Management

### React Hooks Used
- **useState**: Component-level state
- **useEffect**: Side effects and lifecycle
- **useCallback**: Memoized functions
- **Custom Hooks**: useSearch, useFilters, useFormDirtyState, useKeyboardShortcuts

### Local Storage
- **Filters**: Persist user filter preferences
- **Active Tab**: Remember last active tab
- **Form State**: Unsaved changes detection

## Testing & Quality

### Available Scripts
```bash
# Frontend
npm run lint       # ESLint code quality
npm run test       # Jest unit tests
npm run test:watch # Jest watch mode

# Backend  
npm run lint       # ESLint + TypeScript checks
npm run test       # Jest API tests
```

### Code Quality Tools
- **ESLint**: Code linting and formatting
- **TypeScript**: Type safety across entire stack
- **Prettier**: Code formatting (if configured)

## Development Workflow

### Adding New Features
1. **Types First**: Define interfaces in `/shared/src/types/`
2. **Backend**: Add API endpoints and database models
3. **Frontend Service**: Create service methods for API calls
4. **Components**: Build UI components with TypeScript
5. **Integration**: Connect components to services
6. **Testing**: Test functionality and edge cases

### Database Changes
1. Update schema in `/backend/src/database/schema.ts`
2. Update models in `/backend/src/database/models/`
3. Run database migration if needed
4. Update TypeScript interfaces in `/shared/`

## Environment Configuration

### Frontend Environment Variables
```env
VITE_API_URL=http://localhost:3001  # Backend API URL
```

### Backend Environment Variables
```env
PORT=3001                           # Server port
DATABASE_PATH=../data/recipes.db    # SQLite database path
NODE_ENV=development                # Environment mode
```

## Deployment Notes

### Frontend Deployment
- Build: `npm run build` creates `/dist/` folder
- Static files: Can be served by any static host
- API URL: Configure `VITE_API_URL` for production

### Backend Deployment  
- Build: `npm run build` creates `/dist/` folder
- Database: Ensure SQLite file is writable
- CORS: Configure for production frontend URL

## Common Development Tasks

### Adding a New Recipe Field
1. Update `Recipe` interface in `/shared/src/types/recipe.ts`
2. Update database schema in `/backend/src/database/schema.ts`
3. Update `RecipeModel` in `/backend/src/database/models/Recipe.ts`
4. Update `RecipeInput.tsx` form component
5. Update export services to include new field

### Adding a New API Endpoint
1. Add route in `/backend/src/routes/`
2. Add validation schema in `/shared/src/validation/`
3. Add service method in `/frontend/src/services/`
4. Add component integration

## Troubleshooting

### Common Issues
- **Port conflicts**: Backend (3001) or Frontend (3000) ports in use
- **Database errors**: Check SQLite file permissions
- **CORS errors**: Verify backend CORS configuration
- **Type errors**: Ensure shared types are up to date

### Debug Commands
```bash
# Check running processes
lsof -i :3000  # Frontend port
lsof -i :3001  # Backend port

# Database inspection
sqlite3 data/recipes.db ".tables"
sqlite3 data/recipes.db ".schema recipes"
```

## Project Goals & Vision

### Completed Phases
- ✅ **Phase 1**: Core recipe management system
- ✅ **Phase 2**: Advanced search and filtering  
- ✅ **Phase 3**: Collection organization system
- ✅ **Phase 4**: Comprehensive export functionality

### Future Enhancements (Post Step 16)
- **User Authentication**: Multi-user support
- **Recipe Sharing**: Public recipe sharing
- **Mobile App**: React Native companion app
- **Analytics**: Advanced recipe analytics and insights
- **AI Features**: Recipe recommendations and analysis

## Technical Decisions & Rationale

### Why SQLite?
- **Simplicity**: Easy setup and deployment
- **Performance**: Fast for single-user applications  
- **Portability**: Single file database
- **No Dependencies**: No external database server needed

### Why Monorepo Structure?
- **Code Sharing**: Shared types and utilities
- **Development Efficiency**: Single repository for full-stack
- **Type Safety**: End-to-end TypeScript integration
- **Deployment Simplicity**: Related components together

### Why Custom ORM vs Prisma/TypeORM?
- **Learning**: Educational value of custom implementation
- **Control**: Full control over database operations
- **Simplicity**: Minimal dependencies and complexity
- **Performance**: Optimized for specific use cases

---

**Last Updated**: 2025-01-22  
**Maintained By**: AI Assistant (Claude)  
**Project Phase**: Steps 1-15 Complete, Ready for Step 16