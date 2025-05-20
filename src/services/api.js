const API_BASE_URL = 'https://libzdu3ibi.execute-api.us-east-2.amazonaws.com/prod';

// Enhanced fetchWithAuth with better CORS error handling
export const fetchWithAuth = async (path, options = {}) => {
  // Get auth token from your authentication system
  const token = localStorage.getItem('idToken') || ''; // adjust based on your auth storage

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': token,
    'Origin': window.location.origin, // Add Origin header for CORS
    // Adding additional headers that might help with CORS
    'Accept': 'application/json'
  };

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      },
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit' // Changed from default to explicitly omit credentials
    });

    if (!response.ok) {
      // Capture more details about CORS failures
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      if (response.status === 403 && !corsHeader) {
        console.error('CORS error detected: Missing Access-Control-Allow-Origin header');
        logCorsError(path, response);
        throw new Error(`CORS error: Missing required headers for ${path}`);
      }
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // If we have a network error, it might be a CORS issue
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('CORS')) {
      console.error(`Possible CORS issue detected for ${path}:`, error);
      // Try logging more diagnostic info
      logCorsError(path, null, error);
      
      // Optionally attempt a fallback approach for critical requests
      if (options.attemptCorsWorkaround) {
        return await corsWorkaroundFetch(path, options);
      }
    }
    throw error;
  }
};

// Helper function to log CORS errors in a structured way
const logCorsError = (path, response, networkError = null) => {
  console.error('=== CORS ERROR DIAGNOSTIC ===');
  console.error(`Request URL: ${API_BASE_URL}${path}`);
  console.error(`Origin: ${window.location.origin}`);
  
  if (response) {
    console.error(`Status: ${response.status}`);
    console.error('Headers received:');
    response.headers.forEach((value, key) => {
      console.error(`  ${key}: ${value}`);
    });
  }
  
  if (networkError) {
    console.error('Network Error:', networkError.message);
  }
  
  console.error('=== END DIAGNOSTIC ===');
  
  // Suggest fixes
  console.info('Suggested fixes for API Gateway:');
  console.info('1. Enable CORS in API Gateway for this resource');
  console.info('2. Add Access-Control-Allow-Origin header with your domain or *');
  console.info('3. Configure OPTIONS method to return 200 with proper CORS headers');
  console.info('4. Ensure Lambda functions include CORS headers in their responses');
};

// A potential workaround for some CORS issues (as a last resort)
const corsWorkaroundFetch = async (path, originalOptions = {}) => {
  console.warn('Attempting CORS workaround for', path);
  
  // Some possible workarounds:
  // 1. Try with a different content-type
  const modifiedOptions = {
    ...originalOptions,
    headers: {
      ...originalOptions.headers,
      'Content-Type': 'text/plain', // Sometimes helps with preflight issues
    }
  };
  
  try {
    // Warning: This is a fallback and not a proper solution
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...modifiedOptions,
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      throw new Error(`API error in workaround: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('CORS workaround also failed:', error);
    throw new Error(`CORS issue for ${path} could not be resolved. API Gateway needs configuration.`);
  }
};

// Function to test API Gateway CORS configuration
export const checkApiGatewayCors = async () => {
  const endpoints = ['/users/profile-image', '/services'];
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      // First try a preflight request
      console.info(`Testing OPTIONS preflight for ${endpoint}...`);
      const preflight = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        },
        mode: 'cors',
        credentials: 'omit'
      });
      
      const corsHeaders = {
        allowOrigin: preflight.headers.get('Access-Control-Allow-Origin'),
        allowMethods: preflight.headers.get('Access-Control-Allow-Methods'),
        allowHeaders: preflight.headers.get('Access-Control-Allow-Headers')
      };
      
      results[endpoint] = {
        preflight: {
          status: preflight.status,
          corsHeaders,
          success: preflight.status === 200 && corsHeaders.allowOrigin !== null
        }
      };
      
      console.info(`Preflight for ${endpoint}: ${results[endpoint].preflight.success ? 'SUCCESS' : 'FAILED'}`);
      
      // Only try the actual request if preflight succeeded or returned any response
      if (preflight.status !== 0) {
        console.info(`Testing actual request for ${endpoint}...`);
        
        try {
          const actualResponse = await fetchWithAuth(endpoint, { 
            attemptCorsWorkaround: false // Don't recurse
          });
          results[endpoint].actualRequest = {
            success: true,
            data: 'Received valid JSON response'
          };
        } catch (error) {
          results[endpoint].actualRequest = {
            success: false,
            error: error.message
          };
        }
      }
    } catch (error) {
      results[endpoint] = {
        error: error.message,
        success: false
      };
      console.error(`Complete failure testing ${endpoint}:`, error);
    }
  }
  
  const overallSuccess = Object.values(results).every(
    result => result.preflight?.success && result.actualRequest?.success
  );
  
  return {
    success: overallSuccess,
    results,
    recommendations: !overallSuccess ? [
      'Configure CORS on API Gateway for each resource',
      'Ensure OPTIONS method returns 200 with correct headers',
      'Add Access-Control-Allow-Origin header with your domain',
      'Check Lambda function response headers',
      'Verify IAM permissions for Lambda execution'
    ] : []
  };
};

// Function to generate API Gateway CORS configuration instructions
export const generateCorsConfigInstructions = () => {
  const origin = window.location.origin;
  
  return {
    apiGatewayConsole: [
      `1. Log in to AWS Console and navigate to API Gateway`,
      `2. Select your API: ${API_BASE_URL.split('/').pop()}`,
      `3. For each resource with CORS issues:`,
      `   a. Select the resource`,
      `   b. Click "Actions" dropdown`,
      `   c. Select "Enable CORS"`,
      `   d. Set "Access-Control-Allow-Origin" to "${origin}" (or * for testing)`,
      `   e. Check all required methods (GET, POST, etc.)`,
      `   f. Click "Enable CORS and replace existing CORS headers"`,
      `   g. Click "Yes, replace existing values"`,
      `4. Deploy your API to the prod stage`
    ],
    lambdaResponse: [
      `Ensure your Lambda functions include these headers in responses:`,
      `{`,
      `  "headers": {`,
      `    "Access-Control-Allow-Origin": "${origin}",`,
      `    "Access-Control-Allow-Headers": "Content-Type,Authorization",`,
      `    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"`,
      `  }`,
      `}`
    ]
  };
};

// Example API functions
export const getUserProfile = () => fetchWithAuth('/users/profile');
export const getProfileImage = () => fetchWithAuth('/users/profile-image');
// Add other API functions as needed

// Example function to fetch profile image
export const fetchProfileImage = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile-image`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit' // Add this to match API Gateway configuration
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching profile image: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error getting profile image:', error);
    throw error;
  }
};

// Function to test CORS preflight response
export const testCorsPreflightRequest = async (path) => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    // Check status code
    const isSuccessful = response.status === 200;
    
    // Check if CORS headers exist
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    };
    
    return {
      isSuccessful,
      status: response.status,
      corsHeaders,
      hasRequiredHeaders: Object.values(corsHeaders).every(header => header !== null)
    };
  } catch (error) {
    console.error('CORS preflight request test failed:', error);
    return {
      isSuccessful: false,
      error: error.message
    };
  }
};

// Function to verify CORS headers in responses
export const verifyCorsHeaders = async (path, method = 'GET') => {
  try {
    const token = localStorage.getItem('idToken') || '';
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
        'Origin': window.location.origin
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Expose-Headers': response.headers.get('Access-Control-Expose-Headers')
    };
    
    return {
      isSuccessful: response.ok,
      status: response.status,
      corsHeaders,
      hasRequiredHeaders: corsHeaders['Access-Control-Allow-Origin'] !== null
    };
  } catch (error) {
    console.error('CORS headers verification failed:', error);
    return {
      isSuccessful: false,
      error: error.message
    };
  }
};

// Function to check Lambda permissions (Note: This is a client-side simulation)
export const checkLambdaPermissions = async () => {
  try {
    // This is a mock endpoint that would be implemented on your backend
    // to report Lambda permissions status
    const response = await fetchWithAuth('/system/lambda-permissions');
    return response;
  } catch (error) {
    console.error('Lambda permissions check failed:', error);
    return {
      isSuccessful: false,
      error: error.message,
      message: 'Unable to verify Lambda permissions. This likely requires server-side validation.'
    };
  }
};

// Utility function to run all CORS tests and provide a report
export const runCorsTests = async () => {
  const tests = {
    preflight: await testCorsPreflightRequest('/users/profile'),
    actualRequest: await verifyCorsHeaders('/users/profile')
  };
  
  const allPassed = Object.values(tests).every(test => test.isSuccessful && test.hasRequiredHeaders);
  
  console.log('CORS Test Results:', tests);
  
  return {
    tests,
    allPassed,
    summary: allPassed 
      ? 'All CORS tests passed successfully'
      : 'Some CORS tests failed. Check the detailed results.'
  };
};
