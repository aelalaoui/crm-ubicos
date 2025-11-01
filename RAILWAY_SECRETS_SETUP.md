# Railway Secrets Setup Guide

This guide explains how to configure the required secrets for Railway deployment in your GitHub repository.

## Required GitHub Secrets

Your CI/CD pipeline requires the following secrets to be configured in GitHub:

1. **RAILWAY_TOKEN** - Your Railway project token
2. **RAILWAY_API_SERVICE** - The Railway service ID for the API
3. **RAILWAY_WEB_SERVICE** - The Railway service ID for the Web app

## Step 1: Get Your Railway Token

### Option A: Using Railway CLI (Recommended)

1. Install Railway CLI if you haven't already:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link your project:
   ```bash
   railway link
   ```

4. Get your project token:
   ```bash
   railway token
   ```
   
   This will output your project token. Copy it for the next step.

### Option B: Using Railway Dashboard

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project
3. Go to **Settings** → **Tokens**
4. Click **Create Token**
5. Give it a name (e.g., "GitHub Actions")
6. Copy the generated token

## Step 2: Get Your Service IDs

### Using Railway CLI:

1. List all services in your project:
   ```bash
   railway service list
   ```

2. Note down the service IDs for:
   - Your API service (e.g., `solana-trading-crm-api`)
   - Your Web service (e.g., `solana-trading-crm-web`)

### Using Railway Dashboard:

1. Go to your Railway project
2. Click on your API service
3. The service ID is in the URL: `https://railway.app/project/{project-id}/service/{service-id}`
4. Copy the service ID
5. Repeat for your Web service

## Step 3: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets one by one:

### RAILWAY_TOKEN
- **Name:** `RAILWAY_TOKEN`
- **Value:** Your Railway project token from Step 1

### RAILWAY_API_SERVICE
- **Name:** `RAILWAY_API_SERVICE`
- **Value:** Your API service ID from Step 2

### RAILWAY_WEB_SERVICE
- **Name:** `RAILWAY_WEB_SERVICE`
- **Value:** Your Web service ID from Step 2

## Step 4: Verify Setup

After adding all secrets:

1. Go to **Actions** tab in your GitHub repository
2. Find the latest workflow run
3. Click **Re-run all jobs** to test the deployment
4. Check that the deployment steps complete successfully

## Troubleshooting

### Error: "Project Token not found"
- Make sure `RAILWAY_TOKEN` is correctly set in GitHub Secrets
- Verify the token is still valid in Railway Dashboard
- Try generating a new token if the old one expired

### Error: "Service not found"
- Verify the service IDs are correct
- Make sure the services exist in your Railway project
- Check that you're using the service name or ID correctly

### Error: "Unauthorized"
- Your Railway token may have expired
- Generate a new token and update the GitHub secret
- Make sure the token has the correct permissions

## Alternative: Manual Deployment

If you prefer to deploy manually instead of using CI/CD:

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link your project:
   ```bash
   railway link
   ```

4. Deploy API:
   ```bash
   cd apps/api
   railway up
   ```

5. Deploy Web:
   ```bash
   cd apps/web
   railway up
   ```

## Next Steps

Once your secrets are configured:

1. Push your code to the `main` or `master` branch
2. The CI/CD pipeline will automatically:
   - Run tests
   - Lint and type-check your code
   - Build your applications
   - Deploy to Railway

3. Monitor the deployment in the **Actions** tab

## Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI Documentation](https://docs.railway.app/develop/cli)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
