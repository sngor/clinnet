// src/services/userService.js
import api from './api';

// Get all users
export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Login (simulated with JSON Server)
export const login = async (credentials) => {
  try {
    // With JSON Server, we need to fetch users and filter manually
    const response = await api.get(`/users?username=${credentials.username}`);
    const user = response.data[0];
    
    if (user && user.password === credentials.password) {
      // In a real app, you would get a token from the server
      // For now, we'll just return the user without the password
      const { password, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, success: true };
    } else {
      throw new Error('Invalid username or password');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};