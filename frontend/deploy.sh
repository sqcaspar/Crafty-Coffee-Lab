#!/bin/bash

# Coffee Brewing Recipe Tracker - Vercel Deployment Script

echo "🚀 Deploying Coffee Brewing Recipe Tracker to Vercel..."

# Check if logged in to Vercel
if ! npx vercel whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to Vercel. Please run: npx vercel login"
    exit 1
fi

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check for errors above."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
npx vercel --prod

echo "✅ Deployment complete!"
echo "🎉 Your Coffee Brewing Recipe Tracker is now live!"