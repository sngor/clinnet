// src/app/providers/DataProvider.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeAppData } from '../../services/dataInitializer';

// Create context
const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    services: [],
    patients: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const appData = await initializeAppData();
        setData({
          services: appData.services || [],
          patients: appData.patients || [],
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Failed to load application data:', error);
        setData(prevData => ({
          ...prevData,
          loading: false,
          error: 'Failed to load application data. Please try again later.'
        }));
      }
    };

    loadData();
  }, []);

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useAppData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within a DataProvider');
  }
  return context;
};