# Deployment Guide

## Overview

This application is configured as a monorepo where the backend and frontend are built together and served from a single service. The backend (Express) serves both the API routes (`/api/*`) and the static frontend files in production.

## Railway Deployment

### Prerequisites

- Railway account
- Railway CLI installed (`npm install -g @railway/cli`) or use the web dashboard

### Environment Variables

Set these in Railway:

1. `DATABASE_URL` - PostgreSQL connection string (from Supabase)
2. `SUPABASE_URL` - Supabase project URL
3. `SUPABASE_ANON_KEY` - Supabase anon/public key
4. `NODE_ENV=production` - Tells the app to run in production mode
5. `PORT` - Railway will set this automatically

### Deployment Steps

#### Option 1: Railway Web Dashboard

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select this repository
4. Railway will detect the configuration from `railway.json`
5. Add the environment variables listed above
6. Click "Deploy"
7. Once deployed, Railway will provide a public URL like `https://your-app.up.railway.app`

#### Option 2: Railway CLI

```bash
# Login to Railway
railway login

# Initialize project (if not already done)
railway init

# Link to existing project (or create new)
railway link

# Set environment variables
railway variables set DATABASE_URL="your-database-url"
railway variables set SUPABASE_URL="your-supabase-url"
railway variables set SUPABASE_ANON_KEY="your-supabase-key"
railway variables set NODE_ENV="production"

# Deploy
railway up
```

### Verify Deployment

1. Check health endpoint: `https://your-app.up.railway.app/health`
   - Should return: `{"ok": true, "port": 3000, "pid": 1}`

2. Test the frontend: `https://your-app.up.railway.app`
   - Should load the app

3. Test API: `https://your-app.up.railway.app/api/trips`
   - Should return trips data (or empty array)

4. Test create trip flow:
   - Go to `/create-trip`
   - Fill out form and submit
   - Should create trip and redirect to `/my-trips`

5. Test join flow:
   - Copy invite code from a trip
   - Go to `/join?code=INVITECODE`
   - Should prefill the code and allow joining

## How It Works

### Build Process

When Railway deploys:

1. Runs `npm install`
2. Detects `build` script in package.json
3. Runs `npm run build` which:
   - Builds the React frontend with Vite → `dist/public`
   - Builds the Express backend with esbuild → `dist/index.cjs`
4. Runs `npm run start` which starts the production server

### Production Mode

- Backend listens on `0.0.0.0` (all interfaces) instead of `127.0.0.1`
- Backend serves static files from `dist/public`
- CORS allows both localhost (for development) and the deployed URL
- Frontend uses relative API URLs (`/api/*`) instead of absolute URLs

### Environment-Specific Configuration

**Development:**
- `VITE_API_URL=http://127.0.0.1:5050` (from `client/.env.local`)
- Frontend runs on port 5173 (Vite dev server)
- Backend runs on port 5050 (Express)
- Vite proxies `/api/*` requests to the backend

**Production:**
- `VITE_API_URL=` (empty, from `client/.env.production`)
- All requests use relative URLs
- Everything served from one origin on Railway's assigned port

## Troubleshooting

### CORS errors

If you see CORS errors, make sure:
- The deployed URL is set correctly
- CLIENT_URL is not needed since frontend and backend are same origin

### Database connection issues

- Verify DATABASE_URL is set correctly
- Check that Supabase allows connections from Railway's IPs
- Ensure the database schema is up to date

### Build failures

- Check that all dependencies are in `package.json`
- Verify `node_modules` is not committed
- Ensure build script completes successfully locally: `npm run build`

### Static files not loading

- Verify `dist/public` exists after build
- Check that `NODE_ENV=production` is set
- Ensure static files are being served from the correct path
