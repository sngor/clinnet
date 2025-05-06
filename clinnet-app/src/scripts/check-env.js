// src/scripts/check-env.js
/**
 * Script to check for required environment variables
 * This script is run before the build to ensure all required environment variables are set
 */

// List of required environment variables
const requiredVars = [
  'API_ENDPOINT',
  'COGNITO_REGION',
  'USER_POOL_ID',
  'USER_POOL_CLIENT_ID',
  'S3_BUCKET',
  'S3_REGION'
];

console.log('Checking environment variables...');

// Check for missing variables
const missingVars = requiredVars.filter(varName => {
  // Check both VITE_ and REACT_APP_ prefixes
  const viteVar = `VITE_${varName}`;
  const reactVar = `REACT_APP_${varName}`;
  
  return !process.env[varName] && !process.env[viteVar] && !process.env[reactVar];
});

// If there are missing variables, log them
if (missingVars.length > 0) {
  console.warn('⚠️ Missing environment variables:');
  missingVars.forEach(varName => {
    console.warn(`- ${varName}`);
  });
  
  // Check if we're running in Amplify build environment
  if (process.env.AWS_REGION || process.env.AMPLIFY_REGION) {
    console.log('Running in Amplify build environment, continuing build process...');
    console.log('These variables should be provided by Amplify environment variables.');
    console.log(`Building for environment: ${process.env.ENVIRONMENT || 'prod'}`);
    process.exit(0); // Continue the build
  } else {
    console.error('❌ Required environment variables are missing. Please set them before building.');
    process.exit(1); // Exit with error
  }
} else {
  console.log('✅ All required environment variables are set.');
  process.exit(0); // Continue the build
}