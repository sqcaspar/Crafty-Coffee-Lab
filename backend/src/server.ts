import app from './app.js';

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Bind to all interfaces for Railway compatibility

app.listen(PORT, HOST, () => {
  console.log(`🚀 Coffee Brewing Tracker API server running on ${HOST}:${PORT}`);
  console.log(`📖 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server URL: http://${HOST}:${PORT}`);
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