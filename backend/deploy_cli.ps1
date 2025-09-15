# PublicPulse CLI Deployment Script for Windows PowerShell
# Deploy to multiple platforms using CLI

Write-Host "🚀 PublicPulse CLI Deployment Script" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Check if we're in the backend directory
if (-not (Test-Path "app_new.py")) {
    Write-Host "❌ Please run this script from the backend directory" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found app_new.py - Ready to deploy" -ForegroundColor Green

# Function to deploy to Vercel
function Deploy-Vercel {
    Write-Host "📦 Deploying to Vercel..." -ForegroundColor Yellow
    
    # Check if Vercel CLI is installed
    try {
        vercel --version | Out-Null
    }
    catch {
        Write-Host "❌ Vercel CLI not installed. Installing..." -ForegroundColor Red
        npm install -g vercel
    }
    
    # Login and deploy
    Write-Host "Logging in to Vercel..." -ForegroundColor Blue
    vercel login
    
    Write-Host "Deploying to Vercel..." -ForegroundColor Blue
    vercel --prod
    
    Write-Host "✅ Deployed to Vercel!" -ForegroundColor Green
}

# Function to create Docker setup
function Create-Docker {
    Write-Host "🐳 Creating Docker setup..." -ForegroundColor Yellow
    
    $dockerfileContent = @"
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app_new.py .

EXPOSE 8000

CMD ["python", "app_new.py"]
"@
    
    $dockerignoreContent = @"
__pycache__
*.pyc
.git
README.md
"@
    
    $dockerfileContent | Out-File -FilePath "Dockerfile" -Encoding UTF8
    $dockerignoreContent | Out-File -FilePath ".dockerignore" -Encoding UTF8
    
    Write-Host "✅ Docker files created!" -ForegroundColor Green
    Write-Host "   Build: docker build -t publicpulse-backend ." -ForegroundColor Cyan
    Write-Host "   Run: docker run -p 8000:8000 publicpulse-backend" -ForegroundColor Cyan
}

# Function to deploy using Git-based platforms
function Deploy-GitPlatforms {
    Write-Host "📦 Preparing Git-based deployment..." -ForegroundColor Yellow
    
    # Add and commit current changes
    git add .
    git commit -m "Deploy: PublicPulse backend ready for production"
    git push origin main
    
    Write-Host "✅ Code pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to Railway.app or Render.com" -ForegroundColor White
    Write-Host "2. Connect your GitHub repo: darksagae/upload-app" -ForegroundColor White
    Write-Host "3. Set root directory: backend" -ForegroundColor White
    Write-Host "4. Deploy automatically" -ForegroundColor White
}

# Function to install Heroku CLI and deploy
function Deploy-Heroku {
    Write-Host "📦 Deploying to Heroku..." -ForegroundColor Yellow
    
    # Check if Heroku CLI is installed
    try {
        heroku --version | Out-Null
    }
    catch {
        Write-Host "❌ Heroku CLI not installed." -ForegroundColor Red
        Write-Host "Download from: https://devcenter.heroku.com/articles/heroku-cli" -ForegroundColor Blue
        return
    }
    
    # Login to Heroku
    Write-Host "Logging in to Heroku..." -ForegroundColor Blue
    heroku login
    
    # Create app
    $appName = "publicpulse-backend-$(Get-Date -Format 'yyyyMMddHHmmss')"
    Write-Host "Creating Heroku app: $appName" -ForegroundColor Blue
    heroku create $appName
    
    # Set buildpack
    heroku buildpacks:set heroku/python --app $appName
    
    # Deploy
    Write-Host "Deploying to Heroku..." -ForegroundColor Blue
    git push heroku main
    
    Write-Host "✅ Deployed to Heroku!" -ForegroundColor Green
    Write-Host "URL: https://$appName.herokuapp.com" -ForegroundColor Cyan
}

# Main menu
Write-Host ""
Write-Host "Choose deployment option:" -ForegroundColor Cyan
Write-Host "1) Deploy to Heroku (if CLI installed)" -ForegroundColor White
Write-Host "2) Deploy to Vercel" -ForegroundColor White
Write-Host "3) Push to GitHub and deploy manually" -ForegroundColor White
Write-Host "4) Create Docker setup" -ForegroundColor White
Write-Host "5) Show manual deployment instructions" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    1 { Deploy-Heroku }
    2 { Deploy-Vercel }
    3 { Deploy-GitPlatforms }
    4 { Create-Docker }
    5 {
        Write-Host ""
        Write-Host "📋 Manual Deployment Instructions:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🔗 Railway: https://railway.app" -ForegroundColor Cyan
        Write-Host "   1. Connect GitHub repo: darksagae/upload-app" -ForegroundColor White
        Write-Host "   2. Set root directory: backend" -ForegroundColor White
        Write-Host "   3. Deploy automatically" -ForegroundColor White
        Write-Host ""
        Write-Host "🔗 Render: https://render.com" -ForegroundColor Cyan
        Write-Host "   1. New Web Service" -ForegroundColor White
        Write-Host "   2. Connect GitHub: darksagae/upload-app" -ForegroundColor White
        Write-Host "   3. Root: backend, Start: python app_new.py" -ForegroundColor White
        Write-Host ""
        Write-Host "🔗 Railway CLI (if quota available):" -ForegroundColor Cyan
        Write-Host "   railway login" -ForegroundColor White
        Write-Host "   railway init" -ForegroundColor White
        Write-Host "   railway up" -ForegroundColor White
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 PublicPulse deployment script completed!" -ForegroundColor Green