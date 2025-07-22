#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = 8888;
const DIST_DIR = path.join(__dirname, 'dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Handle root path
  let filePath = req.url === '/' ? '/index.html' : req.url;
  
  // Remove query string
  filePath = filePath.split('?')[0];
  
  // Build full file path
  const fullPath = path.join(DIST_DIR, filePath);
  
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    // For SPA, serve index.html for any non-asset requests
    if (!path.extname(filePath)) {
      const indexPath = path.join(DIST_DIR, 'index.html');
      if (fs.existsSync(indexPath)) {
        const indexContent = fs.readFileSync(indexPath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(indexContent);
        return;
      }
    }
    
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  // Get file extension and mime type
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  // Read and serve file
  try {
    const content = fs.readFileSync(fullPath);
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 Coffee Recipe Tracker - Static Server Started!');
  console.log(`📱 Local:    http://localhost:${PORT}/`);
  console.log(`🌐 Network:  http://192.168.1.107:${PORT}/`);
  console.log('\n💡 Note: This serves the built static files (UI only, no backend functionality)');
  console.log('🔄 To access full functionality, both backend and frontend dev servers need to be running');
  console.log('\n⭐ Features you can see:');
  console.log('   - Complete UI design and layout');
  console.log('   - All components and styling');
  console.log('   - Responsive design');
  console.log('   - Navigation and modals');
  console.log('   - Form interfaces');
  console.log('\n❌ Features that need backend:');
  console.log('   - Loading actual recipe data');
  console.log('   - Creating/editing recipes');
  console.log('   - Search and filtering with data');
  console.log('   - Export functionality');
  console.log('\nPress Ctrl+C to stop the server');
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use. Try a different port.`);
  } else {
    console.log(`❌ Server error: ${error.message}`);
  }
});