// src/app/providers/DataProvider.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeAppData } from '../../services/dataInitializer';
<<<<<<< HEAD
<<<<<<< HEAD
import patientService from '../../services/patientService';
import { serviceApi } from '../../services';
import appointmentService from '../../services/appointmentService';

// Create context
const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    services: [],
    patients: [],
    loading: true,
    error: null
  });

<<<<<<< HEAD
<<<<<<< HEAD
  // Function to refresh data from the API
  const refreshData = useCallback(async () => {
    try {
      setData(prevData => ({
        ...prevData,
        loading: true,
        error: null
      }));
      
      const appData = await initializeAppData();
      
      setData({
        services: appData.services || [],
        patients: appData.patients || [],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to refresh application data:', error);
      setData(prevData => ({
        ...prevData,
        loading: false,
        error: 'Failed to load application data. Please try again later.'
      }));
    }
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Functions to update data
  const addPatient = async (patientData) => {
    try {
      console.log('Adding patient with data:', patientData);
      const newPatient = await patientService.createPatient(patientData);
      console.log('Patient created successfully:', newPatient);
      
      // Update local state with the new patient
      setData(prevData => ({
        ...prevData,
        patients: [...prevData.patients, newPatient]
      }));
      return newPatient;
    } catch (error) {
      console.error('Error adding patient:', error);
      throw error;
    }
  };

  const updatePatient = async (patientId, patientData) => {
    try {
      console.log('Updating patient with ID:', patientId, 'Data:', patientData);
      const updatedPatient = await patientService.updatePatient(patientId, patientData);
      console.log('Patient updated successfully:', updatedPatient);
      
      // Update local state with the updated patient
      setData(prevData => ({
        ...prevData,
        patients: prevData.patients.map(p => 
          p.id === patientId ? updatedPatient : p
        )
      }));
      return updatedPatient;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  };

  const deletePatient = async (patientId) => {
    try {
      await patientService.deletePatient(patientId);
      setData(prevData => ({
        ...prevData,
        patients: prevData.patients.filter(p => p.id !== patientId)
      }));
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  };

  const addService = async (serviceData) => {
    try {
      const newService = await serviceApi.create(serviceData);
      setData(prevData => ({
        ...prevData,
        services: [...prevData.services, newService]
      }));
      return newService;
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  };

  const updateService = async (serviceId, serviceData) => {
    try {
      const updatedService = await serviceApi.update(serviceId, serviceData);
      setData(prevData => ({
        ...prevData,
        services: prevData.services.map(s => 
          s.id === serviceId ? updatedService : s
        )
      }));
      return updatedService;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  };

  const deleteService = async (serviceId) => {
    try {
      await serviceApi.delete(serviceId);
      setData(prevData => ({
        ...prevData,
        services: prevData.services.filter(s => s.id !== serviceId)
      }));
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  };

  // Create the context value with data and functions
  const contextValue = {
    ...data,
    refreshData,
    addPatient,
    updatePatient,
    deletePatient,
    addService,
    updateService,
    deleteService
  };

=======
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

>>>>>>> parent of c7450fb (Implement data synchronization between frontend and DynamoDB)
=======
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

>>>>>>> parent of c7450fb (Implement data synchronization between frontend and DynamoDB)
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