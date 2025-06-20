# Netlify Deployment Guide - Full Stack Version

## What's Different About This Version

This is the **full-stack version** adapted for Netlify, which means:
- Frontend runs as a static React app
- Backend runs as **Netlify Functions** (serverless)
- Image processing happens on the server with Sharp library
- Better performance than browser-only version

## Why Netlify Wasn't Working Before

Common issues with full-stack apps on Netlify:
1. **Wrong file structure** - Netlify expects specific folders
2. **Missing serverless wrapper** - Backend needs serverless-http
3. **Incorrect build configuration** - Build outputs must match Netlify's expectations
4. **Function routing issues** - API routes need proper redirects

## Fixed Issues

✅ **Proper Function Structure**: Backend code in `/functions/api.js`  
✅ **Serverless Wrapper**: Using serverless-http for Express compatibility  
✅ **Correct Redirects**: All API calls route to Netlify Functions  
✅ **Build Configuration**: Proper dist folder structure  
✅ **Dependencies**: All required packages included  

## Step-by-Step Deployment

### 1. Upload to GitHub
- Create new repository
- Upload all files from this `netlify-deployment` folder
- Repository can be public or private

### 2. Connect to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub account
4. Select your repository

### 3. Configure Build Settings
Netlify should auto-detect these settings from `netlify.toml`, but verify:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: `functions`

### 4. Deploy
- Click "Deploy site"
- Wait for build to complete (2-5 minutes)
- Your app will be available at: `https://YOUR-SITE-NAME.netlify.app`

## How It Works

**Frontend**: React app builds to `/dist` folder  
**Backend**: Express server becomes Netlify Function at `/.netlify/functions/api`  
**API Calls**: Automatically redirected from `/api/*` to functions  
**Image Processing**: Server-side with Sharp (faster than browser processing)  

## Troubleshooting

**Build fails?**
1. Check build logs in Netlify dashboard
2. Ensure all dependencies are in package.json
3. Verify Node.js version (should be 18+)

**Functions not working?**
1. Check Function logs in Netlify dashboard
2. Verify API calls use `/api/` prefix
3. Test individual endpoints

**Images not processing?**
1. Check if Sharp builds correctly on Netlify
2. Verify file upload limits (10MB default)
3. Check Function timeout (10 seconds default)

## Advantages Over GitHub Pages Version

- **Server-side image processing** (faster, more accurate)
- **File upload handling** (not limited by browser)
- **Better memory management** (no browser limits)
- **Professional Sharp library** (higher quality processing)
- **Scalable architecture** (functions auto-scale)

Your mosaic generator now runs as a proper full-stack application on Netlify!