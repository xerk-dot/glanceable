#!/bin/bash

# Glanceable Backend Deployment Script
# This script builds and deploys the FastAPI backend to Google Cloud Run

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="hanover-464416"
REGION="us-central1"
SERVICE_NAME="glanceable-backend"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"
INSTANCE_NAME="glanceable-db"

echo -e "${GREEN}Starting deployment of Glanceable Backend...${NC}"

# Check if required environment variables are set
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}Error: PROJECT_ID not set${NC}"
    exit 1
fi

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI not found. Please install Google Cloud SDK.${NC}"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo -e "${RED}Error: Not authenticated with gcloud. Please run: gcloud auth login${NC}"
    exit 1
fi

# Set the project
echo -e "${YELLOW}Setting project to $PROJECT_ID...${NC}"
gcloud config set project $PROJECT_ID

# Build and push Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
gcloud builds submit --tag $IMAGE_NAME

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Docker build failed${NC}"
    exit 1
fi

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --max-instances 10 \
    --min-instances 0 \
    --concurrency 80 \
    --timeout 300 \
    --add-cloudsql-instances $PROJECT_ID:$REGION:$INSTANCE_NAME

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Cloud Run deployment failed${NC}"
    exit 1
fi

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo -e "${GREEN}Deployment successful!${NC}"
echo -e "${GREEN}Service URL: $SERVICE_URL${NC}"
echo -e "${GREEN}Health check: $SERVICE_URL/health${NC}"

# Optional: Test the health endpoint
echo -e "${YELLOW}Testing health endpoint...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/health" | grep -q "200"; then
    echo -e "${GREEN}Health check passed!${NC}"
else
    echo -e "${YELLOW}Health check failed or service not ready yet${NC}"
fi

echo -e "${GREEN}Backend deployment completed successfully!${NC}"