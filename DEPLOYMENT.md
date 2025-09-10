# 🚀 Deployment Guide

This guide will help you deploy the PublicPulse Document Processing System to Railway (backend) and Vercel (frontend).

## 📋 Prerequisites

- GitHub account
- Railway account (free tier available)
- Vercel account (free tier available)
- Your project pushed to GitHub

## 🔧 Backend Deployment (Railway)

### Step 1: Prepare Backend
The backend is already prepared with:
- ✅ `requirements.txt` with all dependencies
- ✅ `Procfile` for Railway deployment
- ✅ `railway.json` configuration
- ✅ Environment variable support

### Step 2: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**
6. **Select the `backend` folder as the root directory**

### Step 3: Configure Environment Variables

In Railway dashboard, go to your project → Variables tab and add:

```
PORT=8000
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
```

### Step 4: Deploy
Railway will automatically:
- Install dependencies from `requirements.txt`
- Start the server using the `Procfile`
- Provide you with a public URL

**Your backend will be available at:** `https://your-app-name.railway.app`

## 🌐 Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
The frontend is already prepared with:
- ✅ Environment variable support (`REACT_APP_API_URL`)
- ✅ `vercel.json` configuration
- ✅ Build configuration

### Step 2: Deploy to Vercel

1. **Go to [Vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Import your repository**
5. **Set the root directory to `frontend`**
6. **Configure build settings:**
   - Framework Preset: `Create React App`
   - Build Command: `npm run build`
   - Output Directory: `build`

### Step 3: Configure Environment Variables

In Vercel dashboard, go to your project → Settings → Environment Variables and add:

```
REACT_APP_API_URL=https://your-backend-app.railway.app
```

### Step 4: Deploy
Vercel will automatically:
- Install dependencies
- Build the React app
- Deploy to a global CDN

**Your frontend will be available at:** `https://your-app-name.vercel.app`

## 🔗 Connecting Frontend to Backend

1. **Get your Railway backend URL** (e.g., `https://publicpulse-backend.railway.app`)
2. **Update Vercel environment variable:**
   - Go to Vercel dashboard → Settings → Environment Variables
   - Set `REACT_APP_API_URL` to your Railway backend URL
3. **Redeploy the frontend** (Vercel will automatically redeploy when you update environment variables)

## 🧪 Testing Your Deployment

### Backend Health Check
```bash
curl https://your-backend-app.railway.app/health
```

Expected response:
```json
{"status":"healthy","message":"API is running"}
```

### Frontend Test
1. Visit your Vercel URL
2. Try submitting a document
3. Check if it connects to the backend

## 🔧 Troubleshooting

### Backend Issues
- Check Railway logs for errors
- Verify all environment variables are set
- Ensure `requirements.txt` has all dependencies

### Frontend Issues
- Check Vercel build logs
- Verify `REACT_APP_API_URL` is set correctly
- Check browser console for CORS errors

### CORS Issues
If you get CORS errors, update the backend's `ALLOWED_ORIGINS` environment variable in Railway to include your Vercel domain.

## 📊 Monitoring

### Railway
- View logs in Railway dashboard
- Monitor resource usage
- Set up alerts

### Vercel
- View build logs
- Monitor performance
- Check analytics

## 🔄 Updates

To update your deployment:
1. Push changes to GitHub
2. Railway and Vercel will automatically redeploy
3. Update environment variables if needed

## 💰 Cost

- **Railway**: Free tier includes 500 hours/month
- **Vercel**: Free tier includes unlimited static deployments
- **Total cost**: $0/month for small projects

## 🎉 Success!

Once deployed, you'll have:
- ✅ Backend API running on Railway
- ✅ Frontend app running on Vercel
- ✅ Full document processing workflow
- ✅ Global CDN for fast loading
- ✅ Automatic deployments from GitHub
