#!/bin/bash

# Deploy script for GCP App Engine
# Make sure you have gcloud CLI installed and authenticated

echo "🚀 Deploying Glanceable Backend to Google Cloud Platform..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "."; then
    echo "❌ You are not authenticated with gcloud. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

# Set default project if not set
if [ -z "$GCLOUD_PROJECT" ]; then
    echo "📋 Please set your GCP project ID:"
    read -p "Enter your GCP Project ID: " PROJECT_ID
    gcloud config set project $PROJECT_ID
else
    PROJECT_ID=$GCLOUD_PROJECT
fi

echo "📦 Project ID: $PROJECT_ID"

# Initialize database if needed
echo "🗄️  Initializing database..."
python3 init_db.py

# Deploy to App Engine
echo "🚀 Deploying to App Engine..."
gcloud app deploy --quiet

# Get the deployed URL
DEPLOYED_URL=$(gcloud app describe --format="value(defaultHostname)")
echo "✅ Deployment successful!"
echo "🌐 Your backend is now available at: https://$DEPLOYED_URL"
echo ""
echo "📝 Next steps:"
echo "1. Update your frontend environment variables to use: https://$DEPLOYED_URL"
echo "2. Test the deployment by visiting: https://$DEPLOYED_URL/health"
echo ""
echo "🔧 Useful commands:"
echo "   gcloud app logs tail -s default  # View logs"
echo "   gcloud app browse                # Open in browser"
echo "   gcloud app versions list         # List versions" 