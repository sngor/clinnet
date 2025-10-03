export const awsConfig = {
  region: 'us-west-2',
  apiGateway: {
    REGION: 'us-west-2',
    URL: import.meta.env.VITE_API_ENDPOINT,
  },
  cognito: {
    REGION: 'us-west-2',
    USER_POOL_ID: import.meta.env.VITE_USER_POOL_ID,
    USER_POOL_CLIENT_ID: import.meta.env.VITE_USER_POOL_CLIENT_ID,
  }
};
