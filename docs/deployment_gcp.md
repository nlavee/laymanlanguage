# 🚀 Google Cloud Platform (GCP) Deployment Guide

This guide provides step-by-step instructions for deploying **layman.ai** to Google Cloud using Cloud Run, Artifact Registry, and Secret Manager.

## 🏗️ Technical Architecture
- **Frontend:** Next.js (SSG/SSR) on Cloud Run.
- **Backend:** FastAPI (Python 3.12) on Cloud Run.
- **Database:** SQLite Persistence via GCS Fuse Volume Mounts.
- **Security:** JWT-based Auth with HS256 algorithm.
- **Secrets:** Google Cloud Secret Manager.

---

## 🔐 1. Authentication & JWT Setup

The application uses JSON Web Tokens (JWT) for secure user sessions. 

### How it works:
- **Algorithm:** `HS256` (Symmetric)
- **Secret Key:** A long, random string stored in environments as `JWT_SECRET`.
- **Generation:** You can generate a secure secret locally:
  ```bash
  openssl rand -base64 32
  ```

### Configuration:
In production, **NEVER** hardcode the secret. It must be injected via Secret Manager.

---

## 🛠️ 2. GCP Infrastructure Setup

### A. Project Initialization
```bash
gcloud auth login
gcloud projects create layman-ai-alpha --set-as-default
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    cloudbuild.googleapis.com \
    secretmanager.googleapis.com \
    storage.googleapis.com
```

### B. Persistent Storage
Since Cloud Run is stateless, we mount a GCS bucket to persist the `brain/*.db` files.
```bash
gsutil mb gs://layman-persistence-prod/
```

### C. Secret Management
Upload your production secrets to GCP:
```bash
echo -n "your-random-jwt-secret" | gcloud secrets create JWT_SECRET --data-file=-
echo -n "your-anthropic-key" | gcloud secrets create ANTHROPIC_API_KEY --data-file=-
echo -n "your-google-key" | gcloud secrets create GOOGLE_API_KEY --data-file=-
```

---

## 📦 3. Containerization & Deployment

### Step 1: Deploy Backend
The backend requires the GCS bucket to be mounted to `/app/brain`.

```bash
gcloud run deploy layman-backend \
    --source ./backend \
    --region us-central1 \
    --allow-unauthenticated \
    --add-volume=name=brain-storage,type=cloud-storage,bucket=layman-persistence-prod \
    --add-volume-mount=volume=brain-storage,mount-path=/app/brain \
    --set-secrets="JWT_SECRET=JWT_SECRET:latest,ANTHROPIC_API_KEY=ANTHROPIC_API_KEY:latest,GOOGLE_API_KEY=GOOGLE_API_KEY:latest" \
    --set-env-vars="PYTHONPATH=/app"
```
**Note:** Note the service URL (e.g., `https://layman-backend-xyz.a.run.app`).

### Step 2: Deploy Frontend
The frontend requires the backend URL at **build time**.

```bash
gcloud run deploy layman-frontend \
    --source ./frontend \
    --region us-central1 \
    --allow-unauthenticated \
    --build-arg="NEXT_PUBLIC_API_URL=https://layman-backend-xyz.a.run.app"
```

---

## 🌐 4. Domain & SSL
1. Go to **Cloud Run > Manage Custom Domains**.
2. Map `layman.vuishere.com` to the `layman-frontend` service.
3. Update your DNS (A/AAAA/CNAME) records at your registrar.
4. Google will automatically provision an SSL certificate.

---

## 🔄 CI/CD (Optional)
Connect your GitHub repository to **Google Cloud Build** to enable automatic deployments on `git push`.
- Use the provided `Dockerfile` in each subdirectory.
- Ensure the `NEXT_PUBLIC_API_URL` is passed in the Cloud Build triggers.
