// scripts/check-env.js
console.log('Checking environment variables...');

// List of required environment variables
const requiredVars = [
  { name: 'API_ENDPOINT', value: process.env.VITE_API_ENDPOINT || process.env.REACT_APP_API_ENDPOINT },
  { name: 'COGNITO_REGION', value: process.env.VITE_COGNITO_REGION || process.env.REACT_APP_COGNITO_REGION },
  { name: 'USER_POOL_ID', value: process.env.VITE_USER_POOL_ID || process.env.REACT_APP_USER_POOL_ID },
  { name: 'USER_POOL_CLIENT_ID', value: process.env.VITE_USER_POOL_CLIENT_ID || process.env.REACT_APP_USER_POOL_CLIENT_ID },
  { name: 'S3_BUCKET', value: process.env.VITE_S3_BUCKET || process.env.REACT_APP_S3_BUCKET },
  { name: 'S3_REGION', value: process.env.VITE_S3_REGION || process.env.REACT_APP_S3_REGION }
];

// Check if any required variables are missing
const missingVars = requiredVars.filter(v => !v.value);

// If we're in Amplify build environment, we can continue even with missing vars
// as they will be injected during the build process
const isAmplifyBuild = process.env.AWS_REGION || process.env.AMPLIFY_MONOREPO_APP_ROOT;

if (missingVars.length > 0) {
  console.warn('⚠️ Missing environment variables:');
  missingVars.forEach(v => console.warn(`  - ${v.name}`));
  
  if (isAmplifyBuild) {
    console.log('Running in Amplify build environment, continuing build process...');
    console.log('These variables should be provided by Amplify environment variables.');
  } else {
    console.log('Environment variables will be loaded from .env files if available.');
  }
} else {
  console.log('✅ All required environment variables are set.');
}

// Log the environment we're building for
console.log(`Building for environment: ${process.env.ENVIRONMENT || 'development'}`);