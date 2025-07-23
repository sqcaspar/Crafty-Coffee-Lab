# ☕ Crafty Coffee Lab

A modern, comprehensive coffee brewing recipe tracker for coffee enthusiasts. Record, organize, and analyze your brewing recipes with a beautiful monochrome interface. Built with React, TypeScript, and Node.js.

🔗 **[Live Demo](https://crafty-coffee-lab.vercel.app)** | 📚 **[Documentation](./CLAUDE.md)**

![Crafty Coffee Lab](https://img.shields.io/badge/Status-Production%20Ready-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue) ![React](https://img.shields.io/badge/React-18-61dafb) ![Node.js](https://img.shields.io/badge/Node.js-18+-green)

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

### ✅ Completed Features (All 16 Steps!)
- ✅ **Recipe Management**: Complete CRUD operations for brewing recipes
- ✅ **Advanced Search & Filtering**: Real-time search across all fields with 8 filter types
- ✅ **Collections System**: Organize recipes with custom collections, colors, and tags
- ✅ **Favorites**: Star/unstar recipes with dedicated favorites view
- ✅ **Data Export**: Multiple formats (CSV, Excel, JSON, PDF) with filtered exports
- ✅ **Analytics Dashboard**: Recipe statistics, trends, and insights
- ✅ **Modern UI**: Monochrome design with accordion forms and responsive layout
- ✅ **Recipe Comparison**: Side-by-side comparison of multiple recipes
- ✅ **Recipe Cloning**: Duplicate recipes with customizable modifications
- ✅ **Backup & Restore**: Complete data backup with JSON export/import
- ✅ **Dark Mode**: Complete theme system with persistent preferences
- ✅ **Keyboard Shortcuts**: Power user features for efficient navigation
- ✅ **Recipe Sharing**: Generate shareable links and export capabilities
- ✅ **Responsive Design**: Optimized for desktop, tablet, and mobile
- ✅ **Performance**: Optimized loading with skeleton states and caching
- ✅ **Accessibility**: Full keyboard navigation and screen reader support

### 🚀 Production Ready
This application has completed all planned development phases and is ready for real-world use!

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
