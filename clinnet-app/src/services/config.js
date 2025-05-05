// src/services/config.js
import { Amplify } from 'aws-amplify';
import awsExports from '../aws-exports';

const config = {
  API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT || 
    (awsExports.aws_cloud_logic_custom && awsExports.aws_cloud_logic_custom[0]?.endpoint),
  COGNITO: {
    REGION: process.env.REACT_APP_COGNITO_REGION || awsExports.aws_cognito_region,
    USER_POOL_ID: process.env.REACT_APP_USER_POOL_ID || awsExports.aws_user_pools_id,
    APP_CLIENT_ID: process.env.REACT_APP_USER_POOL_CLIENT_ID || awsExports.aws_user_pools_web_client_id,
  },
  S3: {
    BUCKET: process.env.REACT_APP_S3_BUCKET || awsExports.aws_user_files_s3_bucket,
    REGION: process.env.REACT_APP_S3_REGION || awsExports.aws_user_files_s3_bucket_region,
  }
};

// We don't need to configure Amplify here since it's already done in AmplifyProvider
// This avoids duplicate configuration

export default config;