export const awsConfig = {
  region: 'us-east-2',
  apiGateway: {
    REGION: 'us-east-2',
    URL: process.env.VITE_API_URL,
  },
  cognito: {
    REGION: 'us-east-2',
    USER_POOL_ID: process.env.VITE_COGNITO_USER_POOL_ID,
    APP_CLIENT_ID: process.env.VITE_COGNITO_CLIENT_ID,
  }
};
