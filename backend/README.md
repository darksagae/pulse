# PublicPulse Backend API v2.0

A complete document management system for citizens, officials, and administrators.

## 🚀 Quick Deploy

### Railway Deployment (Ready Now!)
1. **Go to [Railway.app](https://railway.app)**
2. **New Project** → **Deploy from GitHub repo**
3. **Select**: `darksagae/upload-app`
4. **Root Directory**: `backend`
5. **Environment Variables**:
   ```
   PORT=8000
   ```
6. **Deploy** - Railway will use `app_new.py` automatically

### Render.com Deployment (Alternative)
1. **Go to [Render.com](https://render.com)**
2. **New Web Service** → **Connect GitHub**
3. **Repository**: `darksagae/upload-app`
4. **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app_new.py`

## ✨ Features

- **Complete Authentication System** - Citizen, Official, Admin roles
- **Document Management** - Submit, review, approve workflow
- **Mock AI Integration** - Document analysis, quality scoring, fraud detection
- **Production Ready** - Health checks, error handling, CORS
- **Auto-Generated Docs** - Visit `/docs` endpoint

## 📱 API Endpoints

### Authentication
- `POST /auth/register-citizen` - Register new citizen
- `POST /auth/login-citizen` - Citizen login
- `POST /auth/admin-login` - Admin login (admin@publicpulse.com / admin123)
- `POST /auth/register-official` - Register official
- `POST /auth/login-official` - Official login

### Document Management
- `POST /api/users/citizen/submit-document` - Submit document
- `GET /api/users/citizen/my-documents` - Get my documents
- `GET /api/users/official/documents` - Get documents to review
- `POST /api/users/official/documents/{id}/extract` - Extract document info
- `POST /api/users/official/documents/{id}/review` - Official review
- `GET /api/admin/documents` - Get all documents (admin)
- `POST /api/admin/documents/{id}/review` - Admin review
- `GET /admin/stats` - System statistics

### System
- `GET /` - API information
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation

## 🧪 Test After Deployment

```bash
# Health check
curl https://your-app.railway.app/health

# API info
curl https://your-app.railway.app/

# View interactive docs
# Visit: https://your-app.railway.app/docs
```

## 🛠️ Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the new clean version
python app_new.py
```

API available at: `http://localhost:8000`
Docs available at: `http://localhost:8000/docs`

## 🎯 Deployment Status

✅ **Ready for Railway** - Single file app, minimal dependencies
✅ **Ready for Render** - Clean configuration
✅ **Tested Locally** - All endpoints working
✅ **Production Features** - Error handling, health checks
✅ **Complete API** - All PublicPulse functionality
