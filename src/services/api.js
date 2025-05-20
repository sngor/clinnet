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
    mode: 'cors' // Explicitly set CORS mode
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
      mode: 'cors' // Explicitly set CORS mode
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
