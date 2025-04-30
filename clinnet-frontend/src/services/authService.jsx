// Simulates API calls. Replace with actual fetch or axios calls to your backend.
// import axios from 'axios';
// const API_URL = 'http://localhost:8000/api/auth/'; // Your Django backend URL
import DOMPurify from 'dompurify'; // Use DOMPurify for logging safety
export const login = async (username, password) => {
    // Import DOMPurify for sanitizing user input
    console.log('Simulating login for:', DOMPurify.sanitize(username));
    // Replace with actual API call
    // const response = await axios.post(API_URL + 'login/', { username, password });
    // if (response.data.token) {
    //   localStorage.setItem('userToken', response.data.token); // Example token storage
    // }
    // return response.data.user; // Should return { username, role, id, etc. }
  
    // --- Placeholder Logic ---
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

    // Simplified placeholder authentication
    const users = [
        { username: 'admin', password: 'password', role: 'admin', id: 1 },
        { username: 'doctor', password: 'password', role: 'doctor', id: 2 },
        { username: 'frontdesk', password: 'password', role: 'frontdesk', id: 3 }
    ];

    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        // Simulate API error for invalid credentials
        throw new Error('Invalid username or password');
  }
  return { username: user.username, role: user.role, id: user.id };
}
    // --- End Placeholder ---
  
  export const logout = async () => {
    console.log('Simulating logout');
    // Replace with actual API call if needed (e.g., invalidate token on backend)
    // await axios.post(API_URL + 'logout/', {}, { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } });
    // localStorage.removeItem('userToken'); // Clear token
  
    // --- Placeholder Logic ---
    await new Promise(resolve => setTimeout(resolve, 300));
    // No return value needed usually, or maybe confirmation
    // --- End Placeholder ---
  };
  
  export const checkAuthStatus = async () => {
      console.log('Simulating checking auth status');
      // In a real app, you'd likely:
      // 1. Check if a token exists (e.g., in localStorage or httpOnly cookie)
      // 2. Send the token to a backend endpoint (e.g., /api/auth/status/ or /api/users/me/)
      // 3. Backend validates the token and returns user data if valid, error/null otherwise.
      // const token = localStorage.getItem('userToken');
      // if (!token) return null;
      // try {
      //   const response = await axios.get(API_URL + 'status/', { headers: { Authorization: `Bearer ${token}` } });
      //   return response.data.user; // { username, role, id, etc. }
      // } catch (error) {
      //   console.error("Token validation failed", error);
      //   localStorage.removeItem('userToken'); // Clean up invalid token
      //   return null;
      // }
  
      // --- Placeholder Logic ---
      // Simulate finding a logged-in user sometimes for testing purposes
      // Remove or modify this for real use
      await new Promise(resolve => setTimeout(resolve, 400));
      // Example: return { username: 'doctor', role: 'doctor', id: 2 };
      return null; // Simulate not being logged in initially
      // --- End Placeholder ---
  }