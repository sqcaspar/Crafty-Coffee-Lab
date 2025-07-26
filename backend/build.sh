#!/bin/bash

# Render build script for Coffee Tracker Backend
echo "🏗️  Starting Render build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Create data directory for SQLite
echo "📁 Creating data directory..."
mkdir -p /opt/render/project/src/data

echo "✅ Build completed successfully!"