import 'dotenv/config';
import express from 'express';
import { initializeDatabase, seedDatabase } from './database/index.js';
import { corsMiddleware, requestLogger, errorHandler, notFoundHandler } from './middleware/index.js';
import apiRoutes from './routes/index.js';

const app = express();

// Initialize database on startup
const initDB = async () => {
  try {
    await initializeDatabase();
    
    // Seed database with sample data in development or if explicitly requested
    if (process.env.NODE_ENV === 'development' || process.env.SEED_DATABASE === 'true') {
      await seedDatabase();
    }
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  }
};

initDB();

// Core middleware
app.use(corsMiddleware);

// Explicit OPTIONS handler for preflight requests
app.options('*', (req, res) => {
  console.log(`OPTIONS request from ${req.headers.origin} for ${req.url}`);
  res.status(200).end();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(requestLogger);
}

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Root endpoint for basic health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Coffee Brewing Tracker API',
    version: '1.0.1',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const { RecipeModel, CollectionModel } = await import('./database/index.js');
    const recipeCount = await RecipeModel.count();
    const collectionCount = await CollectionModel.count();
    
    res.json({ 
      status: 'ok', 
      message: 'Coffee Brewing Tracker API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: true,
        recipes: recipeCount,
        collections: collectionCount
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API routes
app.use('/api', apiRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;