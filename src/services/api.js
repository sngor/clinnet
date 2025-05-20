const API_BASE_URL = 'https://libzdu3ibi.execute-api.us-east-2.amazonaws.com/prod';

export const fetchWithAuth = async (path, options = {}) => {
  // Get auth token from your authentication system
  const token = localStorage.getItem('idToken') || ''; // adjust based on your auth storage

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': token
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
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
