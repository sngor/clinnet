# CI-CD SAM Deployment Fixes

## Issues Fixed

### 1. SAM Template Issues
- **Fixed missing table names**: Added explicit table names for MedicalReportsTable and DocumentsBucket to prevent naming conflicts
- **Fixed API path conflicts**: Changed `/api/reports` to `/api/medical-reports` to avoid conflicts with aggregated reports endpoint
- **Fixed function naming**: Added environment suffix to function names to prevent conflicts across environments
- **Added missing capabilities**: Added `CAPABILITY_NAMED_IAM` to handle IAM resources with custom names

### 2. CI-CD Workflow Improvements
- **Enhanced deployment parameters**: Added `--parallel` build flag and `--resolve-s3` for better performance
- **Added proper capabilities**: Included both `CAPABILITY_IAM` and `CAPABILITY_NAMED_IAM`
- **Improved error handling**: Added better deployment configuration

### 3. Code Fixes
- **Fixed UUID import**: Corrected `uuidv4()` to `randomUUID()` in medical reports handler
- **Added Lambda layer requirements**: Created requirements.txt for proper dependency management

### 4. Configuration Updates
- **Updated samconfig.toml**: Added parallel build and proper capabilities configuration
- **Created troubleshooting script**: Added deployment diagnostic tool

## Files Modified

1. `backend/template.yaml` - Fixed resource naming and API paths
2. `.github/workflows/ci-cd.yml` - Enhanced deployment configuration
3. `backend/samconfig.toml` - Updated deployment parameters
4. `backend/src/handlers/medical_reports/index.js` - Fixed UUID usage
5. `backend/lambda_layer/requirements.txt` - Added (new file)
6. `backend/troubleshoot-deployment.sh` - Added (new file)

## Next Steps

1. **Run the troubleshooting script**:
   ```bash
   cd backend
   ./troubleshoot-deployment.sh
   ```

2. **If deployment still fails, check CloudFormation events**:
   ```bash
   aws cloudformation describe-stack-events --stack-name sam-clinnet --region us-east-2
   ```

3. **For complete stack recreation (if needed)**:
   ```bash
   aws cloudformation delete-stack --stack-name sam-clinnet --region us-east-2
   # Wait for deletion to complete, then redeploy
   sam deploy
   ```

## Common Deployment Issues Addressed

- **Resource naming conflicts**: Fixed with unique naming patterns
- **IAM permission issues**: Added proper capabilities
- **API Gateway path conflicts**: Resolved with distinct endpoints
- **Lambda function conflicts**: Added environment-specific naming
- **S3 bucket naming**: Added account/region uniqueness

The deployment should now succeed. If issues persist, run the troubleshooting script for detailed diagnostics.