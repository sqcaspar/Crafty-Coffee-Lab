# CLAUDE.md - Coffee Brewing Recipe Tracker

## Project Overview
A comprehensive web application for coffee enthusiasts to record, track, and manage their brewing recipes and outcomes. Built with React + TypeScript frontend, Node.js + Express backend, and SQLite database.

## Project Status
- **Current Phase**: Production Deployment - ✅ LIVE
- **Production Status**: Successfully deployed and operational
- **Frontend**: Deployed to Vercel with auto-deployment from GitHub
- **Backend**: Deployed to Railway
- **Database**: Hosted on Railway (SQLite)
- **Completion**: All 16 development steps implemented and live
- **Version Control**: Git repository with GitHub integration for auto-deployment
- **Task Tracking**: TODO.md file for managing ongoing improvements and features

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

### ✅ UX Enhancements & Final Polish (Step 16)
- **Dark Mode Toggle**: Complete theme system with persistent preferences
- **Recipe Comparison**: Side-by-side comparison of multiple recipes
- **Recipe Cloning**: Duplicate recipes with customizable modifications
- **Recipe Sharing**: Generate shareable links and export capabilities
- **Analytics Dashboard**: Recipe statistics, trends, and insights
- **Recipe Suggestions**: AI-powered recommendations based on preferences
- **Backup & Restore**: Complete data backup with JSON export/import
- **Keyboard Shortcuts**: Comprehensive shortcuts for power users
- **Advanced Search**: Enhanced filtering and search capabilities

## Git Version Control

### Current Setup
- **Repository Type**: Local Git repository only  
- **Location**: `/Users/hoyinng/claude project/.git/`
- **Branch**: main
- **Status**: All changes tracked and committed
- **History**: Complete development history with meaningful commit messages

### Key Git Commands for Version Control

#### Viewing Version History
```bash
git log --oneline                    # Brief commit history
git log --graph --oneline           # Visual branch history  
git log -p                          # Detailed changes per commit
git log --stat                      # Files changed per commit
git show [commit-hash]              # View specific commit details
git log --since="2 weeks ago"       # Recent commits
```

#### Version Recovery & Navigation
```bash
git checkout [commit-hash]          # View specific version (detached HEAD)
git checkout main                   # Return to latest version
git reset --hard [commit-hash]      # Revert to specific version (CAUTION: loses changes)
git revert [commit-hash]            # Undo specific commit safely (creates new commit)
git reflog                          # View all Git actions (recovery tool)
```

#### Branch Management for Safe Development
```bash
git branch [branch-name]            # Create new branch
git checkout [branch-name]          # Switch to branch  
git checkout -b [branch-name]       # Create and switch to new branch
git merge [branch-name]             # Merge branch to current
git branch -d [branch-name]         # Delete merged branch
git branch -a                       # List all branches
```

#### File-Specific Operations
```bash
git checkout [commit-hash] -- [file-path]     # Restore specific file version
git diff [commit1] [commit2] [file-path]      # Compare file versions
git blame [file-path]                         # See who changed what in file
git log --follow [file-path]                  # Track file history through renames
git diff HEAD~1 [file-path]                   # Compare file with previous version
```

#### Daily Git Workflow Commands
```bash
git status                          # Check current repository status
git add .                          # Stage all changes
git add [file-path]                # Stage specific file
git commit -m "message"            # Commit with message
git diff                           # See unstaged changes
git diff --staged                  # See staged changes
git stash                          # Temporarily save changes
git stash pop                      # Restore stashed changes
```

### Version Control Best Practices

1. **Commit Frequently**: Make small, focused commits with clear messages
2. **Use Branches**: Create feature branches for experimental work
3. **Meaningful Messages**: Explain what and why, not just what
4. **Review Before Commit**: Use `git diff` to review changes
5. **Keep Main Clean**: Only merge tested, working code to main branch

### Example Commit Message Format
```
Brief summary of changes (50 chars or less)

More detailed explanatory text if needed. Explain what and why,
not how. Include any breaking changes or special considerations.

- Feature: Add new functionality
- Fix: Resolve specific issue  
- Update: Improve existing feature
- Refactor: Code cleanup without functional changes
```

### Where to Find Version Information

1. **Command Line Interface**:
   - Use `git log` commands listed above
   - Most comprehensive and always available

2. **File System Location**:
   - **Repository Data**: `.git/` folder contains all version history
   - **Never delete** `.git/` folder - contains entire project history
   - **Backup Important**: This folder IS your version control

3. **Visual Git Tools** (Optional):
   - **VS Code**: Built-in Git integration and timeline view
   - **SourceTree**: Free visual Git client by Atlassian
   - **GitKraken**: Popular Git GUI with visual commit history
   - **GitHub Desktop**: Simple, user-friendly Git interface

4. **Built-in Git Viewer**:
   ```bash
   gitk                            # Built-in Git repository browser
   git log --graph --all --oneline # Terminal-based visual history
   ```

### Git Troubleshooting

#### Common Issues & Solutions
```bash
# Check current status and recent history
git status                          # What's happening now
git log --oneline -10              # Recent 10 commits

# Undo changes (various scenarios)
git restore [file-path]            # Discard unstaged changes to file
git restore --staged [file-path]   # Unstage file
git reset --soft HEAD~1            # Undo last commit, keep changes
git reset --hard HEAD~1            # Undo last commit, lose changes (CAUTION)

# Recovery commands
git reflog                         # See all Git actions (great for recovery)
git fsck --lost-found             # Find lost commits
git checkout [commit-hash]         # Go to specific version temporarily

# File history and changes
git diff [filename]                # See changes in specific file
git log --follow [filename]        # Track file through renames
git show HEAD:[filename]           # Show file content from last commit
```

#### Emergency Recovery
If something goes wrong:
1. **Don't panic** - Git rarely loses data permanently
2. **Use `git reflog`** to see all recent actions
3. **Use `git fsck --lost-found`** to find orphaned commits
4. **Check `.git/` folder exists** - if yes, history is intact
5. **Create backup** before attempting major recovery operations

### Local Backup Strategy

Since we're keeping version control local-only:

1. **Regular Backups**: Copy entire project folder (including `.git/`) to external drive
2. **Archive Versions**: Create ZIP archives of major milestones
3. **Multiple Locations**: Keep copies in different physical locations
4. **Cloud Backup**: Consider backing up entire folder to cloud storage (Dropbox, Google Drive)

### Repository Statistics

```bash
# View repository information
git log --oneline | wc -l           # Count total commits
git shortlog -sn                    # Commits by author
git log --since="1 month ago" --oneline | wc -l  # Recent activity
du -sh .git                         # Repository size
```

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

### Task Management with TODO.md
The project uses `TODO.md` for tracking all tasks, instructions, and progress across Claude Code sessions.

#### For Claude Code Sessions:
1. **Always read `TODO.md` first** to understand current project state and pending tasks
2. **Update TODO.md** when receiving new instructions from the user:
   - Add new tasks to "Pending Tasks" section with appropriate priority (High/Medium/Low)
   - Move tasks to "Active Tasks" when starting work
   - Move completed tasks to "Completed Tasks" with timestamp and description
3. **Use TodoWrite tool** during sessions for immediate task tracking
4. **Commit TODO.md changes** along with code changes to maintain history

#### Task Lifecycle Management:
```
User Instruction → TODO.md (Pending) → TodoWrite (Active) → TODO.md (Completed)
```

#### Task Priority Guidelines:
- **High Priority**: Critical bugs, security issues, production problems, urgent user requests
- **Medium Priority**: Feature enhancements, performance improvements, non-critical bugs
- **Low Priority**: Nice-to-have features, documentation updates, minor improvements

#### TODO.md Structure:
- **Active Tasks**: Currently being worked on (use TodoWrite tool)
- **Pending Tasks**: Not yet started, organized by priority
- **Completed Tasks**: Finished work with timestamps and descriptions
- **Task Categories**: Features, Bugs, Improvements, Mobile, Security, Performance, etc.

#### Integration with Development:
- **Before starting work**: Check TODO.md for context and pending tasks
- **During development**: Use TodoWrite tool for real-time progress tracking
- **After completing work**: Update TODO.md with completed tasks and any new tasks discovered
- **When pushing to production**: Update production status in TODO.md

### Adding New Features (with Git Integration)
1. **Create Feature Branch**: `git checkout -b feature/new-feature`
2. **Types First**: Define interfaces in `/shared/src/types/`
3. **Backend**: Add API endpoints and database models
4. **Frontend Service**: Create service methods for API calls
5. **Components**: Build UI components with TypeScript
6. **Integration**: Connect components to services
7. **Testing**: Test functionality and edge cases
8. **Commit Changes**: `git add .` and `git commit -m "Add new feature"`
9. **Merge to Main**: `git checkout main` and `git merge feature/new-feature`
10. **Cleanup**: `git branch -d feature/new-feature`

### Database Changes (with Version Control)
1. **Create Branch**: `git checkout -b database/schema-update`
2. Update schema in `/backend/src/database/schema.ts`
3. Update models in `/backend/src/database/models/`
4. Run database migration if needed
5. Update TypeScript interfaces in `/shared/`
6. **Test Changes**: Ensure backward compatibility
7. **Commit**: `git add .` and `git commit -m "Update database schema"`
8. **Merge**: Return to main and merge changes

### Safe Development Practices
- **Always create branches** for new features or experiments
- **Commit frequently** with descriptive messages
- **Test before merging** to main branch
- **Use `git stash`** to temporarily save work in progress
- **Review changes** with `git diff` before committing

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
- **Git issues**: See Git Troubleshooting section above

### Debug Commands
```bash
# Check running processes
lsof -i :3000  # Frontend port
lsof -i :3001  # Backend port

# Database inspection
sqlite3 data/recipes.db ".tables"
sqlite3 data/recipes.db ".schema recipes"

# Git debugging
git status                    # Check repository status
git log --oneline -10        # Recent commits
git reflog                   # See all Git actions
```

### Version Control Recovery
If you need to recover from code issues:
```bash
# View recent commits
git log --oneline -20

# Go back to a working version
git checkout [commit-hash]

# Return to latest version
git checkout main

# Create branch from working version
git checkout -b recovery-branch [commit-hash]
```

## Project Goals & Vision

### Completed Phases
- ✅ **Phase 1**: Core recipe management system
- ✅ **Phase 2**: Advanced search and filtering  
- ✅ **Phase 3**: Collection organization system
- ✅ **Phase 4**: Comprehensive export functionality
- ✅ **Phase 5**: UX enhancements and final polish

### Project Live - Production Deployed! 🚀
All 16 development steps completed and successfully deployed to production:
- ✅ **Live Application**: Frontend on Vercel, Backend on Railway
- ✅ **Auto-Deployment**: GitHub integration for seamless updates
- ✅ **Full-Featured System**: Complete coffee recipe management
- ✅ **Professional UI/UX**: Dark mode, responsive design, keyboard shortcuts
- ✅ **Export Capabilities**: CSV, Excel, JSON, PDF exports
- ✅ **Task Management**: TODO.md system for ongoing improvements
- ✅ **Version Control**: Git with complete development history

### Future Enhancements (Optional)
- **User Authentication**: Multi-user support
- **Recipe Sharing**: Public recipe sharing
- **Mobile App**: React Native companion app
- **Analytics**: Advanced recipe analytics and insights
- **AI Features**: Recipe recommendations and analysis
- **Remote Git**: GitHub/GitLab integration for team collaboration

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

**Last Updated**: 2025-07-23  
**Maintained By**: AI Assistant (Claude)  
**Project Phase**: All 16 Steps Complete - Production Ready!
**Version Control**: Git repository with complete development history
**Repository**: Local Git at `/Users/hoyinng/claude project/.git/`