// src/config/amplify-config.js

// Configuration for AWS Amplify v6
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-2_sQHTbURkW',
      userPoolClientId: '6hg0umclddagog2sr52ij8lq36',
      region: 'us-east-2',
      loginWith: {
        email: true,
        username: true
      }
    }
  }
};

console.log('Amplify v6 config loaded with:', {
  userPoolId: amplifyConfig.Auth.Cognito.userPoolId,
  userPoolClientId: amplifyConfig.Auth.Cognito.userPoolClientId,
  region: amplifyConfig.Auth.Cognito.region
});

export default amplifyConfig;