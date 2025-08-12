# Pre-deployment Checklist

## Frontend

- [ ] Environment variables configured in `.env`
- [ ] Build completes successfully (`npm run build`)
- [ ] All frontend tests passing
- [ ] CORS configuration matches backend

## Backend

- [ ] SAM template validates
- [ ] Test coverage meets threshold (>80%)
- [ ] Environment variables configured in template.yaml
- [ ] IAM permissions validated
- [ ] DynamoDB tables and indexes defined

## Security

- [ ] API Gateway endpoints secured
- [ ] Cognito User Pool configured
- [ ] S3 bucket policies reviewed
- [ ] CloudFront distribution configured
