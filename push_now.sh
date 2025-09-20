#!/bin/bash

echo "🚀 PUSHING TO: https://github.com/darksagae/PublicPulse.git"
echo "========================================================="
echo ""

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

echo "✅ Git repository found"
echo "✅ Remote configured: $(git remote get-url origin)"
echo ""

# Show current status
echo "📋 Current commits ready to push:"
git log --oneline -2
echo ""

# Try to push
echo "🔄 Attempting to push..."
echo ""

# This will prompt for credentials
git push -u origin main

echo ""
echo "🎉 Push completed! Check your repository at:"
echo "   https://github.com/darksagae/PublicPulse"
