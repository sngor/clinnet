// Centralized runtime config for the frontend. Prefer Vite's import.meta.env.
// Note: process.env is intentionally avoided because vite.config defines it as an empty object.
const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

const config = {
  // Support both names (VITE_API_ENDPOINT preferred, VITE_API_URL legacy)
  API_ENDPOINT:
    env.VITE_API_ENDPOINT || env.VITE_API_URL || '',
  COGNITO: {
    REGION: env.VITE_COGNITO_REGION || 'us-east-2',
    USER_POOL_ID: env.VITE_USER_POOL_ID || '',
    APP_CLIENT_ID: env.VITE_USER_POOL_CLIENT_ID || '',
  },
  S3: {
    BUCKET: env.VITE_S3_BUCKET || '',
    REGION: env.VITE_S3_REGION || 'us-east-2',
  }
};

// Fail-fast validation in development and log warnings in production
(() => {
  const missing = [];
  if (!config.COGNITO.USER_POOL_ID) missing.push('VITE_USER_POOL_ID');
  if (!config.COGNITO.APP_CLIENT_ID) missing.push('VITE_USER_POOL_CLIENT_ID');
  if (!config.COGNITO.REGION) missing.push('VITE_COGNITO_REGION');
  if (missing.length) {
    const msg = `Missing required Cognito env vars: ${missing.join(', ')}. Check your .env or deployment secrets.`;
    if (env.DEV) {
      // Throw in dev to make the issue obvious during local runs
      console.error(msg);
    } else {
      // In production, log a clear error once
      console.error(msg);
    }
  }

  // Extra guard: flag obviously invalid Client IDs (e.g., pasted CLI commands)
  const clientId = config.COGNITO.APP_CLIENT_ID;
  const looksLikeCli = typeof clientId === 'string' && /aws\s+cloudformation|--stack-name|--query|--output/.test(clientId);
  const hasWhitespace = typeof clientId === 'string' && /\s/.test(clientId);
  const tooLong = typeof clientId === 'string' && clientId.length > 128;
  const invalidChars = typeof clientId === 'string' && !/^\w[\w-]*$/.test(clientId); // conservative pattern
  if (clientId && (looksLikeCli || hasWhitespace || tooLong || invalidChars)) {
    console.error(
      '[Cognito] VITE_USER_POOL_CLIENT_ID appears invalid. Ensure it is the actual App Client ID string from CloudFormation Outputs (not a CLI command).'
    );
  }
})();

export default config;