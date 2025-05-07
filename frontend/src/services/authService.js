// filepath: /Users/sengngor/Desktop/App/Clinnet-EMR/frontend/src/services/authService.js
const authService = {
  login: async (credentials) => {
    // Simulate login logic
    if (credentials.username === 'admin' && credentials.password === 'password') {
      return { success: true, token: 'fake-jwt-token' };
    } else {
      throw new Error('Invalid username or password');
    }
  },
  logout: () => {
    console.log('User logged out');
  },
};

export default authService;