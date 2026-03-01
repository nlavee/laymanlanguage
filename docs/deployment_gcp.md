# Google Cloud Platform (GCP) Deployment Guide

This guide details how to securely deploy `layman.vuishere.com` to GCP using Cloud Run, Cloud Build, and Google Secret Manager. This architecture ensures zero secrets are committed to source control and automates future deployments.

## Prerequisites
- A Google Cloud Platform account and active project.
- Google Cloud CLI (`gcloud`) installed and authenticated (`gcloud auth login`).
- Git repository synced with your local codebase.

## 1. Automated Infrastructure Setup
We have provided a setup script that automates the creation of Artifact Registry, Secret Manager keys, and IAM policy bindings.

Run the script from the root of the project:
```bash
./deploy_setup.sh
```

**What this script does:**
1. Enables necessary APIs (`run`, `cloudbuild`, `secretmanager`, `artifactregistry`, `iam`).
2. Creates a Docker repository named `layman-repo` in `us-central1`.
3. Provisions empty secret shells in Secret Manager for:
   - `JWT_SECRET`
   - `CLAUDE_API_KEY`
   - `GOOGLE_API_KEY`
   - `OPENAI_API_KEY`
   - `PRESENTON_API_KEY`
4. Grants the Compute Engine default service account (used by Cloud Run) the `Secret Accessor` role to pull these keys at runtime.

## 2. Uploading Secrets
You must manually upload your actual API keys into the empty secret shells created above.

For each secret, run:
```bash
echo -n "YOUR_ACTUAL_SECRET_VALUE" | gcloud secrets versions add SECRET_NAME --data-file=-
```

*Example:*
```bash
echo -n "sk-ant-api03-xxx" | gcloud secrets versions add CLAUDE_API_KEY --data-file=-
```

## 3. Deployment (CI/CD)
The project includes a `cloudbuild.yaml` file designed for automated deployments. 

### Triggering a Manual Build
To deploy immediately from your local machine using the current code state:
```bash
gcloud builds submit --config cloudbuild.yaml .
```

**The Build Pipeline:**
1. **Builds Backend**: Compiles the backend Dockerfile.
2. **Pushes Backend**: Uploads to Artifact Registry.
3. **Deploys Backend**: Spins up the backend on Cloud Run, attaching the LLM and JWT secrets natively. It captures the resulting public URL.
4. **Builds Frontend**: Injects the newly created Backend URL as `NEXT_PUBLIC_API_URL` during the Next.js static compilation.
5. **Pushes Frontend**: Uploads the Next.js container.
6. **Deploys Frontend**: Spins up the frontend on Cloud Run, attaching the `PRESENTON_API_KEY` secret.

### Setting up Continuous Deployment (Git Push)
To automate this so it deploys every time you push to GitHub:
1. Navigate to **Cloud Build -> Triggers** in the GCP Console.
2. Click **Create Trigger**.
3. Connect your GitHub/GitLab repository.
4. Set the event to **Push to a branch** (e.g., `^master$`).
5. Set Configuration to **Cloud Build configuration file (yaml or json)**.
6. Save and push code to test.

## 4. Secret Rotation & Access Control
- **Access Control:** By default, only the `Compute Engine default service account` can access these secrets. Avoid granting user accounts direct access unless necessary for debugging.
- **Rotation:** To rotate an API key, simply run the `gcloud secrets versions add` command again with the new key. Then, redeploy or restart the Cloud Run service to fetch the `latest` version. For automated rotation, you can configure Cloud Scheduler to trigger a Cloud Function that calls the LLM provider APIs and updates Secret Manager.

## 5. Environment Specific Configurations
If you wish to deploy a separate staging environment:
1. Create a new GCP project (e.g., `layman-staging-123`).
2. Run `./deploy_setup.sh` in the new project.
3. Use a separate `cloudbuild-staging.yaml` trigger tied to your `staging` git branch.