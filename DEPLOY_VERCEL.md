# Deploying to Vercel

This guide will help you deploy the Fuel EU Maritime Compliance Platform to Vercel.

## Prerequisites

1. **Vercel account**: Sign up at https://vercel.com
2. **GitHub/GitLab/Bitbucket account**: Your code needs to be in a Git repository
3. **Neon database**: Your database should be set up and accessible (see `backend/DATABASE_SETUP_NEON.md`)

## Deployment Options

### Option 1: Deploy Frontend Only (Recommended for First Time)

Deploy the frontend to Vercel and keep the backend running separately (e.g., on Railway, Render, or locally for development).

### Option 2: Deploy Both Frontend and Backend to Vercel

Deploy both frontend and backend as serverless functions on Vercel.

---

## Option 1: Frontend Only Deployment

### Step 1: Prepare Your Repository

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

### Step 2: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New Project"**
3. **Import your Git repository**
4. **Configure the project**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app` or `https://your-backend.vercel.app/api`)

6. **Deploy!**

### Step 3: Update Frontend API Client

Update `frontend/src/adapters/infrastructure/ApiClient.ts` to use the environment variable:

```typescript
constructor(baseURL: string = import.meta.env.VITE_API_URL || '/api') {
  // ... rest of the code
}
```

### Step 4: Deploy Backend Separately

Deploy your backend to:
- **Railway**: https://railway.app (recommended)
- **Render**: https://render.com
- **Fly.io**: https://fly.io
- Or any Node.js hosting service

Make sure to set the `DATABASE_URL` environment variable on your backend hosting service.

---

## Option 2: Full Stack Deployment on Vercel

### Step 1: Update Vercel Configuration

The `vercel.json` file is already configured. Make sure it's in your root directory.

### Step 2: Create API Directory Structure

The `api/index.ts` file wraps your Express backend for Vercel serverless functions.

### Step 3: Deploy to Vercel

1. **Install Vercel CLI** (optional, but recommended):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

   Or deploy from Vercel Dashboard:
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Import your Git repository
   - Vercel will auto-detect the configuration

### Step 4: Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

**Required:**
- `DATABASE_URL`: Your Neon database connection string
  ```
  postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
  ```

**Optional:**
- `NODE_ENV`: `production`
- `PORT`: (Vercel handles this automatically)

### Step 5: Run Database Migrations

After deployment, you need to run Prisma migrations:

**Option A: Using Vercel CLI**:
```bash
vercel env pull .env.local
cd backend
npx prisma migrate deploy
```

**Option B: Using Neon Dashboard**:
1. Go to your Neon project dashboard
2. Open SQL Editor
3. Run the migration SQL manually (from `backend/prisma/migrations/`)

**Option C: Create a migration endpoint** (temporary):
Add a migration endpoint to your backend (remove after migration):

```typescript
// Only for initial setup - REMOVE after migration!
app.post('/api/migrate', async (req, res) => {
  if (process.env.NODE_ENV === 'production' && req.headers.authorization !== `Bearer ${process.env.MIGRATION_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Run migrations
  const { execSync } = require('child_process');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  res.json({ status: 'migrations completed' });
});
```

### Step 6: Seed Database (Optional)

If you want to seed initial data, you can:
1. Use Prisma Studio: `npx prisma studio`
2. Or create a seed endpoint (similar to migration endpoint above)
3. Or manually insert data via Neon SQL Editor

---

## Post-Deployment Checklist

- [ ] Environment variables are set in Vercel
- [ ] Database migrations are run
- [ ] Database is seeded (if needed)
- [ ] Frontend can connect to backend API
- [ ] All API endpoints are working
- [ ] Health check endpoint works: `https://your-app.vercel.app/api/health`

---

## Troubleshooting

### Issue: "Cannot find module" errors

**Solution**: Make sure all dependencies are in `package.json` and installed.

### Issue: Database connection fails

**Solution**: 
- Check `DATABASE_URL` is set correctly
- Use the **direct connection** string (not pooler) for Vercel
- Ensure SSL mode is set: `?sslmode=require`

### Issue: API routes return 404

**Solution**: 
- Check `vercel.json` routing configuration
- Ensure API routes are prefixed with `/api`
- Check Vercel function logs in dashboard

### Issue: Build fails

**Solution**:
- Check build logs in Vercel dashboard
- Ensure TypeScript compiles: `cd backend && npm run build`
- Check for missing dependencies

---

## Environment Variables Reference

### Frontend (Vercel)
- `VITE_API_URL`: Backend API URL (if backend is separate)

### Backend (Vercel)
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: `production`
- `PORT`: (auto-set by Vercel)

---

## Quick Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# View environment variables
vercel env ls
```

---

## Next Steps

1. Set up custom domain (optional)
2. Enable analytics (optional)
3. Set up CI/CD for automatic deployments
4. Configure preview deployments for pull requests

---

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
- Prisma + Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel


