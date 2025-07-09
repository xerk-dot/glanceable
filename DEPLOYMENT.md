# Deployment Guide

## Backend Deployment to Google Cloud Platform

### Prerequisites
1. Install Google Cloud CLI: https://cloud.google.com/sdk/docs/install
2. Authenticate with GCP: `gcloud auth login`
3. Create a new GCP project or select an existing one
4. Enable App Engine API for your project

### Step 1: Deploy Backend to GCP

1. Navigate to the backend directory:
   ```bash
   cd python-backend
   ```

2. Set your GCP project ID:
   ```bash
   export GCLOUD_PROJECT=your-project-id
   gcloud config set project your-project-id
   ```

3. Initialize App Engine (if not already done):
   ```bash
   gcloud app create --region=us-central1
   ```

4. Update the OpenAI API key in `app.yaml`:
   ```bash
   # Edit app.yaml and replace 'your-openai-api-key-here' with your actual key
   nano app.yaml
   ```

5. Deploy using the deployment script:
   ```bash
   ./deploy.sh
   ```

   Or manually:
   ```bash
   python3 init_db.py  # Initialize database
   gcloud app deploy --quiet
   ```

6. After deployment, note the URL (will be: `https://your-project-id.appspot.com`)

### Step 2: Update Frontend Configuration

1. In your Vercel dashboard for the frontend (https://glanceable.vercel.app/):
   - Go to Settings → Environment Variables
   - Add/Update: `API_URL` = `https://your-project-id.appspot.com`
   - Add/Update: `NEXT_PUBLIC_API_URL` = `https://your-project-id.appspot.com`

2. Redeploy your frontend on Vercel to pick up the new environment variables

### Step 3: Test the Connection

1. Visit your backend health endpoint: `https://your-project-id.appspot.com/health`
2. Visit your frontend: `https://glanceable.vercel.app/`
3. Check that the dashboard loads data from the backend

### Configuration Files Created

- `python-backend/app.yaml` - App Engine configuration
- `python-backend/main.py` - Entry point for App Engine
- `python-backend/.gcloudignore` - Files to exclude from deployment
- `python-backend/deploy.sh` - Deployment script

### Important Notes

1. **CORS Configuration**: The backend is configured to accept requests from:
   - `https://glanceable.vercel.app`
   - `http://localhost:3000` (for local development)

2. **Database**: Uses DuckDB file-based database that persists with the App Engine instance

3. **Environment Variables**: Set in `app.yaml`:
   - `FLASK_ENV=production`
   - `ALLOWED_ORIGINS=https://glanceable.vercel.app,http://localhost:3000`

4. **Scaling**: Configured for automatic scaling (1-10 instances)

### Monitoring and Debugging

```bash
# View logs
gcloud app logs tail -s default

# Open in browser
gcloud app browse

# List versions
gcloud app versions list

# SSH into instance (if needed)
gcloud app instances ssh [INSTANCE_ID] --service=default --version=[VERSION_ID]
```

### Cost Optimization

- App Engine automatically scales down to 0 instances when not in use
- DuckDB provides efficient storage without needing a separate database service
- Current configuration uses minimal resources (1 CPU, 1GB RAM)

### Security Considerations

1. **Never commit secrets to Git**: The `.env` file is gitignored to prevent accidental commits
2. **Update secrets in app.yaml**: Before deployment, replace placeholder values:
   - `SECRET_KEY`: Already generated (or create a new one)
   - `OPENAI_API_KEY`: Replace with your actual OpenAI API key
3. **Consider Google Secret Manager**: For production, use Secret Manager instead of environment variables:
   ```bash
   gcloud secrets create openai-api-key --data-file=<(echo "your-key-here")
   ```
4. **Review CORS origins**: Ensure only trusted domains are in `ALLOWED_ORIGINS`

### Troubleshooting

1. **CORS Issues**: Ensure your frontend domain is in `ALLOWED_ORIGINS`
2. **Database Issues**: Check that `init_db.py` runs successfully during deployment
3. **Import Errors**: Verify all dependencies are in `requirements.txt`

### Next Steps After Deployment

1. Set up monitoring and alerting
2. Configure custom domain (optional)
3. Set up CI/CD pipeline for automatic deployments
4. Consider using Cloud SQL for production database (optional) 