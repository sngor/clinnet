import { CognitoUserPool } from 'amazon-cognito-identity-js';
import { cognitoConfig } from './config.js';

if (!cognitoConfig.UserPoolId || !cognitoConfig.ClientId) {
  console.error('Missing Cognito configuration. Make sure UserPoolId and ClientId are provided in the config file.');
}

const userPool = new CognitoUserPool({
  UserPoolId: cognitoConfig.UserPoolId,
  ClientId: cognitoConfig.ClientId
});

// ...existing code...