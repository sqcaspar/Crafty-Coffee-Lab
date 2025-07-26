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

if [ $? -eq 0 ]; then
    echo "✅ Deployment complete!"
    echo "🎉 Your Coffee Brewing Recipe Tracker is now live!"
    echo ""
    echo "Next steps:"
    echo "1. Update your Railway backend CORS_ORIGIN with the Vercel URL"
    echo "2. Test the deployed application"
    echo "3. Run the deployment check script"
    echo ""
    echo "Test command:"
    echo "bash /Users/hoyinng/claude\ project/scripts/check-deployment.sh [BACKEND_URL] [FRONTEND_URL]"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi