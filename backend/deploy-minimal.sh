#!/bin/bash
# Simple deployment with minimal resources
set -e

echo "Creating minimal SAM template..."

cat > template-minimal.yaml << 'EOF'
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: Minimal Clinnet-EMR backend

Parameters:
  Environment:
    Type: String
    Default: dev

Resources:
  # Simple API Gateway
  ClinicAPI:
    Type: AWS::Serverless::Api
    Properties:
      StageName: !Ref Environment

  # Simple Lambda function
  TestFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/handlers/services/
      Handler: get_services.lambda_handler
      Runtime: python3.12
      Events:
        GetServices:
          Type: Api
          Properties:
            RestApiId: !Ref ClinicAPI
            Path: /api/test
            Method: get
            Auth:
              Authorizer: NONE

Outputs:
  ApiEndpoint:
    Value: !Sub https://${ClinicAPI}.execute-api.${AWS::Region}.amazonaws.com/${Environment}
EOF

echo "Deploying minimal stack..."
sam deploy --template-file template-minimal.yaml \
  --stack-name clinnet-minimal \
  --capabilities CAPABILITY_IAM \
  --no-confirm-changeset \
  --resolve-s3

echo "Minimal deployment complete!"