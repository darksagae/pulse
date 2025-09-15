#!/bin/bash
# PublicPulse CLI Deployment Script
# Deploy to multiple platforms using CLI

echo "🚀 PublicPulse CLI Deployment Script"
echo "===================================="

# Check if we're in the backend directory
if [ ! -f "app_new.py" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

echo "✅ Found app_new.py - Ready to deploy"

# Function to deploy to Heroku (if available)
deploy_heroku() {
    echo "📦 Deploying to Heroku..."
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        echo "❌ Heroku CLI not installed. Install from: https://devcenter.heroku.com/articles/heroku-cli"
        return 1
    fi
    
    # Login to Heroku
    heroku login
    
    # Create app
    echo "Creating Heroku app..."
    heroku create publicpulse-backend-$(date +%s)
    
    # Set buildpack
    heroku buildpacks:set heroku/python
    
    # Deploy
    git push heroku main
    
    echo "✅ Deployed to Heroku!"
}

# Function to deploy to Fly.io
deploy_fly() {
    echo "📦 Deploying to Fly.io..."
    
    # Check if Fly CLI is installed
    if ! command -v fly &> /dev/null; then
        echo "❌ Fly CLI not installed. Install from: https://fly.io/docs/flyctl/"
        return 1
    fi
    
    # Login to Fly
    fly auth login
    
    # Create app
    echo "Creating Fly app..."
    fly launch --name publicpulse-backend --region ord
    
    echo "✅ Deployed to Fly.io!"
}

# Function to create Docker deployment
create_docker() {
    echo "🐳 Creating Docker setup..."
    
    cat > Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app_new.py .

EXPOSE 8000

CMD ["python", "app_new.py"]
EOF
    
    cat > .dockerignore << 'EOF'
__pycache__
*.pyc
.git
README.md
EOF
    
    echo "✅ Docker files created!"
    echo "   Build: docker build -t publicpulse-backend ."
    echo "   Run: docker run -p 8000:8000 publicpulse-backend"
}

# Main menu
echo ""
echo "Choose deployment option:"
echo "1) Deploy to Heroku"
echo "2) Deploy to Fly.io"
echo "3) Create Docker setup"
echo "4) Show manual deployment instructions"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        deploy_heroku
        ;;
    2)
        deploy_fly
        ;;
    3)
        create_docker
        ;;
    4)
        echo ""
        echo "📋 Manual Deployment Instructions:"
        echo ""
        echo "🔗 Railway: https://railway.app"
        echo "   1. Connect GitHub repo: darksagae/upload-app"
        echo "   2. Set root directory: backend"
        echo "   3. Deploy automatically"
        echo ""
        echo "🔗 Render: https://render.com"
        echo "   1. New Web Service"
        echo "   2. Connect GitHub: darksagae/upload-app"
        echo "   3. Root: backend, Start: python app_new.py"
        echo ""
        echo "🔗 Vercel: https://vercel.com"
        echo "   1. For Python APIs, use Vercel Functions"
        echo "   2. Or deploy frontend separately"
        ;;
    *)
        echo "❌ Invalid choice"
        ;;
esac

echo ""
echo "🎉 PublicPulse deployment script completed!"