# Coffee Brewing Recipe Tracker - Folder Architecture

## Project Root Structure
```
coffee-brewing-tracker/
├── frontend/                 # React TypeScript application
├── backend/                  # Express.js API server
├── shared/                   # Shared types and utilities
├── docs/                     # Project documentation
├── scripts/                  # Build and deployment scripts
├── .gitignore               # Git ignore rules
├── README.md                # Main project documentation
└── package.json             # Root package configuration
```

## Frontend Structure (`frontend/`)
```
frontend/
├── public/                   # Static assets
│   ├── favicon.ico
│   └── vite.svg
├── src/                      # Source code
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Generic components
│   │   ├── forms/           # Form-specific components
│   │   ├── recipe/          # Recipe-related components
│   │   └── navigation/      # Navigation components
│   ├── services/            # API and external service integration
│   │   ├── api.ts           # Base API configuration
│   │   ├── recipeService.ts # Recipe-specific API calls
│   │   └── exportService.ts # Export functionality
│   ├── hooks/               # Custom React hooks
│   │   ├── useRecipeValidation.ts
│   │   ├── useFilters.ts
│   │   └── useLocalStorage.ts
│   ├── context/             # React context providers
│   │   ├── RecipeContext.tsx
│   │   └── AppContext.tsx
│   ├── types/               # Frontend-specific types
│   ├── utils/               # Utility functions
│   ├── styles/              # Global styles and Tailwind config
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # React application entry point
│   └── vite-env.d.ts        # Vite type definitions
├── index.html               # HTML template
├── package.json             # Frontend dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tsconfig.node.json       # Node-specific TypeScript config
├── vite.config.ts           # Vite build configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── postcss.config.js        # PostCSS configuration
```

## Backend Structure (`backend/`)
```
backend/
├── src/                     # Source code
│   ├── routes/              # Express route handlers
│   │   ├── recipes.ts       # Recipe CRUD endpoints
│   │   ├── collections.ts   # Collection management
│   │   └── export.ts        # Export functionality
│   ├── services/            # Business logic services
│   │   ├── recipeService.ts # Recipe business logic
│   │   ├── collectionService.ts
│   │   └── exportService.ts # File generation logic
│   ├── database/            # Database layer
│   │   ├── connection.ts    # Database connection setup
│   │   ├── schema.ts        # Database schema definitions
│   │   ├── models/          # Database models
│   │   │   ├── Recipe.ts
│   │   │   └── Collection.ts
│   │   └── migrations/      # Database migration files
│   ├── middleware/          # Express middleware
│   │   ├── validation.ts    # Request validation
│   │   ├── errorHandler.ts  # Error handling
│   │   └── cors.ts          # CORS configuration
│   ├── utils/               # Utility functions
│   │   ├── fileGenerator.ts # CSV/Excel generation
│   │   └── helpers.ts       # General helpers
│   ├── types/               # Backend-specific types
│   ├── app.ts               # Express app configuration
│   └── server.ts            # Server startup
├── tests/                   # Test files
│   ├── routes/              # Route tests
│   ├── services/            # Service tests
│   └── utils/               # Utility tests
├── package.json             # Backend dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── nodemon.json             # Nodemon configuration
```

## Shared Structure (`shared/`)
```
shared/
├── src/                     # Shared source code
│   ├── types/               # TypeScript interfaces
│   │   ├── recipe.ts        # Recipe-related types
│   │   ├── collection.ts    # Collection types
│   │   ├── api.ts           # API response types
│   │   └── index.ts         # Type exports
│   ├── validation/          # Zod validation schemas
│   │   ├── recipeSchema.ts  # Recipe validation
│   │   ├── collectionSchema.ts
│   │   └── index.ts         # Schema exports
│   ├── utils/               # Shared utility functions
│   │   ├── calculations.ts  # Coffee ratio calculations
│   │   ├── formatting.ts    # Data formatting
│   │   └── constants.ts     # Application constants
│   └── index.ts             # Main exports
├── package.json             # Shared dependencies
└── tsconfig.json            # TypeScript configuration
```

## Documentation Structure (`docs/`)
```
docs/
├── api/                     # API documentation
│   ├── recipes.md           # Recipe endpoints
│   ├── collections.md       # Collection endpoints
│   └── export.md            # Export endpoints
├── setup/                   # Setup instructions
│   ├── development.md       # Development environment setup
│   ├── deployment.md        # Production deployment guide
│   └── database.md          # Database setup and migrations
├── testing/                 # Testing documentation
│   ├── frontend.md          # Frontend testing guide
│   ├── backend.md           # Backend testing guide
│   └── e2e.md              # End-to-end testing
└── user-guide/             # User documentation
    ├── getting-started.md   # User getting started guide
    ├── features.md          # Feature documentation
    └── troubleshooting.md   # Common issues and solutions
```

## Scripts Structure (`scripts/`)
```
scripts/
├── build/                   # Build scripts
│   ├── build-frontend.sh    # Frontend build script
│   ├── build-backend.sh     # Backend build script
│   └── build-all.sh         # Full project build
├── deploy/                  # Deployment scripts
│   ├── deploy-staging.sh    # Staging deployment
│   └── deploy-production.sh # Production deployment
├── database/                # Database scripts
│   ├── setup-db.sh          # Database initialization
│   ├── migrate.sh           # Run migrations
│   └── seed-data.sh         # Seed development data
└── development/             # Development utility scripts
    ├── start-dev.sh         # Start all development servers
    └── reset-project.sh     # Clean install and restart
```

## Configuration Files

### Root Level
- `.gitignore` - Git ignore patterns for all environments
- `README.md` - Main project documentation and setup instructions
- `package.json` - Root package file for scripts and workspace management

### Development Tools
- Each module has its own `tsconfig.json` for TypeScript compilation
- Frontend has `vite.config.ts` for build configuration
- Backend has `nodemon.json` for development server
- Tailwind CSS configuration in frontend for styling

## Key Architecture Decisions

1. **Monorepo Structure**: All related code in single repository for easier development
2. **Shared Package**: Common types and utilities prevent duplication
3. **TypeScript Throughout**: Full type safety across frontend and backend
4. **Modern Build Tools**: Vite for frontend, native TypeScript for backend
5. **Modular Organization**: Clear separation of concerns in each module
6. **Testing Structure**: Tests co-located with source code for maintainability

## Development Workflow

1. **Development**: `npm run dev` starts both frontend and backend
2. **Building**: `npm run build` builds all modules for production
3. **Testing**: `npm run test` runs test suites across all modules
4. **Database**: Scripts handle database setup, migrations, and seeding

This architecture supports scalable development while maintaining clear boundaries between different aspects of the application.