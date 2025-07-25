# ☕ Coffee Brewing Recipe Tracker - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Complete Vercel Login
```bash
cd "/Users/hoyinng/claude project/frontend"
npx vercel login
```
**Choose your preferred method**: GitHub, Google, Email, etc.

### 2. Deploy to Production
```bash
npx vercel --prod
```

### 3. Expected Prompts & Responses
- **Set up and deploy?** → `Y` (Yes)
- **Which scope?** → Select your personal account
- **Link to existing project?** → `N` (No, create new)
- **Project name?** → `coffee-brewing-tracker` (or your preference)
- **Directory with code?** → `./` (current directory)
- **Auto-detect settings?** → `Y` (Yes)
- **Override settings?** → `N` (No)

## 📋 What's Being Deployed

### ✅ Updated Features
- **SCA Cupping Protocol** - Official 2004 standard with 10 equal attributes
- **CVA Affective Scoring** - Correct 1-9 hedonic scale and formula
- **Complete Recipe Interface** - All 4 accordion sections
- **Professional UI** - Monochrome design system

### 🎯 Updated Tab Names
- ✅ "Traditional SCA" → "SCA Cupping Protocol"  
- ✅ "CVA System" → "CVA Affective Scoring"

### 📊 Correct Formulas
- **SCA**: `Final Score = Σ(F₁...F₁₀) - (2 × Tainted cups) - (4 × Faulty cups)`
- **CVA**: `S = 0.65625 × Σhi + 52.75 - 2u - 4d`

## 🌐 Expected Result

After deployment, you'll get a live URL like:
- `https://coffee-brewing-tracker.vercel.app`
- `https://coffee-brewing-tracker-xyz.vercel.app`

## 🔧 Alternative: Deploy Preview Only

If you want to deploy just the HTML preview I created:
```bash
cd "/Users/hoyinng/claude project/frontend/dist"
npx vercel brew-journal-preview.html --prod
```

## 🆘 Troubleshooting

### Issue: "No existing credentials found"
**Solution**: Run `npx vercel login` again and complete the browser authentication

### Issue: "The specified token is not valid"
**Solution**: 
1. Run `npx vercel logout`
2. Run `npx vercel login` 
3. Complete authentication in browser

### Issue: Build errors
**Solution**: 
1. Run `npm run build` first
2. Check for any TypeScript errors
3. Then run `npx vercel --prod`

## 📞 Need Help?

If you encounter issues:
1. Check the terminal output for specific error messages
2. Ensure you completed the browser login process
3. Try logging out and back in: `npx vercel logout && npx vercel login`

## 🎉 Success!

Once deployed, you'll have:
- ✅ Live, shareable URL
- ✅ Updated SCA Cupping Protocol interface
- ✅ Corrected CVA Affective Scoring system
- ✅ Professional coffee evaluation platform

**Test the evaluation tabs** to confirm the SCA and CVA updates are working correctly!