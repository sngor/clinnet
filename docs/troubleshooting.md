# Clinnet-EMR Troubleshooting Guide

This guide covers common issues, solutions, and monitoring/logs for the Clinnet-EMR system.

---

## Common Issues & Solutions

### 1. CI/CD Deployment Failures

- **Symptom**: GitHub Actions deployment fails
- **Solution**: Check the following:
  - AWS credentials are configured in GitHub secrets
  - `AWS_DEPLOY_ROLE_ARN` is set for OIDC authentication
  - Environment-specific secrets are configured
  - Deployment uses the unified script: `python backend/deployment/deploy.py`

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
