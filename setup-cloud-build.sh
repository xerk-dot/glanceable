#!/bin/bash

# Setup Cloud Build Trigger for Glanceable Backend
# This script creates a Cloud Build trigger that automatically deploys on git commits

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="hanover-464416"
REPO_NAME="glanceable"
BRANCH_NAME="main"
TRIGGER_NAME="glanceable-backend-deploy"

echo -e "${GREEN}Setting up Cloud Build trigger for Glanceable Backend...${NC}"

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

# Enable required APIs
echo -e "${YELLOW}Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Grant Cloud Build service account permissions
echo -e "${YELLOW}Granting Cloud Build permissions...${NC}"
CLOUD_BUILD_SA=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")@cloudbuild.gserviceaccount.com

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$CLOUD_BUILD_SA" \
    --role="roles/run.developer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$CLOUD_BUILD_SA" \
    --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$CLOUD_BUILD_SA" \
    --role="roles/iam.serviceAccountUser"

echo -e "${GREEN}Cloud Build setup completed!${NC}"

echo -e "${YELLOW}To create the trigger, you need to:${NC}"
echo -e "1. Go to Google Cloud Console -> Cloud Build -> Triggers"
echo -e "2. Click 'Create Trigger'"
echo -e "3. Configure the trigger with these settings:"
echo -e "   - Name: $TRIGGER_NAME"
echo -e "   - Repository: Connect your GitHub repository"
echo -e "   - Branch: $BRANCH_NAME"
echo -e "   - Configuration: Cloud Build configuration file (yaml or json)"
echo -e "   - Cloud Build configuration file location: cloudbuild.yaml"
echo -e "4. Click 'Create'"

echo -e "${GREEN}Alternatively, you can use the manual deployment script:${NC}"
echo -e "cd python-backend && ./deploy.sh"

echo -e "${GREEN}Setup completed successfully!${NC}"