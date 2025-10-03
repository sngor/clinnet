// src/utils/healthCheck.js
// Frontend health check utilities

import config from '../services/config.js';

/**
 * Performs a basic health check of the frontend application
 * @returns {Object} Health check results
 */
export const performHealthCheck = () => {
  const results = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {},
    warnings: [],
    errors: []
  };

  // Check environment configuration
  results.checks.environment = {
    status: 'pass',
    details: {
      NODE_ENV: import.meta.env.MODE,
      BASE_URL: import.meta.env.BASE_URL,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD
    }
  };

  // Check API configuration
  if (config.API_ENDPOINT) {
    results.checks.apiConfig = {
      status: 'pass',
      details: {
        endpoint: config.API_ENDPOINT,
        hasEndpoint: true
      }
    };
  } else {
    results.checks.apiConfig = {
      status: 'warn',
      details: {
        endpoint: null,
        hasEndpoint: false
      }
    };
    results.warnings.push('API endpoint not configured');
  }

  // Check Cognito configuration
  const cognitoConfigured = config.COGNITO.USER_POOL_ID && config.COGNITO.APP_CLIENT_ID;
  if (cognitoConfigured) {
    results.checks.cognitoConfig = {
      status: 'pass',
      details: {
        userPoolId: config.COGNITO.USER_POOL_ID ? '***configured***' : null,
        appClientId: config.COGNITO.APP_CLIENT_ID ? '***configured***' : null,
        region: config.COGNITO.REGION
      }
    };
  } else {
    results.checks.cognitoConfig = {
      status: 'warn',
      details: {
        userPoolId: config.COGNITO.USER_POOL_ID ? '***configured***' : null,
        appClientId: config.COGNITO.APP_CLIENT_ID ? '***configured***' : null,
        region: config.COGNITO.REGION
      }
    };
    results.warnings.push('Cognito configuration incomplete');
  }

  // Check browser compatibility
  const browserFeatures = {
    localStorage: typeof Storage !== 'undefined',
    sessionStorage: typeof Storage !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    promises: typeof Promise !== 'undefined',
    es6: typeof Symbol !== 'undefined'
  };

  const unsupportedFeatures = Object.entries(browserFeatures)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature);

  if (unsupportedFeatures.length === 0) {
    results.checks.browserCompatibility = {
      status: 'pass',
      details: browserFeatures
    };
  } else {
    results.checks.browserCompatibility = {
      status: 'fail',
      details: browserFeatures
    };
    results.errors.push(`Unsupported browser features: ${unsupportedFeatures.join(', ')}`);
    results.status = 'unhealthy';
  }

  // Overall status determination
  if (results.errors.length > 0) {
    results.status = 'unhealthy';
  } else if (results.warnings.length > 0) {
    results.status = 'degraded';
  }

  return results;
};

/**
 * Logs health check results to console
 * @param {Object} healthCheck - Health check results
 */
export const logHealthCheck = (healthCheck) => {
  console.group('🏥 Clinnet EMR Frontend Health Check');
  console.log(`Status: ${healthCheck.status.toUpperCase()}`);
  console.log(`Timestamp: ${healthCheck.timestamp}`);
  
  if (healthCheck.warnings.length > 0) {
    console.group('⚠️ Warnings');
    healthCheck.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }
  
  if (healthCheck.errors.length > 0) {
    console.group('❌ Errors');
    healthCheck.errors.forEach(error => console.error(error));
    console.groupEnd();
  }
  
  console.group('📊 Detailed Checks');
  Object.entries(healthCheck.checks).forEach(([check, result]) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} ${check}:`, result.details);
  });
  console.groupEnd();
  
  console.groupEnd();
};

/**
 * Performs health check and logs results (for development)
 */
export const runHealthCheck = () => {
  const results = performHealthCheck();
  logHealthCheck(results);
  return results;
};

// Auto-run health check in development
if (import.meta.env.DEV) {
  // Run health check after a short delay to ensure all modules are loaded
  setTimeout(() => {
    runHealthCheck();
  }, 1000);
}