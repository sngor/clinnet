// src/app/providers/DataProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

// Create context
const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize data when authenticated
  useEffect(() => {
    const initializeData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Initializing app data...');
        
        // For now, just set initialized to true without loading any data
        // This prevents API errors while we focus on authentication
        
        setInitialized(true);
        console.log('Data initialization complete');
      } catch (err) {
        console.error('Error initializing data:', err);
        setError(err.message || 'Failed to initialize application data');
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [isAuthenticated]);
  
  const value = {
    initialized,
    loading,
    error,
    // Add other data and methods here as needed
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};