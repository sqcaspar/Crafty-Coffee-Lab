# ☕ Coffee Brewing Tracker - Complete Deployment Guide

This guide will help you deploy the full-stack Coffee Brewing Tracker application to production platforms.

## 🎯 Overview

**Architecture:**
- **Frontend**: Vercel (Static hosting)
- **Backend**: Railway (Node.js hosting)  
- **Database**: Supabase (PostgreSQL)

**Estimated Time**: 45 minutes
**Cost**: $0/month (using free tiers)

---

## 📋 Prerequisites

1. **Accounts needed:**
   - [Supabase](https://supabase.com) - Database hosting
   - [Railway](https://railway.app) - Backend hosting
   - [Vercel](https://vercel.com) - Frontend hosting

2. **Tools required:**
   - Node.js 18+ installed
   - Git installed
   - Terminal/Command line access

---

## 🗄️ Phase 1: Database Setup (Supabase)

### Step 1.1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in details:
   - **Name**: `coffee-brewing-tracker`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier
4. Click **"Create new project"**
5. Wait for project initialization (2-3 minutes)

### Step 1.2: Setup Database Schema

1. In Supabase dashboard, go to **"SQL Editor"**
2. Click **"New Query"**
3. Copy the entire contents of `/backend/supabase-schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** to execute the schema
6. Verify tables created: `recipes`, `collections`, `recipe_collections`

### Step 1.3: Get Connection Credentials

1. Go to **Settings > API**
2. Copy these values (you'll need them later):
   ```
   Project URL: https://[project-id].supabase.co
   Anon Key: eyJ... (long string)
   Service Role Key: eyJ... (long string)
   ```
3. Go to **Settings > Database**
4. Copy the **Connection String**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[project-id].supabase.co:5432/postgres
   ```

---

## 🚀 Phase 2: Backend Deployment (Railway)

### Step 2.1: Prepare Railway Deployment

1. Go to [Railway](https://railway.app)
2. Sign up/Sign in with GitHub
3. Click **"New Project"**
4. Choose **"Deploy from GitHub repo"**
5. Connect your GitHub account if needed
6. **Important**: You'll need to push your code to GitHub first

### Step 2.2: Push Code to GitHub (if not done)

```bash
cd "/Users/hoyinng/claude project"
git init
git add .
git commit -m "Initial commit - Coffee Brewing Tracker"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/coffee-brewing-tracker.git
git push -u origin main
```

### Step 2.3: Deploy Backend to Railway

1. In Railway, select your GitHub repository
2. Choose the **backend** folder as the root directory
3. Railway will detect the `railway.toml` configuration
4. Add environment variables:
   - Click **"Variables"** tab
   - Add these variables:
   ```
   NODE_ENV=production
   SUPABASE_URL=https://[your-project-id].supabase.co
   SUPABASE_ANON_KEY=[your-anon-key]
   SUPABASE_SERVICE_KEY=[your-service-role-key]
   DATABASE_URL=postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres
   CORS_ORIGIN=https://[your-future-vercel-domain].vercel.app
   ```
5. Click **"Deploy"**
6. Wait for deployment (3-5 minutes)
7. Copy your Railway backend URL: `https://[app-name].railway.app`

### Step 2.4: Test Backend API

```bash
curl https://[your-railway-url].railway.app/api/recipes
```
Should return: `{"success":true,"data":[],"message":"Retrieved 0 recipes"}`

---

## 🌐 Phase 3: Frontend Deployment (Vercel)

### Step 3.1: Update Frontend Configuration

1. Update the API endpoint in frontend:
```bash
cd "/Users/hoyinng/claude project/frontend"
```

2. Find and update the API base URL in your frontend code (usually in `src/services/api.ts` or similar):
```typescript
// Replace localhost with your Railway URL
const API_BASE_URL = 'https://[your-railway-url].railway.app/api';
```

### Step 3.2: Deploy to Vercel

```bash
cd "/Users/hoyinng/claude project/frontend"

# Make sure you're logged in to Vercel
npx vercel login

# Build the application
npm run build

# Deploy to production
npx vercel --prod
```

### Step 3.3: Complete Vercel Setup

Follow the prompts:
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N`
- **Project name?** → `coffee-brewing-tracker`
- **Directory?** → `./` 
- **Auto-detect settings?** → `Y`
- **Override settings?** → `N`

### Step 3.4: Update CORS Configuration

1. Go back to Railway
2. Update the `CORS_ORIGIN` environment variable:
   ```
   CORS_ORIGIN=https://[your-vercel-domain].vercel.app
   ```
3. Redeploy the backend

---

## ✅ Phase 4: Testing & Verification

### Step 4.1: Test Complete Application

1. Open your Vercel URL: `https://[project-name].vercel.app`
2. Test core functionality:
   - ✅ Create a new recipe
   - ✅ Test all tasting evaluation systems (Quick Tasting, SCA, CVA)
   - ✅ Test rating sliders (should save as numbers)
   - ✅ Test date picker (should save properly)
   - ✅ Test recipe list and search
   - ✅ Test favorites and collections

### Step 4.2: Verify Recent Fixes

Test the validation fixes we just implemented:
1. **Evaluation System**: Try selecting "Quick Tasting" - should work without errors
2. **Rating Sliders**: Move sliders and save - should accept numeric values
3. **Date Picker**: Select a roasting date - should save without validation errors

### Step 4.3: Monitor Logs

- **Railway**: Check logs in Railway dashboard for any backend errors
- **Vercel**: Check function logs in Vercel dashboard
- **Supabase**: Monitor database queries in Supabase dashboard

---

## 🔧 Troubleshooting

### Common Issues

**Frontend can't connect to backend:**
- Check CORS configuration in Railway environment variables
- Verify API URL is correct in frontend code
- Check Railway logs for errors

**Database connection errors:**
- Verify Supabase connection string is correct
- Check database password is properly encoded
- Ensure Supabase project is active

**Build failures:**
- Run `npm run build` locally first to catch errors
- Check TypeScript compilation errors
- Verify all dependencies are installed

### Useful Commands

```bash
# Check deployment status
npx vercel ls

# View logs
npx vercel logs [deployment-url]

# Redeploy frontend
npx vercel --prod

# Test backend locally with production database
cd backend
SUPABASE_URL=... SUPABASE_ANON_KEY=... npm run dev
```

---

## 🎉 Success!

Once deployed, you'll have:

- ✅ **Live Frontend**: Professional coffee evaluation interface
- ✅ **Live Backend**: RESTful API with full CRUD operations  
- ✅ **Cloud Database**: PostgreSQL with proper schema
- ✅ **All Features**: Complete tasting evaluation system
- ✅ **Recent Fixes**: All validation issues resolved

**Your URLs:**
- **Frontend**: `https://[project-name].vercel.app`
- **Backend**: `https://[app-name].railway.app`
- **Database**: Supabase Dashboard

Share your frontend URL with others to let them try your coffee brewing tracker!

---

## 📊 Free Tier Limitations

**Supabase Free Tier:**
- 2 projects
- 500MB database storage
- 50MB file storage
- 2GB data transfer

**Railway Free Tier:**
- $5/month in credits
- 1GB RAM
- 1GB disk
- Reasonable for coffee tracking app

**Vercel Free Tier:**
- 100GB bandwidth/month
- Unlimited static sites
- Perfect for React frontend

## 🔄 Future Updates

To update your deployed application:

1. **Code Changes**: Make changes locally
2. **Test**: Test locally with `npm run dev`
3. **Frontend**: Run `npx vercel --prod` to redeploy
4. **Backend**: Push to GitHub, Railway auto-deploys
5. **Database**: Run new SQL in Supabase SQL Editor

---

*Happy brewing! ☕*