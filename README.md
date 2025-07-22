# Coffee Brewing Recipe Tracker

A web-based application for coffee enthusiasts to record, track, and manage their brewing recipes and outcomes. The application follows SCA (Specialty Coffee Association) standards for brewing parameters and taste evaluation.

## Project Structure

This is a monorepo containing three main packages:

- **`frontend/`** - React TypeScript application with Vite
- **`backend/`** - Express.js API server with TypeScript
- **`shared/`** - Shared types and validation schemas

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation

1. Clone the repository and navigate to the project directory:
```bash
cd "/Users/hoyinng/claude project"
```

2. Install all dependencies:
```bash
npm run setup
```

### Development

Start both frontend and backend development servers:
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:3001

### Individual Commands

- **Frontend only**: `npm run dev:frontend`
- **Backend only**: `npm run dev:backend`
- **Build all**: `npm run build`
- **Run tests**: `npm run test`

## Features

### MVP (Current Phase)
- [ ] Recipe input and management
- [ ] Recipe storage and retrieval
- [ ] Search and filtering
- [ ] Favorites and collections
- [ ] Data export (CSV/Excel)
- [ ] Tab-based navigation

### Future Phases
- **Phase 2**: Analytics and data visualization
- **Phase 3**: Recipe sharing and social features

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, SQLite
- **Validation**: Zod (shared schemas)
- **Testing**: Jest, React Testing Library, Supertest

## Architecture

The application follows a modern monorepo architecture with:

- **Shared types and validation** between frontend and backend
- **RESTful API** design with proper error handling
- **Responsive design** optimized for desktop (minimum 1024px width)
- **Type safety** throughout with TypeScript

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run build` | Build all packages for production |
| `npm run test` | Run all tests |
| `npm run setup` | Initial setup and dependency installation |
| `npm run clean` | Remove all node_modules |

## Documentation

- [Specification](./SPECIFICATION.md) - Complete project requirements
- [Blueprint](./BLUEPRINT.md) - Development roadmap and implementation guide
- [Folder Architecture](./FOLDER-ARCHITECTURE.md) - Project structure documentation

## Getting Started

1. Follow the installation steps above
2. Review the [specification](./SPECIFICATION.md) to understand the requirements
3. Check the [blueprint](./BLUEPRINT.md) for development steps
4. Start the development servers with `npm run dev`

## License

MIT License - see LICENSE file for details

## Contributing

This project follows a structured development approach with incremental steps. Please refer to the blueprint for the current implementation status and upcoming features.