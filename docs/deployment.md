# 🚀 Deployment Guide

Complete guide for deploying Clinnet-EMR's serverless infrastructure and frontend application to AWS.

---

## 🎯 Deployment Overview

Clinnet-EMR uses a serverless architecture with the following AWS services:

- **AWS Lambda** for backend API functions
- **API Gateway** for REST API endpoints
- **DynamoDB** for data storage
- **Cognito** for user authentication
- **S3** for document storage and static hosting
- **CloudFront** for global content delivery

---

## 🛠️ Prerequisites

Before deploying, ensure you have:

| Requirement | Version | Notes                                  |
| ----------- | ------- | -------------------------------------- |
| AWS CLI     | Latest  | Configured with deployment permissions |
| SAM CLI     | Latest  | For infrastructure deployment          |
| Node.js     | 18.x    | For frontend build                     |
| Python      | 3.9+    | For Lambda functions                   |

### AWS Permissions Required

Your AWS user/role needs permissions for:

- Lambda (create, update, invoke)
- API Gateway (create, update, deploy)
- DynamoDB (create tables, read/write)
- Cognito (create user pools, manage users)
- S3 (create buckets, upload objects)
- CloudFront (create distributions)
- CloudFormation (create/update stacks)
- IAM (create roles for Lambda functions)

---

## 🖥️ Backend Deployment

### 1. Prepare Backend Environment

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Verify SAM CLI installation
sam --version
```

### 2. Configure Deployment Parameters

The SAM template supports different environments. For first-time deployment:

```bash
# Deploy with guided configuration
sam deploy --guided
```

You'll be prompted for:

- **Stack name**: `clinnet-emr-dev` (or your preferred name)
- **AWS Region**: `us-east-1` (or your preferred region)
- **Environment**: `dev`, `test`, or `prod`
- **Confirm changes**: `Y`
- **Allow SAM to create roles**: `Y`
- **Save parameters**: `Y`

### 3. Deploy Infrastructure

```bash
# Build Lambda functions
sam build

# Deploy infrastructure
sam deploy
```

### 4. Verify Deployment

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name clinnet-emr-dev

# Test API endpoints
curl https://your-api-id.execute-api.region.amazonaws.com/dev/services
```

### 5. Save Deployment Outputs

After successful deployment, save these values for frontend configuration:

```bash
# Get outputs
aws cloudformation describe-stacks --stack-name clinnet-emr-dev --query 'Stacks[0].Outputs'
```

Key outputs:

- **ClinicAPI**: API Gateway base URL
- **UserPoolId**: Cognito User Pool ID
- **UserPoolClientId**: Cognito User Pool Client ID
- **DocumentsBucket**: S3 bucket for documents
- **FrontendBucketName**: S3 bucket for frontend hosting
- **CloudFrontDistributionDomain**: CloudFront domain

---

## 💻 Frontend Deployment

### 1. Configure Environment

Create production environment file:

```bash
cd frontend

# Create .env.production
cat > .env.production << EOF
VITE_API_URL=https://your-api-id.execute-api.region.amazonaws.com/dev
VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_AWS_REGION=us-east-1
VITE_DOCUMENTS_BUCKET=clinnet-documents-dev-xxx
EOF
```

### 2. Build Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist/` directory with optimized production files.

### 3. Deploy to S3

```bash
# Get bucket name from SAM outputs
BUCKET_NAME=$(aws cloudformation describe-stacks \
  --stack-name clinnet-emr-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucketName`].OutputValue' \
  --output text)

# Upload built files
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Verify upload
aws s3 ls s3://$BUCKET_NAME
```

### 4. Invalidate CloudFront Cache

```bash
# Get distribution ID
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name clinnet-emr-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionDomain`].OutputValue' \
  --output text | cut -d'.' -f1)

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

---

## 🔧 Environment Management

### Development Environment

```bash
# Deploy to dev environment
sam deploy --parameter-overrides Environment=dev
```

### Production Environment

```bash
# Deploy to production
sam deploy --parameter-overrides Environment=prod --stack-name clinnet-emr-prod
```

### Environment-Specific Resources

The SAM template creates environment-specific resources:

- Tables: `clinnet-patient-records-{environment}`
- Buckets: `clinnet-documents-{environment}-{account}-{region}`
- User Pools: `clinnet-user-pool-{environment}`

---

## 🚀 Automated Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Clinnet-EMR

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Setup AWS SAM
        uses: aws-actions/setup-sam@v1

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy backend
        run: |
          cd backend
          sam build
          sam deploy --no-confirm-changeset

      - name: Build and deploy frontend
        run: |
          cd frontend
          npm install
          npm run build
          aws s3 sync dist/ s3://your-frontend-bucket --delete
```

---

## 🗄️ Database Initialization

### Seed Data (Optional)

```bash
cd backend/scripts

# Make script executable
chmod +x seed_data.sh

# Run seeding script
./seed_data.sh
```

### Manual Data Setup

```bash
# Add sample services
aws dynamodb put-item \
  --table-name clinnet-services-dev \
  --item '{
    "id": {"S": "1"},
    "name": {"S": "General Consultation"},
    "price": {"N": "100"},
    "duration": {"N": "30"}
  }'
```

---

## 🔐 Security Configuration

### Cognito User Pool Setup

After deployment, configure your user pool:

```bash
# Create admin user
aws cognito-idp admin-create-user \
  --user-pool-id your-user-pool-id \
  --username admin@example.com \
  --user-attributes Name=email,Value=admin@example.com Name=custom:role,Value=admin \
  --temporary-password TempPass123! \
  --message-action SUPPRESS
```

### API Gateway CORS

CORS is configured in the SAM template for:

- All HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
- Common headers for authentication
- Wildcard origin (configure for production)

---

## 📊 Monitoring and Logging

### CloudWatch Logs

View Lambda function logs:

```bash
# View recent logs
sam logs -n GetPatientsFunction --stack-name clinnet-emr-dev --tail

# View logs for specific time range
sam logs -n GetPatientsFunction --start-time 2023-01-01T00:00:00 --end-time 2023-01-02T00:00:00
```

### API Gateway Metrics

Monitor API performance in CloudWatch:

- Request count
- Error rates
- Latency
- Cache hit rates

---

## 🛠️ Troubleshooting Deployment

### Common Issues

**SAM build failures:**

```bash
# Use container build for consistent environment
sam build --use-container

# Check Python dependencies
cd backend
pip install -r requirements.txt
```

**API Gateway CORS errors:**

```bash
# Verify CORS configuration in template.yaml
# Check that OPTIONS methods are properly configured
```

**CloudFront distribution not updating:**

```bash
# Invalidate cache
aws cloudfront create-invalidation --distribution-id YOUR-DIST-ID --paths "/*"

# Wait for invalidation to complete
aws cloudfront get-invalidation --distribution-id YOUR-DIST-ID --id INVALIDATION-ID
```

**Cognito authentication issues:**

```bash
# Verify user pool configuration
aws cognito-idp describe-user-pool --user-pool-id YOUR-POOL-ID

# Check user pool client settings
aws cognito-idp describe-user-pool-client --user-pool-id YOUR-POOL-ID --client-id YOUR-CLIENT-ID
```

### Rollback Procedures

**Backend rollback:**

```bash
# Rollback to previous version
aws cloudformation cancel-update-stack --stack-name clinnet-emr-dev

# Or deploy previous template
sam deploy --template-file previous-template.yaml
```

**Frontend rollback:**

```bash
# Restore from backup or redeploy previous version
aws s3 sync backup-dist/ s3://your-frontend-bucket --delete
aws cloudfront create-invalidation --distribution-id YOUR-DIST-ID --paths "/*"
```

---

## 📈 Performance Optimization

### Lambda Function Optimization

- **Memory allocation**: Monitor and adjust based on CloudWatch metrics
- **Timeout settings**: Set appropriate timeouts for different functions
- **Cold starts**: Consider provisioned concurrency for critical functions

### DynamoDB Optimization

- **On-demand billing**: Automatically scales with usage
- **Global Secondary Indexes**: Optimize query patterns
- **Item size**: Keep items under 400KB for optimal performance

### CloudFront Optimization

- **Cache behaviors**: Configure appropriate TTL for different content types
- **Compression**: Enable compression for text-based content
- **Edge locations**: Utilize global edge network for low latency

---

## 🎯 Production Checklist

Before deploying to production:

- [ ] Update CORS origins to specific domains
- [ ] Configure custom domain names
- [ ] Set up SSL certificates
- [ ] Configure backup and disaster recovery
- [ ] Set up monitoring and alerting
- [ ] Review and harden security settings
- [ ] Test all API endpoints
- [ ] Validate user authentication flows
- [ ] Perform load testing
- [ ] Document deployment procedures

---

> **Next Steps:** After deployment, see the [Architecture Guide](./architecture.md) for system details or [Local Development](./local-development.md) for ongoing development.
