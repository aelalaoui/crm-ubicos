# 🚀 Quick Start: Deploy to Railway

This is a quick guide to get your application deployed to Railway in minutes.

## Prerequisites

- Railway account (https://railway.app)
- GitHub account with your code pushed
- 10 minutes of your time ⏱️

## Option 1: Deploy via Railway Dashboard (Easiest)

### Step 1: Create Project & Add Databases

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Railway will create a project

### Step 2: Add Databases

1. In your project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Click "+ New" again
4. Select "Database" → "Add Redis"

### Step 3: Configure API Service

1. Click on your service (the one Railway created from your repo)
2. Rename it to "api"
3. Go to "Settings" tab
4. Under "Build & Deploy":
   - **Build Command**: `npm ci && npm run prisma:generate && npm run build:api`
   - **Start Command**: `npm run start:api`
5. Go to "Variables" tab and add:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
NODE_ENV=production
PORT=3001
CORS_ORIGIN=*
THROTTLE_TTL=60
THROTTLE_LIMIT=10
```

6. Click "Deploy" to redeploy with new settings

### Step 4: Create Web Service

1. Click "+ New" → "GitHub Repo"
2. Select the same repository
3. Rename service to "web"
4. Go to "Settings" tab
5. Under "Build & Deploy":
   - **Build Command**: `npm ci && npm run build:web`
   - **Start Command**: `npm run start:web`
6. Go to "Variables" tab and add:

```
NEXT_PUBLIC_API_URL=https://your-api-service-url.railway.app
NEXT_PUBLIC_WS_URL=wss://your-api-service-url.railway.app
NODE_ENV=production
```

**Note**: Get your API URL from the API service's "Settings" → "Networking" → "Public Networking"

7. Click "Deploy"

### Step 5: Run Database Migrations

1. Go to your API service
2. Click on "Settings" → "Service"
3. Scroll to "Service Variables"
4. Open the service shell (three dots menu → "Shell")
5. Run:

```bash
npm run prisma:migrate:deploy --workspace=apps/api
```

### Step 6: Update CORS

1. Go back to API service variables
2. Update `CORS_ORIGIN` with your Web service URL
3. Redeploy the API service

### ✅ Done! Your app is live!

- **Frontend**: Check your Web service URL
- **API**: Check your API service URL + `/api/docs`

---

## Option 2: Deploy via Railway CLI

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login

```bash
railway login
```

### Step 3: Initialize Project

```bash
railway init
```

Follow the prompts to create a new project.

### Step 4: Add Databases

```bash
# Add PostgreSQL
railway add --database postgresql

# Add Redis
railway add --database redis
```

### Step 5: Set Environment Variables

```bash
# Set JWT secrets
railway variables set JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
railway variables set JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"

# Set other variables
railway variables set NODE_ENV=production
railway variables set CORS_ORIGIN="*"
railway variables set THROTTLE_TTL=60
railway variables set THROTTLE_LIMIT=10
```

### Step 6: Deploy

```bash
railway up
```

### Step 7: Run Migrations

```bash
railway run npm run prisma:migrate:deploy --workspace=apps/api
```

### ✅ Done!

Get your service URL:

```bash
railway domain
```

---

## Option 3: Deploy via GitHub Actions (CI/CD)

### Step 1: Get Railway Token

1. Go to https://railway.app/account/tokens
2. Click "Create Token"
3. Copy the token

### Step 2: Add GitHub Secrets

1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `RAILWAY_TOKEN`: Your Railway token
   - `RAILWAY_API_SERVICE`: Your API service ID (from Railway dashboard URL)
   - `RAILWAY_WEB_SERVICE`: Your Web service ID (from Railway dashboard URL)

### Step 3: Push to Main Branch

```bash
git add .
git commit -m "Deploy to Railway"
git push origin main
```

GitHub Actions will automatically:
- Run tests
- Deploy to Railway if tests pass

### ✅ Done!

Check the "Actions" tab in your GitHub repo to see the deployment progress.

---

## Troubleshooting

### Build Fails

**Problem**: Build fails with "Cannot find module"

**Solution**: 
```bash
# Clear Railway cache
railway run npm ci --force
railway up
```

### Database Connection Error

**Problem**: "Can't reach database server"

**Solution**:
1. Ensure PostgreSQL service is running in Railway
2. Check that `DATABASE_URL` variable is set to `${{Postgres.DATABASE_URL}}`
3. Restart the API service

### CORS Error

**Problem**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution**:
1. Update API service `CORS_ORIGIN` variable with your Web service URL
2. Redeploy API service

### Migrations Not Applied

**Problem**: "Table doesn't exist" errors

**Solution**:
```bash
railway run npm run prisma:migrate:deploy --workspace=apps/api
```

### Environment Variables Not Loading

**Problem**: Variables are undefined in the app

**Solution**:
1. Verify variables are set in Railway dashboard
2. Restart the service
3. For Next.js, ensure variables start with `NEXT_PUBLIC_`

---

## Next Steps

1. ✅ Set up custom domain (Railway Settings → Networking)
2. ✅ Configure monitoring and alerts
3. ✅ Set up staging environment
4. ✅ Enable automatic deployments from GitHub
5. ✅ Review security settings

---

## Need Help?

- 📚 Full Guide: See `RAILWAY_DEPLOYMENT.md`
- 💬 Railway Discord: https://discord.gg/railway
- 📖 Railway Docs: https://docs.railway.app
- 🐛 Issues: Create an issue in this repository

---

**Pro Tips:**

- Use Railway's free tier for development ($5 credit/month)
- Set up staging and production environments
- Enable automatic deployments from GitHub
- Monitor your usage to avoid unexpected costs
- Use Railway's built-in metrics for monitoring

**Security Reminders:**

- ⚠️ Change all default secrets before deploying
- ⚠️ Never commit `.env` files to Git
- ⚠️ Use strong, unique passwords for databases
- ⚠️ Enable 2FA on your Railway account
- ⚠️ Regularly update dependencies

---

Happy Deploying! 🚀
