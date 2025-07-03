#!/bin/bash
# Quick Vercel Deployment Script for Real Estate API

echo "🚀 Starting Vercel Deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo ""
echo "🔗 Your API is now live!"
echo "📋 Next steps:"
echo "1. Copy your Vercel URL from the output above"
echo "2. Update frontend/.env with your new API URL"
echo "3. Test your API endpoints"
echo "4. Rebuild your mobile app"
echo ""
echo "🧪 Test your deployment:"
echo "curl https://your-vercel-url.vercel.app/api/health"