# Railway Deployment Guide

This guide will help you deploy the Solana Trading CRM application to Railway using CI/CD.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub repository with your code
- Railway CLI installed locally (optional, for manual deployment)

## Step 1: Create Railway Project

1. Go to https://railway.app and sign in
2. Click "New Project"
3. Select "Empty Project"
4. Name your project: `solana-trading-crm`

## Step 2: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a PostgreSQL instance
4. Note: The `DATABASE_URL` will be automatically available as an environment variable

## Step 3: Add Redis Database

1. Click "New" again
2. Select "Database" → "Add Redis"
3. Railway will automatically create a Redis instance
4. Note: The `REDIS_URL` will be automatically available as an environment variable

## Step 4: Create API Service

1. Click "New" → "GitHub Repo"
2. Connect your GitHub repository
3. Select your repository
4. Railway will detect it as a Node.js project
5. Configure the service:
   - **Name**: `api`
   - **Root Directory**: Leave empty (monorepo setup)
   - **Build Command**: `npm run build:api`
   - **Start Command**: `npm run start:api`

### API Environment Variables

Add these environment variables to your API service:

```env
# Database (automatically provided by Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (automatically provided by Railway)
REDIS_URL=${{Redis.REDIS_URL}}

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Application
NODE_ENV=production
PORT=3001

# CORS
CORS_ORIGIN=https://your-frontend-domain.railway.app

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Sniperoo API (for Phase 2)
SNIPEROO_API_URL=https://api.sniperoo.com
SNIPEROO_API_KEY=your-sniperoo-api-key
```

## Step 5: Create Web Service

1. Click "New" → "GitHub Repo"
2. Select the same repository
3. Configure the service:
   - **Name**: `web`
   - **Root Directory**: Leave empty
   - **Build Command**: `npm run build:web`
   - **Start Command**: `npm run start:web`

### Web Environment Variables

Add these environment variables to your Web service:

```env
# API URLs (use your Railway API service URL)
NEXT_PUBLIC_API_URL=https://your-api-service.railway.app
NEXT_PUBLIC_WS_URL=wss://your-api-service.railway.app

# Node Environment
NODE_ENV=production
```

## Step 6: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Add the following secrets:

### Required Secrets:

- **RAILWAY_TOKEN**: 
  - Get it from Railway: Settings → Tokens → Create Token
  - Copy the token value

- **RAILWAY_API_SERVICE**:
  - Go to your API service in Railway
  - Copy the service ID from the URL or service settings
  
- **RAILWAY_WEB_SERVICE**:
  - Go to your Web service in Railway
  - Copy the service ID from the URL or service settings

## Step 7: Configure Railway Services

### For API Service:

1. Go to your API service in Railway
2. Click on "Settings"
3. Under "Deploy", set:
   - **Watch Paths**: `apps/api/**`, `package.json`, `package-lock.json`
   - **Build Command**: `npm ci && npm run prisma:generate && npm run build:api`
   - **Start Command**: `npm run start:api`
4. Under "Networking":
   - Enable "Public Networking"
   - Note the generated domain (e.g., `api-production-xxxx.up.railway.app`)

### For Web Service:

1. Go to your Web service in Railway
2. Click on "Settings"
3. Under "Deploy", set:
   - **Watch Paths**: `apps/web/**`, `package.json`, `package-lock.json`
   - **Build Command**: `npm ci && npm run build:web`
   - **Start Command**: `npm run start:web`
4. Under "Networking":
   - Enable "Public Networking"
   - Note the generated domain (e.g., `web-production-xxxx.up.railway.app`)

## Step 8: Update Environment Variables

After getting your service URLs:

1. Update API service `CORS_ORIGIN` with your Web service URL
2. Update Web service `NEXT_PUBLIC_API_URL` with your API service URL
3. Update Web service `NEXT_PUBLIC_WS_URL` with your API service URL (use `wss://` instead of `https://`)

## Step 9: Run Database Migrations

You have two options:

### Option A: Using Railway CLI (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Select your API service
railway service

# Run migrations
railway run npm run prisma:migrate:deploy --workspace=apps/api
```

### Option B: Using Railway Dashboard

1. Go to your API service
2. Click on "Settings" → "Deploy"
3. Add a "Deploy Hook" or use the Railway CLI in the service shell

## Step 10: Deploy via CI/CD

Now, every time you push to `main` or `master` branch:

1. GitHub Actions will run tests
2. If tests pass, it will automatically deploy to Railway
3. Railway will build and deploy both services

### Manual Deployment (Optional)

If you want to deploy manually:

```bash
# Deploy API
railway up --service=api

# Deploy Web
railway up --service=web
```

## Step 11: Verify Deployment

1. **Check API Health**:
   - Visit: `https://your-api-domain.railway.app/api/health`
   - Should return: `{"status":"ok"}`

2. **Check API Documentation**:
   - Visit: `https://your-api-domain.railway.app/api/docs`
   - Should show Swagger UI

3. **Check Web Application**:
   - Visit: `https://your-web-domain.railway.app`
   - Should show the login page

## Troubleshooting

### Build Fails

1. Check Railway logs in the service dashboard
2. Ensure all environment variables are set correctly
3. Verify that `DATABASE_URL` is properly connected

### Database Connection Issues

1. Ensure PostgreSQL service is running
2. Check that `DATABASE_URL` is properly referenced: `${{Postgres.DATABASE_URL}}`
3. Run migrations: `railway run npm run prisma:migrate:deploy --workspace=apps/api`

### CORS Errors

1. Update API `CORS_ORIGIN` to match your Web service URL
2. Ensure the URL doesn't have a trailing slash
3. Redeploy the API service

### Environment Variables Not Loading

1. Restart the service after adding environment variables
2. Check that variable names match exactly (case-sensitive)
3. For Next.js variables, ensure they start with `NEXT_PUBLIC_`

## Monitoring

### Railway Dashboard

- View logs in real-time
- Monitor resource usage
- Check deployment history

### Health Checks

Set up health check endpoints:

- API: `https://your-api-domain.railway.app/api/health`
- Web: `https://your-web-domain.railway.app/api/health`

## Scaling

Railway automatically scales based on usage. To configure:

1. Go to service Settings
2. Under "Resources", adjust:
   - Memory limit
   - CPU allocation
   - Replicas (for horizontal scaling)

## Cost Optimization

- Use Railway's free tier for development
- Monitor usage in the billing dashboard
- Set up usage alerts
- Consider using Railway's sleep mode for non-production services

## Custom Domains (Optional)

1. Go to service Settings → Networking
2. Click "Add Custom Domain"
3. Enter your domain
4. Configure DNS records as shown
5. Wait for SSL certificate provisioning

## Backup Strategy

### Database Backups

Railway automatically backs up PostgreSQL databases. To create manual backups:

```bash
railway run pg_dump $DATABASE_URL > backup.sql
```

### Restore from Backup

```bash
railway run psql $DATABASE_URL < backup.sql
```

## Security Checklist

- [ ] Change all default secrets (JWT_SECRET, etc.)
- [ ] Enable CORS with specific origins
- [ ] Set up rate limiting
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (automatic with Railway)
- [ ] Set up monitoring and alerts
- [ ] Regular security updates

## Next Steps

1. Set up monitoring with Railway's built-in tools
2. Configure custom domains
3. Set up staging environment
4. Implement database backup strategy
5. Add performance monitoring
6. Set up error tracking (e.g., Sentry)

## Support

- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: Create an issue in your repository

---

**Important Notes:**

- Always test in a staging environment first
- Keep your Railway token secure
- Monitor your usage to avoid unexpected costs
- Regularly update dependencies for security patches
