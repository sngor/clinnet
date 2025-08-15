# CI/CD with GitHub Actions

This repo includes two workflows:

- `.github/workflows/ci.yml` — Runs on PRs and pushes to `main`.
  - Backend: Node (Jest) + Python (pytest) tests
  - Frontend: ESLint, Vitest, and build
- `.github/workflows/cd.yml` — Deploys backend (AWS SAM) and frontend (S3+CloudFront).
  - Triggers on `workflow_dispatch` or push to `main` affecting `backend/` or `frontend/`.

## Required GitHub Secrets

Configure these in your repository settings:

- `AWS_DEPLOY_ROLE_ARN` — IAM role ARN to assume via OIDC. Must allow:
  - CloudFormation, Lambda, API Gateway, DynamoDB, S3, CloudFront
- `AWS_REGION` — e.g. `us-east-2` (optional, defaults to `us-east-2`)
- `VITE_API_URL` — Backend API endpoint for the frontend `.env`

## AWS OIDC Setup (summary)

1. Create an IAM role with a trust policy for GitHub OIDC (`token.actions.githubusercontent.com`).
2. Allow assumption from your repo (`repo:sngor/Clinnet-EMR:ref:refs/heads/main`).
3. Attach permissions for SAM deploy and S3/CloudFront sync/invalidation.
4. Save the Role ARN as `AWS_DEPLOY_ROLE_ARN` secret.

## Environments

The SAM template uses the `Environment` parameter. The `cd.yml` workflow sets it from the input (default `dev`). Adjust stack name/region in `backend/samconfig.toml` or override in the job.

## Notes

- Frontend deploy reads the `FrontendBucketName` and `CloudFrontDistributionDomain` outputs from the SAM stack.
- If you use a custom domain/APIs per env, set `VITE_API_URL` per environment or add environment-specific envs/secrets.
- You can skip the frontend deployment in `workflow_dispatch` via the `frontend` input.
