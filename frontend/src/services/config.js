const config = {
  API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT || process.env.VITE_API_ENDPOINT || 
    'https://v30yfenncd.execute-api.us-east-2.amazonaws.com/prod',
  COGNITO: {
    REGION: process.env.REACT_APP_COGNITO_REGION || process.env.VITE_COGNITO_REGION || 'us-east-2',
    USER_POOL_ID: process.env.REACT_APP_USER_POOL_ID || process.env.VITE_USER_POOL_ID || 'us-east-2_HU35r96jk',
    APP_CLIENT_ID: process.env.REACT_APP_USER_POOL_CLIENT_ID || process.env.VITE_USER_POOL_CLIENT_ID || '1ltnr3hircmcoip4f6okfr3000',
  },
  S3: {
    BUCKET: process.env.REACT_APP_S3_BUCKET || process.env.VITE_S3_BUCKET || 'clinnet-documents-152296711262',
    REGION: process.env.REACT_APP_S3_REGION || process.env.VITE_S3_REGION || 'us-east-2',
  }
};

export default config;