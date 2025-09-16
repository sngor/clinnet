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

  # Basic S3 bucket for frontend
  FrontendBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub clinnet-frontend-minimal-${Environment}-${AWS::AccountId}-${AWS::Region}
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true

  CloudFrontOAI:
    Type: AWS::CloudFront::CloudFrontOriginAccessIdentity
    Properties:
      CloudFrontOriginAccessIdentityConfig:
        Comment: !Sub OAI for Clinnet-EMR frontend ${Environment}

  FrontendBucketPolicy:
    Type: AWS::S3::BucketPolicy
    Properties:
      Bucket: !Ref FrontendBucket
      PolicyDocument:
        Statement:
          - Effect: Allow
            Principal:
              CanonicalUser: !GetAtt CloudFrontOAI.S3CanonicalUserId
            Action: s3:GetObject
            Resource: !Sub ${FrontendBucket.Arn}/*

  FrontendDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Enabled: true
        DefaultRootObject: index.html

        Origins:
          - Id: S3Origin
            DomainName: !GetAtt FrontendBucket.RegionalDomainName
            S3OriginConfig:
              OriginAccessIdentity: !Sub origin-access-identity/cloudfront/${CloudFrontOAI}
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          AllowedMethods:
            - GET
            - HEAD
          CachedMethods:
            - GET
            - HEAD
          Compress: true
          ForwardedValues:
            QueryString: false
            Cookies:
              Forward: none
        ViewerCertificate:
          CloudFrontDefaultCertificate: true
        PriceClass: PriceClass_100
        CustomErrorResponses:
          - ErrorCode: 403
            ResponseCode: 200
            ResponsePagePath: /index.html
          - ErrorCode: 404
            ResponseCode: 200
            ResponsePagePath: /index.html


Outputs:
  ApiEndpoint:
    Value: !Sub https://${ClinicAPI}.execute-api.${AWS::Region}.amazonaws.com/${Environment}
  FrontendBucketName:
    Value: !Ref FrontendBucket
  FrontendWebsiteURL:
    Value: !GetAtt FrontendBucket.WebsiteURL
  CloudFrontDistributionDomain:
    Value: !GetAtt FrontendDistribution.DomainName
EOF

echo "Deploying minimal stack..."
sam deploy --template-file template-minimal.yaml \
  --stack-name clinnet-minimal \
  --capabilities CAPABILITY_IAM \
  --no-confirm-changeset \
  --resolve-s3

echo "Minimal deployment complete!"