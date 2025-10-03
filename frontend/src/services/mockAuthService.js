// Mock authentication service for local development
import config from './config.js';

const MOCK_USERS = {
  admin: {
    id: 'user-1',
    username: 'admin',
    email: 'admin@clinnet.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    password: 'Admin@123!'
  },
  doctor: {
    id: 'user-2',
    username: 'doctor',
    email: 'doctor@clinnet.com',
    firstName: 'Dr. Sarah',
    lastName: 'Smith',
    role: 'doctor',
    password: 'Doctor@123!'
  },
  frontdesk: {
    id: 'user-3',
    username: 'frontdesk',
    email: 'frontdesk@clinnet.com',
    firstName: 'Front',
    lastName: 'Desk',
    role: 'frontdesk',
    password: 'Frontdesk@123!'
  }
};

class MockAuthService {
  constructor() {
    this.currentUser = null;
    this.token = null;
  }

  // Check if we're in mock mode
  isMockMode() {
    return config.ENVIRONMENT === 'development' && 
           (config.COGNITO.USER_POOL_ID === 'local-development' || 
            config.API_ENDPOINT.includes('localhost'));
  }

  // Mock login
  async login(username, password) {
    console.log('[MockAuth] Login attempt:', { username, password, isMockMode: this.isMockMode() });
    
    if (!this.isMockMode()) {
      throw new Error('Mock auth service should only be used in development');
    }

    // Try to find user by username or email
    let user = MOCK_USERS[username];
    
    // If not found by username, try to find by email
    if (!user) {
      user = Object.values(MOCK_USERS).find(u => u.email === username);
    }
    
    console.log('[MockAuth] Found user:', user);
    console.log('[MockAuth] Password match:', user?.password === password);
    
    if (user && user.password === password) {
      this.currentUser = { ...user };
      delete this.currentUser.password; // Remove password from user object
      this.token = `mock-jwt-token-${Date.now()}`;
      
      // Store in localStorage for persistence
      localStorage.setItem('mock-auth-user', JSON.stringify(this.currentUser));
      localStorage.setItem('mock-auth-token', this.token);
      
      return {
        success: true,
        user: this.currentUser,
        token: this.token
      };
    } else {
      throw new Error('Invalid credentials');
    }
  }

  // Mock logout
  async logout() {
    this.currentUser = null;
    this.token = null;
    localStorage.removeItem('mock-auth-user');
    localStorage.removeItem('mock-auth-token');
  }

  // Get current session
  async getCurrentSession() {
    if (!this.isMockMode()) {
      return null;
    }

    // Check localStorage for existing session
    const storedUser = localStorage.getItem('mock-auth-user');
    const storedToken = localStorage.getItem('mock-auth-token');
    
    if (storedUser && storedToken) {
      this.currentUser = JSON.parse(storedUser);
      this.token = storedToken;
      
      return {
        isValid: () => true,
        getIdToken: () => ({
          getJwtToken: () => this.token
        }),
        user: this.currentUser
      };
    }
    
    return null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get auth token
  getAuthToken() {
    return this.token;
  }

  // Mock user info
  async getUserInfo() {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    // Try to get from localStorage
    const storedUser = localStorage.getItem('mock-auth-user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      return this.currentUser;
    }
    
    return null;
  }
}

export const mockAuthService = new MockAuthService();
export default mockAuthService;