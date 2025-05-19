import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { cognitoConfig } from './config.js';

// Validate configuration
if (!cognitoConfig.UserPoolId || !cognitoConfig.ClientId) {
  console.error('Missing Cognito configuration. Make sure UserPoolId and ClientId are provided in the config file.');
  console.error('Available environment variables:', import.meta.env);
  throw new Error('Missing Cognito configuration');
}

const userPool = new CognitoUserPool({
  UserPoolId: cognitoConfig.UserPoolId,
  ClientId: cognitoConfig.ClientId
});

// ...existing code...