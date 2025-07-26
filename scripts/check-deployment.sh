#!/bin/bash

# Coffee Brewing Tracker - Deployment Status Check Script

echo "🔍 Coffee Brewing Tracker - Deployment Status Check"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if URLs are provided
BACKEND_URL="${1:-}"
FRONTEND_URL="${2:-}"

if [ -z "$BACKEND_URL" ] || [ -z "$FRONTEND_URL" ]; then
    echo "Usage: $0 <backend-url> <frontend-url>"
    echo "Example: $0 https://your-app.railway.app https://your-app.vercel.app"
    exit 1
fi

echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Check Backend Health
echo "🔍 Checking Backend Health..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health" || echo "000")

if [ "$BACKEND_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ Backend is healthy (HTTP $BACKEND_STATUS)${NC}"
else
    echo -e "${RED}❌ Backend is not responding (HTTP $BACKEND_STATUS)${NC}"
fi

# Check Backend API
echo "🔍 Checking Backend API..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/recipes" || echo "000")

if [ "$API_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ Backend API is working (HTTP $API_STATUS)${NC}"
    # Get recipe count
    RECIPE_COUNT=$(curl -s "$BACKEND_URL/api/recipes" | grep -o '"data":\[[^]]*\]' | grep -o '\[.*\]' | grep -o ',' | wc -l)
    echo "   📊 Recipes in database: $((RECIPE_COUNT + 1))"
else
    echo -e "${RED}❌ Backend API is not working (HTTP $API_STATUS)${NC}"
fi

# Check Frontend
echo "🔍 Checking Frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" || echo "000")

if [ "$FRONTEND_STATUS" == "200" ]; then
    echo -e "${GREEN}✅ Frontend is accessible (HTTP $FRONTEND_STATUS)${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible (HTTP $FRONTEND_STATUS)${NC}"
fi

# Check CORS
echo "🔍 Checking CORS Configuration..."
CORS_TEST=$(curl -s -H "Origin: $FRONTEND_URL" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS "$BACKEND_URL/api/recipes" -w "%{http_code}" -o /dev/null || echo "000")

if [ "$CORS_TEST" == "200" ] || [ "$CORS_TEST" == "204" ]; then
    echo -e "${GREEN}✅ CORS is properly configured${NC}"
else
    echo -e "${YELLOW}⚠️  CORS might need configuration (HTTP $CORS_TEST)${NC}"
fi

# Summary
echo ""
echo "📋 Deployment Summary:"
echo "======================"

if [ "$BACKEND_STATUS" == "200" ] && [ "$API_STATUS" == "200" ] && [ "$FRONTEND_STATUS" == "200" ]; then
    echo -e "${GREEN}🎉 All systems are operational!${NC}"
    echo ""
    echo "Your Coffee Brewing Tracker is ready to use:"
    echo "Frontend: $FRONTEND_URL"
    echo "Backend API: $BACKEND_URL/api"
    echo ""
    echo "Test the application:"
    echo "1. Create a new recipe"
    echo "2. Test evaluation systems (Quick Tasting, SCA, CVA)"
    echo "3. Test rating sliders and date picker"
    echo "4. Test recipe search and filtering"
else
    echo -e "${RED}❌ Some issues detected. Check the logs above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "1. Check environment variables in Railway"
    echo "2. Verify CORS_ORIGIN in backend"
    echo "3. Ensure database connection is working"
    echo "4. Check Vercel build logs"
fi

echo ""
echo "For detailed logs:"
echo "- Railway: https://railway.app (check your project logs)"
echo "- Vercel: https://vercel.com (check function logs)"
echo "- Supabase: https://app.supabase.com (check database queries)"