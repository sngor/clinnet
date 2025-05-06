// src/services/userService.js
import { get, post, put, del } from 'aws-amplify/api';

// Get all users
export const getUsers = async () => {
  try {
    const response = await get({
      apiName: 'clinnetApi',
      path: '/users'
    });
    return response.body;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await get({
      apiName: 'clinnetApi',
      path: `/users/${userId}`
    });
    return response.body;
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const response = await post({
      apiName: 'clinnetApi',
      path: '/users',
      options: {
        body: userData
      }
    });
    return response.body;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update a user
export const updateUser = async (userId, userData) => {
  try {
    const response = await put({
      apiName: 'clinnetApi',
      path: `/users/${userId}`,
      options: {
        body: userData
      }
    });
    return response.body;
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (userId) => {
  try {
    const response = await del({
      apiName: 'clinnetApi',
      path: `/users/${userId}`
    });
    return response.body;
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    throw error;
  }
};

export default {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};