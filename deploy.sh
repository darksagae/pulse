#!/bin/bash

# PublicPulse Deployment Script
echo "🚀 PublicPulse Deployment Script"
echo "================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Please run:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

# Check if changes are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Prepare for deployment'"
    echo "   git push"
    exit 1
fi

echo "✅ Git repository is clean and ready for deployment"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. 🔧 Backend Deployment (Railway):"
echo "   - Go to https://railway.app"
echo "   - Sign in with GitHub"
echo "   - Click 'New Project' → 'Deploy from GitHub repo'"
echo "   - Select your repository"
echo "   - Set root directory to 'backend'"
echo "   - Add environment variables in Railway dashboard"
echo ""
echo "2. 🌐 Frontend Deployment (Vercel):"
echo "   - Go to https://vercel.com"
echo "   - Sign in with GitHub"
echo "   - Click 'New Project' → Import repository"
echo "   - Set root directory to 'frontend'"
echo "   - Add REACT_APP_API_URL environment variable"
echo ""
echo "3. 🔗 Connect Frontend to Backend:"
echo "   - Get your Railway backend URL"
echo "   - Update Vercel's REACT_APP_API_URL to point to Railway"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
echo "🎉 Happy deploying!"
