# 🔧 Clinnet EMR Troubleshooting Guide

Comprehensive troubleshooting guide for deployment, development, and operational issues.

## 🚨 **Common Deployment Issues**

### **1. AWS Credentials Issues**

**Symptom**: "Credentials could not be loaded" or "Unable to locate credentials"

```bash
# Error: Unable to locate credentials
```

**Solution**: Configure AWS credentials properly

```bash
# Configure AWS CLI
aws configure
# Enter Access Key ID, Secret Access Key, Region, Output format

# Verify configuration
aws sts get-caller-identity

# Alternative: Use environment variables
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=us-west-2
```

### **2. SAM Deployment Failures**

**Symptom**: CloudFormation stack creation fails

```bash
# Error: CREATE_FAILED - Insufficient permissions
```

**Solution**: Ensure proper IAM permissions

```bash
# Required permissions for SAM deployment:
# - CloudFormation (full access)
# - Lambda (full access)
# - API Gateway (full access)
# - S3 (full access)
# - DynamoDB (full access)
# - IAM (role creation)
# - Cognito (full access)

# Check current permissions
aws iam get-user
aws iam list-attached-user-policies --user-name your-username
```

### **3. Resource Limit Issues**

**Symptom**: "Cannot exceed quota for resource type"

```bash
# Error: Limit exceeded for Lambda functions in region
```

**Solution**: Check and request limit increases

```bash
# Check current limits
aws service-quotas get-service-quota \
  --service-code lambda \
  --quota-code L-B99A9384

# Request limit increase through AWS Console
# Or clean up unused resources
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `old-`)]'
```

### **4. VPC and Networking Issues**

**Symptom**: Database connection timeouts or failures

```bash
# Error: Unable to connect to database endpoint
```

**Solution**: Check VPC configuration

```bash
# Verify VPC resources exist
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=*clinnet*"

# Check security groups
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=*clinnet*"

# Verify subnets
aws ec2 describe-subnets \
  --filters "Name=tag:Name,Values=*clinnet*"
```

## 🌐 **Frontend Issues**

### **1. CORS Errors**

**Symptom**: Browser console shows CORS policy errors

```javascript
// Error: Access to fetch at 'API_URL' from origin 'localhost:5173'
// has been blocked by CORS policy
```

**Solution**: Check API Gateway and Lambda CORS configuration

```bash
# Verify API Gateway CORS settings
aws apigateway get-method \
  --rest-api-id your-api-id \
  --resource-id your-resource-id \
  --http-method OPTIONS

# Check Lambda function CORS headers in response
```

### **2. Node.js Version Issues**

**Symptom**: Build or dependency errors

```bash
# Error: Node version not supported
```

**Solution**: Use correct Node.js version

```bash
# Check current version
node --version

# Use Node Version Manager
nvm install 18
nvm use 18

# Or use the fix script
cd frontend
bash scripts/fix-node-version.sh
```

### **3. Build Failures**

**Symptom**: Vite build fails with dependency errors

```bash
# Error: Failed to resolve import
```

**Solution**: Clean and reinstall dependencies

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **4. Environment Variable Issues**

**Symptom**: API calls fail with undefined endpoints

```javascript
// Error: API_ENDPOINT is undefined
```

**Solution**: Check environment configuration

```bash
# Verify .env file exists and has correct variables
cat frontend/.env

# Required variables:
# VITE_API_ENDPOINT=https://your-api-gateway-url
# VITE_USER_POOL_ID=us-west-2_xxxxxxxxx
# VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxx
```

## ⚡ **Backend Issues**

### **1. Lambda Function Errors**

**Symptom**: 500 Internal Server Error from API

```bash
# Error: Internal server error
```

**Solution**: Check CloudWatch logs

```bash
# View function logs
aws logs describe-log-groups \
  --log-group-name-prefix /aws/lambda/clinnet

# Tail logs in real-time
sam logs --stack-name clinnet-emr-dev --tail

# Check specific function
aws logs filter-log-events \
  --log-group-name /aws/lambda/GetPatientsFunction \
  --start-time $(date -d '1 hour ago' +%s)000
```

### **2. Database Connection Issues**

**Symptom**: Database timeouts or connection failures

```python
# Error: Unable to connect to database
```

**Solution**: Check database and network configuration

```bash
# Verify Aurora cluster status
aws rds describe-db-clusters \
  --db-cluster-identifier clinnet-emr-dev

# Check VPC endpoints and security groups
aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=*database*"

# Test connectivity from Lambda
aws lambda invoke \
  --function-name CheckDatabaseConnectivity \
  response.json
```

### **3. DynamoDB Access Issues**

**Symptom**: Access denied errors for DynamoDB operations

```python
# Error: User is not authorized to perform: dynamodb:GetItem
```

**Solution**: Check IAM permissions

```bash
# Verify Lambda execution role permissions
aws iam get-role-policy \
  --role-name clinnet-emr-lambda-role \
  --policy-name DynamoDBAccess

# List attached policies
aws iam list-attached-role-policies \
  --role-name clinnet-emr-lambda-role
```

## 🔒 **Authentication Issues**

### **1. Cognito Authentication Failures**

**Symptom**: Login fails or tokens are invalid

```javascript
// Error: Invalid token or user not authenticated
```

**Solution**: Check Cognito configuration

```bash
# Verify User Pool exists
aws cognito-idp describe-user-pool \
  --user-pool-id us-west-2_xxxxxxxxx

# Check User Pool Client settings
aws cognito-idp describe-user-pool-client \
  --user-pool-id us-west-2_xxxxxxxxx \
  --client-id xxxxxxxxxxxxxxxxxx

# Test user authentication
aws cognito-idp admin-get-user \
  --user-pool-id us-west-2_xxxxxxxxx \
  --username test-user
```

### **2. JWT Token Issues**

**Symptom**: API calls return 401 Unauthorized

```bash
# Error: Token is expired or invalid
```

**Solution**: Check token validation

```javascript
// Verify token in browser console
console.log(localStorage.getItem("cognito-token"));

// Check token expiration
const token = "your-jwt-token";
const payload = JSON.parse(atob(token.split(".")[1]));
console.log("Token expires:", new Date(payload.exp * 1000));
```

## 📊 **Performance Issues**

### **1. Slow API Response Times**

**Symptom**: API calls take longer than expected

```bash
# Response times > 5 seconds
```

**Solution**: Optimize Lambda and database performance

```bash
# Check Lambda metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=GetPatientsFunction \
  --start-time $(date -d '1 hour ago' --iso-8601) \
  --end-time $(date --iso-8601) \
  --period 300 \
  --statistics Average,Maximum

# Monitor database performance
aws rds describe-db-cluster-parameters \
  --db-cluster-parameter-group-name default.aurora-mysql8.0
```

### **2. High Memory Usage**

**Symptom**: Lambda functions running out of memory

```bash
# Error: Process exited before completing request
```

**Solution**: Optimize memory allocation

```bash
# Check current memory configuration
aws lambda get-function-configuration \
  --function-name GetPatientsFunction

# Update memory if needed
aws lambda update-function-configuration \
  --function-name GetPatientsFunction \
  --memory-size 512
```

## 📊 **Monitoring & Debugging**

### **CloudWatch Logs**

**Lambda Function Logs:**

```bash
# View all Lambda log groups
aws logs describe-log-groups \
  --log-group-name-prefix /aws/lambda/clinnet

# Common log groups:
# /aws/lambda/GetPatientsFunction
# /aws/lambda/CreatePatientFunction
# /aws/lambda/GetAppointmentsFunction
# /aws/lambda/MedicalReportsFunction
```

**API Gateway Logs:**

```bash
# Enable API Gateway logging
aws apigateway update-stage \
  --rest-api-id your-api-id \
  --stage-name dev \
  --patch-ops op=replace,path=/accessLogSettings/destinationArn,value=arn:aws:logs:region:account:log-group:api-gateway-logs
```

### **Performance Monitoring**

**Key Metrics to Monitor:**

- Lambda Duration and Error Rate
- API Gateway 4xx/5xx Errors
- DynamoDB Read/Write Capacity
- Aurora CPU and Connection Count

```bash
# Get Lambda performance metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Errors \
  --dimensions Name=FunctionName,Value=GetPatientsFunction \
  --start-time $(date -d '24 hours ago' --iso-8601) \
  --end-time $(date --iso-8601) \
  --period 3600 \
  --statistics Sum
```

### **Debugging Tools**

**Frontend Debugging:**

- Browser Developer Tools (Network, Console, Application tabs)
- React Developer Tools extension
- Vite build analysis: `npm run build -- --analyze`

**Backend Debugging:**

- CloudWatch Logs Insights for advanced log analysis
- AWS X-Ray for distributed tracing (if enabled)
- SAM local testing: `sam local start-api`

### **Health Checks**

**System Health Endpoints:**

```bash
# Test system health
curl https://your-api-gateway-url/dev/api/diagnostics/database
curl https://your-api-gateway-url/dev/api/diagnostics/s3
```

**Frontend Health Check:**

- Built-in health check runs automatically in development
- Check browser console for configuration validation

## 🆘 **Getting Help**

### **Log Analysis**

**Common Error Patterns:**

```bash
# Search for specific errors in logs
aws logs filter-log-events \
  --log-group-name /aws/lambda/GetPatientsFunction \
  --filter-pattern "ERROR" \
  --start-time $(date -d '1 hour ago' +%s)000

# Search for CORS issues
aws logs filter-log-events \
  --log-group-name /aws/lambda/GetPatientsFunction \
  --filter-pattern "CORS" \
  --start-time $(date -d '1 hour ago' +%s)000
```

### **Support Resources**

- **Documentation**: Check the main [README.md](../README.md)
- **AWS Support**: Use AWS Support Center for infrastructure issues
- **GitHub Issues**: Report application-specific problems
- **CloudWatch Dashboards**: Create custom dashboards for monitoring

### **Emergency Procedures**

**System Recovery:**

1. Check AWS Service Health Dashboard
2. Verify CloudFormation stack status
3. Review recent deployments in CloudFormation console
4. Check Lambda function error rates in CloudWatch
5. Validate database connectivity and performance

**Rollback Procedure:**

```bash
# Rollback to previous stack version
aws cloudformation cancel-update-stack --stack-name clinnet-emr-dev

# Or deploy previous version
git checkout previous-working-commit
cd deployment/scripts
./deploy-full-stack.sh --environment dev
```

---

**For additional help, see the [Deployment Guide](DEPLOYMENT_GUIDE.md) and [Technical Reference](TECHNICAL_REFERENCE.md).**
