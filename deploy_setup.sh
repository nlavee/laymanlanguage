#!/bin/bash
set -e

PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
REPO_NAME="layman-repo"

echo "===================================================="
echo "Initializing GCP Project Setup for $PROJECT_ID"
echo "===================================================="

# 1. Enable necessary APIs
echo "Enabling APIs..."
gcloud services enable 
  secretmanager.googleapis.com 
  cloudbuild.googleapis.com 
  run.googleapis.com 
  artifactregistry.googleapis.com 
  iam.googleapis.com

# 2. Create Artifact Registry Repository if not exists
echo "Setting up Artifact Registry..."
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION >/dev/null 2>&1; then
  gcloud artifacts repositories create $REPO_NAME 
    --repository-format=docker 
    --location=$REGION 
    --description="Docker repository for layman application"
fi

# 3. Create Secrets (if they don't exist)
SECRETS=("JWT_SECRET" "CLAUDE_API_KEY" "GOOGLE_API_KEY" "OPENAI_API_KEY" "PRESENTON_API_KEY")

echo "Setting up Secret Manager..."
for SECRET in "${SECRETS[@]}"; do
  if ! gcloud secrets describe $SECRET >/dev/null 2>&1; then
    gcloud secrets create $SECRET --replication-policy="automatic"
    # To add value later: echo -n "my-secret-value" | gcloud secrets versions add $SECRET --data-file=-
    echo "Created secret $SECRET. Please add the actual value to Secret Manager."
  else
    echo "Secret $SECRET already exists."
  fi
done

# 4. Configure IAM permissions for Cloud Run Default Service Account
# Get the project number
PROJECT_NUM=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
COMPUTE_SERVICE_ACCOUNT="${PROJECT_NUM}-compute@developer.gserviceaccount.com"

echo "Granting Secret Accessor role to Compute Engine default service account..."
for SECRET in "${SECRETS[@]}"; do
  gcloud secrets add-iam-policy-binding $SECRET 
    --member="serviceAccount:${COMPUTE_SERVICE_ACCOUNT}" 
    --role="roles/secretmanager.secretAccessor" >/dev/null
done

echo "===================================================="
echo "GCP Infrastructure Setup Complete!"
echo "Next Steps:"
echo "1. Upload actual API keys to Google Secret Manager."
echo "2. Run 'gcloud builds submit --config cloudbuild.yaml' to deploy."
echo "===================================================="
