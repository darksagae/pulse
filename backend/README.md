# PublicPulse Backend API

This is the backend API for the PublicPulse Document Processing System.

## Features

- Document submission and processing
- AI-powered document analysis
- User authentication and role management
- Department-based document routing
- Real-time status updates

## Deployment on Railway

1. **Connect your GitHub repository to Railway**
2. **Set environment variables in Railway dashboard:**
   - `PORT` (automatically set by Railway)
   - `GEMINI_API_KEY` (optional, for AI features)
   - `OPENROUTER_API_KEY` (optional, for AI features)
   - `ALLOWED_ORIGINS` (set to your frontend domain)

3. **Deploy**: Railway will automatically build and deploy using the Procfile

## API Endpoints

- `GET /health` - Health check
- `GET /docs` - API documentation
- `POST /api/users/citizen/submit-document` - Submit document
- `GET /api/users/official/documents/department/{dept}` - Get department documents
- `POST /api/users/official/documents/{id}/extract` - Extract document information
- `POST /api/users/official/documents/{id}/assign` - Assign document to official
- `POST /api/users/official/documents/{id}/review` - Submit official review
- `POST /api/users/admin/documents/{id}/admin-review` - Admin review

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
python main.py
```

The API will be available at `http://localhost:8000`
