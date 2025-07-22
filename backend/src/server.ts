import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Coffee Brewing Tracker API server running on port ${PORT}`);
  console.log(`📖 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT signal received: closing HTTP server');
  process.exit(0);
});