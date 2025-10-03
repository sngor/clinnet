# Clinnet-EMR Troubleshooting Guide

This guide covers common issues, solutions, and monitoring/logs for the Clinnet-EMR system.

---

## Common Issues & Solutions

### 1. CI/CD Deployment Failures

- **Symptom**: "Credentials could not be loaded" error
- **Solution**: Configure AWS authentication in GitHub secrets:

  - **Option 1 (Recommended)**: Set `AWS_DEPLOY_ROLE_ARN` for OIDC authentication
  - **Option 2**: Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
  - Ensure secrets are configured in the correct environment (dev/test/prod)

- **Symptom**: Tests failing in CI
- **Solution**: Tests are optional and will be skipped if not configured

  - Frontend tests require `npm run lint` and `npm run test` scripts
  - Backend tests require `pytest` and test files in `tests/` directory
  - Use the "Validate" workflow to check project structure

- **Symptom**: "npm ci can only install packages when your package.json and package-lock.json are in sync"
- **Solution**: Lock file is out of sync with dependencies

  - Remove workspace configuration if not using npm workspaces properly
  - Delete `package-lock.json` and run `npm install` to regenerate
  - The test workflow will automatically fallback to `npm install` if `npm ci` fails

- **Symptom**: "Could not resolve '../../../mock/mockAppointments'" build errors
- **Solution**: Mock files were removed during cleanup but imports still exist
  - Mock data has been moved inline to components that need it
  - Check for any remaining imports from `../mock/` directories
  - Replace with inline mock data or remove if not needed

### 2. CORS Errors

- **Symptom**: Browser console shows CORS policy errors
- **Solution**: Ensure API Gateway and Lambda return proper CORS headers on all responses

### 2. S3 Access Denied

- **Symptom**: 403 Forbidden errors when accessing S3
- **Solution**: Check IAM role for all required S3 permissions (including `s3:HeadObject`)

### 3. Image Upload Fails

- **Symptom**: Upload returns 500 errors
- **Solution**: Check CloudWatch logs for Lambda errors

### 4. Frontend Errors

- **Symptom**: "Failed to parse error response" or generic error messages
- **Solution**: Ensure backend returns valid JSON error responses with CORS headers

### 5. Node Version Issues

- **Symptom**: Build or dependency errors
- **Solution**: Use Node.js 18 (see `frontend/scripts/fix-node-version.sh`)

### 6. Dependency Problems

- **Symptom**: Build fails due to missing or outdated packages
- **Solution**: Run `frontend/scripts/update-dependencies.sh`

---

## Monitoring & Logs

- **CloudWatch Logs**: `/aws/lambda/sam-clinnet-*-ProfileImage*`
- **API Gateway Logs**: Enable in API Gateway console
- **Frontend Console**: Use browser developer tools

---

For deployment and more details, see `docs/deployment.md` and `docs/profile-image-system.md`.
