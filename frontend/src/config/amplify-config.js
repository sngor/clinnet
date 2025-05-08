// src/config/amplify-config.js

// Hard-coded configuration for testing
const amplifyConfig = {
  Auth: {
    region: 'us-east-2',
    userPoolId: 'us-east-2_sQHTbURkW',
    userPoolWebClientId: '6hg0umclddagog2sr52ij8lq36',
    mandatorySignIn: true,
    authenticationFlowType: 'USER_PASSWORD_AUTH'
  }
};

console.log('Amplify config loaded with hard-coded values for testing');

export default amplifyConfig;