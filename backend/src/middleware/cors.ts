import cors from 'cors';
import type { CorsOptions } from 'cors';

/**
 * CORS configuration for development and production
 */
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = [
      'http://localhost:3000',        // React dev server
      'http://127.0.0.1:3000',        // Alternative localhost
      'http://localhost:3001',        // API server (for testing)
      'http://127.0.0.1:3001',        // Alternative localhost
    ];

    // In production, add your production domains
    if (process.env.NODE_ENV === 'production') {
      // Add production origins here when deploying
      if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL);
      }
      // Common production patterns for deployment platforms
      allowedOrigins.push('https://crafty-coffee-lab.vercel.app');
      allowedOrigins.push('https://crafty-coffee-lab-git-main.vercel.app');
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    
    // In production, also allow any Vercel deployment for this project
    if (process.env.NODE_ENV === 'production' && origin) {
      const isVercelDomain = origin.includes('crafty-coffee-lab') && origin.includes('vercel.app');
      if (isVercelDomain) {
        callback(null, true);
        return;
      }
    }
    
    console.warn(`CORS blocked request from origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200, // Support legacy browsers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'Content-Disposition' // For file downloads
  ],
  maxAge: 86400 // 24 hours
};

export const corsMiddleware = cors(corsOptions);