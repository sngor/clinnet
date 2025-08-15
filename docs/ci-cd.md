# CI/CD with GitHub Actions (Consolidated)

This repo uses a single, consolidated workflow:

- `.github/workflows/cd.yml` — CI and CD in one.
  - PRs and non-main pushes: run tests only (backend JS/Python, frontend lint/tests/build).
  - Push to `main` or manual dispatch: run tests, then deploy backend (AWS SAM) and frontend (S3 + CloudFront).

## Required GitHub Secrets

Configure these in your repository settings (Repository and Environment secrets):

- `AWS_DEPLOY_ROLE_ARN` — IAM role ARN to assume via OIDC. Must allow:
  - CloudFormation, Lambda, API Gateway, DynamoDB, S3, CloudFront
- `AWS_REGION` — e.g. `us-east-2` (optional, defaults to `us-east-2`)
- Frontend `.env` values (Environment-level secrets recommended):
  - `VITE_API_URL` or `VITE_API_ENDPOINT` — API base URL
  - `VITE_COGNITO_REGION`, `VITE_USER_POOL_ID`, `VITE_USER_POOL_CLIENT_ID`
  - Optional if app uses them: `VITE_S3_BUCKET`, `VITE_S3_REGION`
- (Legacy fallback, only if not using OIDC) `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`

## AWS OIDC Setup (summary)

1. Create an IAM role with a trust policy for GitHub OIDC (`token.actions.githubusercontent.com`).
2. Allow assumption from your repo (`repo:sngor/Clinnet-EMR:*`). Restrict to `main` if desired.
3. Attach permissions for SAM deploy and S3/CloudFront sync/invalidation.
4. Save the Role ARN as `AWS_DEPLOY_ROLE_ARN` secret.

## Environments

- Create GitHub Environments named `dev`, `test`, `prod` and put env-specific secrets there.
- The workflow sets the job environment from the manual input (default `dev`); on push to `main`, it defaults to `dev` unless you change it.
- Adjust SAM `stack_name`/`region` via `backend/samconfig.toml` or `sam deploy` flags in the workflow.

## Notes

- Frontend deploy uses `frontend/scripts/deploy-frontend.sh` and reads `FrontendBucketName` and `CloudFrontDistributionDomain` from the stack.
- Set per-environment API/Cognito/S3 secrets in GitHub Environments so the correct values are injected into `.env`.
- On PRs and non-main pushes, only tests run—no deployment.

## How to run

- Pull Request: open a PR → CI runs backend and frontend tests/build.
- Push to main: CI runs then CD deploys backend and frontend if tests pass.
- Manual: Actions → CI-CD → Run workflow → pick environment (dev/test/prod).

## Troubleshooting

- Missing OIDC role: add `AWS_DEPLOY_ROLE_ARN` or fallback credentials.
- API URL wrong: update `VITE_API_URL`/`VITE_API_ENDPOINT` in the target Environment.
- S3/CloudFront: ensure the role has permissions for S3 sync/cp and `cloudfront:CreateInvalidation`.
