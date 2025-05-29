// src/hooks/useUserManagement.js
import { useState } from 'react';
import adminService from '../services/adminService';

const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper function to extract username from email
  const extractUsernameFromEmail = (email) => {
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return email || '';
    }
    return email.split('@')[0];
  };

  /**
   * Get all users
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await adminService.listUsers();
      
      // Ensure all users have a displayUsername
      const processedUsers = data.users.map(user => ({
        ...user,
        displayUsername: user.displayUsername || extractUsernameFromEmail(user.email) || user.username
      }));
      
      setUsers(processedUsers);
      return processedUsers;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Create a new user
   * @param {Object} userData - User data
   */
  const createUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure username is derived from email if not provided
      if (!userData.username && userData.email) {
        userData.username = extractUsernameFromEmail(userData.email);
      }
      
      const newUser = await adminService.createUser(userData);
      
      // Add displayUsername to the new user
      newUser.displayUsername = extractUsernameFromEmail(newUser.email) || newUser.username;
      
      setUsers(prevUsers => [...prevUsers, newUser]);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Update user data
   * @param {Object} userData - User data with id and updated fields
   */
  const updateUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure we have a userId
      const userId = userData.id || userData.sub || userData.uniqueId;
      if (!userId) {
        throw new Error('User ID is required for updating a user');
      }
      
      // Ensure username is derived from email if not present
      if (!userData.username && userData.email) {
        userData.username = extractUsernameFromEmail(userData.email);
      }
      
      const updatedUser = await adminService.updateUser(userId, userData);
      
      // Add displayUsername to the updated user
      updatedUser.displayUsername = extractUsernameFromEmail(updatedUser.email) || updatedUser.username;
      
      // Update users list
      setUsers(prevUsers => 
        prevUsers.map(user => 
          (user.id === userId || user.sub === userId || user.uniqueId === userId) 
            ? { ...user, ...updatedUser } 
            : user
        )
      );
      
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Toggle user enabled status
   * @param {string} userId - The user ID
   * @param {boolean} enabled - Whether to enable or disable the user
   */
  const toggleUserStatus = async (userId, enabled) => {
    try {
      setLoading(true);
      setError(null);
      if (!userId) {
        throw new Error('User ID is required to toggle user status');
      }
      if (enabled) {
        await adminService.enableUser(userId);
      } else {
        await adminService.disableUser(userId);
      }
      setUsers(prevUsers => 
        prevUsers.map(user => 
          (user.id === userId || user.sub === userId || user.uniqueId === userId) ? { ...user, enabled } : user
        )
      );
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    updateUser,
    toggleUserStatus,
    fetchUsers,
    createUser,
  };
};

export default useUserManagement;