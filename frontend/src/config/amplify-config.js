// src/config/amplify-config.js
const amplifyConfig = {
  Auth: {
    region: process.env.REACT_APP_COGNITO_REGION || 'us-east-2',
    userPoolId: process.env.REACT_APP_USER_POOL_ID || 'us-east-2_HU35r96jk',
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID || '1ltnr3hircmcoip4f6okfr3000',
  },
  API: {
    endpoints: [
      {
        name: 'clinnetApi',
        endpoint: process.env.REACT_APP_API_ENDPOINT || 'https://v30yfenncd.execute-api.us-east-2.amazonaws.com/prod',
        region: 'us-east-2',
      },
    ],
  },
  Storage: {
    AWSS3: {
      bucket: process.env.REACT_APP_S3_BUCKET || 'clinnet-documents-152296711262',
      region: process.env.REACT_APP_S3_REGION || 'us-east-2',
    }
  }
};

export default amplifyConfig;