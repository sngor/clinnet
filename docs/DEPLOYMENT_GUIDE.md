# 🚀 Clinnet EMR Deployment Guide

Complete deployment guide for the Clinnet EMR healthcare management system on AWS.

## 📋 **Prerequisites**

### **Required Tools**

- **AWS CLI** v2.0+ configured with appropriate permissions
- **SAM CLI** v1.50+ (`pip install aws-sam-cli`)
- **Node.js** v18+ and npm v8+
- **Git** for version control
- **Python** 3.12+ (for backend development)

### **AWS Permissions Required**

Your AWS user/role needs permissions for:

- CloudFormation (full access)
- Lambda (full access)
- API Gateway (full access)
- S3 (full access)
- Cognito (full access)
- RDS (full access)
- DynamoDB (full access)
- CloudFront (full access)
- VPC and EC2 (for networking)
- IAM (for role creation)

### **AWS Account Setup**

```bash
# Configure AWS CLI
aws configure
# Enter your Access Key ID, Secret Access Key, Region, and Output format

# Verify configuration
aws sts get-caller-identity
```

## 🎯 **Deployment Options**

### **Option 1: Complete Full-Stack Deployment (Recommended)**

Deploy both backend infrastructure and frontend application in one command:

```bash
cd deployment/scripts
./deploy-full-stack.sh --environment dev
```

**Features:**

- ✅ Deploys complete AWS infrastructure
- ✅ Builds and deploys React frontend
- ✅ Configures environment variables automatically
- ✅ Creates CloudFront distribution
- ✅ Provides complete system URLs

### **Option 2: Backend-Only Deployment**

Deploy just the AWS infrastructure:

```bash
cd backend
sam build
sam deploy --parameter-overrides Environment=dev DBUsername=admin DBPassword=ClinetEMR2024!
```

### **Option 3: Frontend-Only Deployment**

Deploy just the React application (requires existing backend):

```bash
cd deployment/scripts
./deploy-frontend.sh --environment dev --stack-name clinnet-emr-dev
```

## 🏗️ **Complete Infrastructure Deployed**

### **AWS Resources Created (25+ Resources)**

**Networking & Security:**

- VPC with public/private subnets
- Internet Gateway and NAT Gateway
- Security Groups for Lambda and Database
- Route Tables and Network ACLs

**Compute & API:**

- 20+ Lambda Functions (Python 3.12)
- API Gateway with CORS configuration
- Lambda Layer for shared utilities

**Database & Storage:**

- Aurora Serverless v2 MySQL cluster
- 3 DynamoDB tables (Medical Reports, Services, Users)
- 3 S3 buckets (Documents, Images, Frontend)

**Authentication & CDN:**

- Cognito User Pool and Client
- CloudFront Distribution with Origin Access Control
- Custom domain support (optional)

**Monitoring & Logging:**

- CloudWatch Log Groups
- Performance monitoring
- Error tracking and alerting

## 📊 **Deployment Process**

### **Step 1: Pre-Deployment Validation**

```bash
# Validate SAM template
cd backend
sam validate --template template.yaml

# Validate frontend application
cd frontend
./scripts/validate-frontend.sh
```

### **Step 2: Environment Configuration**

Choose your deployment environment:

**Development Environment:**

```bash
./deploy-full-stack.sh --environment dev
```

- Cost-optimized settings
- Relaxed security for testing
- Debug logging enabled
- Single AZ deployment

**Production Environment:**

```bash
./deploy-full-stack.sh --environment prod --db-password SecurePassword123!
```

- Production-optimized settings
- Enhanced security
- Multi-AZ deployment
- Backup and monitoring enabled

### **Step 3: Deployment Execution**

The deployment process includes:

1. **Backend Infrastructure** (~10-15 minutes)

   - SAM template validation
   - CloudFormation stack creation
   - Lambda function deployment
   - Database cluster provisioning
   - API Gateway configuration

2. **Frontend Application** (~5-10 minutes)
   - React application build
   - S3 bucket upload
   - CloudFront distribution setup
   - Cache invalidation

### **Step 4: Post-Deployment Verification**

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name clinnet-emr-dev

# Test API endpoints
curl https://your-api-id.execute-api.region.amazonaws.com/dev/api/health

# Verify frontend
curl -I https://your-cloudfront-domain.cloudfront.net
```

## ⚙️ **Configuration Options**

### **Environment Parameters**

**Required Parameters:**

- `Environment`: dev, test, or prod
- `DBUsername`: Database administrator username
- `DBPassword`: Database administrator password

**Optional Parameters:**

- `VpcCidr`: Custom VPC CIDR block
- `BackupRetentionPeriod`: Database backup retention (days)
- `DeletionProtection`: Enable/disable deletion protection

### **Custom Configuration Example**

```bash
sam deploy \
  --stack-name clinnet-emr-prod \
  --parameter-overrides \
    Environment=prod \
    DBUsername=admin \
    DBPassword=MySecurePassword123! \
    BackupRetentionPeriod=30 \
    DeletionProtection=true \
  --capabilities CAPABILITY_IAM
```

## 🔧 **Advanced Deployment Scenarios**

### **Multi-Region Deployment**

Deploy to multiple AWS regions for disaster recovery:

```bash
# Primary region (us-west-2)
aws configure set region us-west-2
./deploy-full-stack.sh --environment prod

# Secondary region (us-east-1)
aws configure set region us-east-1
./deploy-full-stack.sh --environment prod-dr
```

### **Custom Domain Setup**

1. **Register Domain** in Route 53 or external provider
2. **Request SSL Certificate** in AWS Certificate Manager
3. **Update CloudFront Distribution** with custom domain
4. **Configure DNS** to point to CloudFront

```bash
# Add custom domain to CloudFront (manual step)
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --distribution-config file://custom-domain-config.json
```

### **Blue-Green Deployment**

Deploy new version alongside existing:

```bash
# Deploy new version with different stack name
./deploy-full-stack.sh --environment prod-v2 --stack-name clinnet-emr-prod-v2

# Test new version thoroughly
# Switch traffic using Route 53 weighted routing
# Remove old version after validation
```

## 📊 **Monitoring Deployment**

### **CloudFormation Events**

Monitor deployment progress:

```bash
# Watch stack events in real-time
aws cloudformation describe-stack-events \
  --stack-name clinnet-emr-dev \
  --query 'StackEvents[*].[Timestamp,ResourceStatus,ResourceType,LogicalResourceId]' \
  --output table
```

### **Lambda Function Logs**

Check function deployment:

```bash
# List Lambda functions
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `clinnet`)]'

# Check function logs
aws logs tail /aws/lambda/GetPatientsFunction --follow
```

### **Database Connection**

Verify database setup:

```bash
# Get database endpoint
DB_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name clinnet-emr-dev \
  --query "Stacks[0].Outputs[?OutputKey=='DatabaseEndpoint'].OutputValue" \
  --output text)

# Test connection (requires VPN or bastion host)
mysql -h $DB_ENDPOINT -u admin -p clinnet_emr
```

## 🚨 **Troubleshooting**

### **Common Deployment Issues**

**1. Insufficient Permissions**

```bash
# Error: User is not authorized to perform action
# Solution: Add required IAM permissions
aws iam attach-user-policy \
  --user-name your-username \
  --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
```

**2. Resource Limits Exceeded**

```bash
# Error: Cannot exceed quota for resource type
# Solution: Request limit increase or clean up unused resources
aws service-quotas get-service-quota \
  --service-code lambda \
  --quota-code L-B99A9384
```

**3. VPC Resource Conflicts**

```bash
# Error: VPC already exists or CIDR conflicts
# Solution: Use different CIDR or delete existing VPC
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=clinnet-emr-vpc-*"
```

**4. Database Connection Issues**

```bash
# Error: Cannot connect to database
# Solution: Check security groups and VPC configuration
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=*clinnet*"
```

### **Rollback Procedures**

**Automatic Rollback:**
CloudFormation automatically rolls back on failure. Monitor the process:

```bash
aws cloudformation describe-stack-events \
  --stack-name clinnet-emr-dev \
  --query 'StackEvents[?ResourceStatus==`ROLLBACK_IN_PROGRESS`]'
```

**Manual Rollback:**

```bash
# Delete failed stack
aws cloudformation delete-stack --stack-name clinnet-emr-dev

# Redeploy with fixes
./deploy-full-stack.sh --environment dev
```

## 🔒 **Security Considerations**

### **Database Security**

- Database is deployed in private subnets
- Access only through Lambda functions
- Encryption at rest enabled
- Backup encryption enabled

### **API Security**

- Cognito authentication required
- CORS properly configured
- Rate limiting enabled
- WAF protection (optional)

### **Frontend Security**

- HTTPS enforced via CloudFront
- Security headers configured
- Origin Access Control for S3
- No direct S3 access

### **Secrets Management**

```bash
# Store sensitive configuration in Systems Manager
aws ssm put-parameter \
  --name "/clinnet/prod/db-password" \
  --value "YourSecurePassword" \
  --type "SecureString"

# Reference in SAM template
DBPassword: !Ref DBPasswordParameter
```

## 💰 **Cost Optimization**

### **Development Environment**

- Aurora Serverless v2 (0.5-2 ACU)
- Single AZ deployment
- Shorter backup retention
- **Estimated cost**: $50-100/month

### **Production Environment**

- Aurora Serverless v2 (0.5-16 ACU)
- Multi-AZ deployment
- Extended backup retention
- **Estimated cost**: $200-500/month

### **Cost Monitoring**

```bash
# Set up billing alerts
aws budgets create-budget \
  --account-id YOUR_ACCOUNT_ID \
  --budget file://budget-config.json
```

## 📋 **Post-Deployment Checklist**

### **Immediate Tasks (First Hour)**

- [ ] Verify all stack outputs are available
- [ ] Test API endpoints respond correctly
- [ ] Access frontend application successfully
- [ ] Create first admin user in Cognito
- [ ] Initialize database schema

### **Configuration Tasks (First Day)**

- [ ] Set up monitoring and alerting
- [ ] Configure backup schedules
- [ ] Test authentication flows
- [ ] Create sample data for testing
- [ ] Document access credentials securely

### **Production Readiness (First Week)**

- [ ] Load test the system
- [ ] Set up monitoring dashboards
- [ ] Configure log aggregation
- [ ] Implement backup verification
- [ ] Create disaster recovery procedures
- [ ] Train end users on the system

## 🎯 **Next Steps**

After successful deployment:

1. **Initialize Database Schema**

   ```bash
   mysql -h <aurora-endpoint> -u admin -p < backend/database/schema.sql
   ```

2. **Create Admin User**

   ```bash
   aws cognito-idp admin-create-user \
     --user-pool-id <user-pool-id> \
     --username admin \
     --user-attributes Name=email,Value=admin@example.com
   ```

3. **Access Your System**

   - Frontend: Use CloudFront URL from stack outputs
   - API: Use API Gateway URL from stack outputs
   - Database: Connect via Aurora endpoint (VPN required)

4. **Configure Monitoring**
   - Set up CloudWatch dashboards
   - Configure SNS notifications
   - Enable AWS X-Ray tracing

---

## 🆘 **Getting Help**

### **Support Resources**

- **Documentation**: Check the docs/ directory
- **Logs**: CloudWatch Logs for detailed error information
- **AWS Support**: Use AWS Support Center for infrastructure issues
- **Community**: GitHub Issues for application-specific problems

### **Emergency Contacts**

- **System Administrator**: admin@your-organization.com
- **AWS Support**: Your AWS support plan contact
- **Database Administrator**: dba@your-organization.com

**Your Clinnet EMR system is ready for production use!** 🏥✨
