const API_BASE_URL = 'https://libzdu3ibi.execute-api.us-east-2.amazonaws.com/prod';

export const fetchWithAuth = async (path, options = {}) => {
  // Get auth token from your authentication system
  const token = localStorage.getItem('idToken') || ''; // adjust based on your auth storage

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': token,
    'Origin': window.location.origin // Add Origin header for CORS
  };

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
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
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
