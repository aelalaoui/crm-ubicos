#!/bin/bash

# Railway Deployment Setup Script
# This script helps you set up your Railway deployment

echo "🚂 Railway Deployment Setup"
echo "=============================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed."
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed successfully!"
else
    echo "✅ Railway CLI is already installed"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Login to Railway:"
echo "   railway login"
echo ""
echo "2. Create a new project (or link existing):"
echo "   railway init"
echo ""
echo "3. Add PostgreSQL database:"
echo "   railway add --database postgresql"
echo ""
echo "4. Add Redis database:"
echo "   railway add --database redis"
echo ""
echo "5. Set environment variables:"
echo "   railway variables set JWT_SECRET=your-secret-key"
echo "   railway variables set JWT_REFRESH_SECRET=your-refresh-secret"
echo "   railway variables set NODE_ENV=production"
echo ""
echo "6. Deploy your application:"
echo "   railway up"
echo ""
echo "7. Run database migrations:"
echo "   railway run npm run prisma:migrate:deploy --workspace=apps/api"
echo ""
echo "📚 For detailed instructions, see RAILWAY_DEPLOYMENT.md"
echo ""
