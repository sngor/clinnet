// src/app/providers/DataProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import patientService from "../../services/patients";

// Create context
const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for services and patients
  const [services, setServices] = useState([]);
  const [patients, setPatients] = useState([]);

  // Initialize data when authenticated
  useEffect(() => {
    const initializeData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        console.log("Initializing app data...");

        // Fetch real patients data from the API
        const patientsData = await patientService.fetchPatients();
        setPatients(patientsData);
        console.log("Patients loaded:", patientsData);

        setInitialized(true);
        console.log("Data initialization complete");
      } catch (err) {
        console.error("Error initializing data:", err);
        setError(err.message || "Failed to initialize application data");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [isAuthenticated]);

  // Mock service operations
  const addService = async (serviceData) => {
    const newService = {
      id: services.length + 1,
      ...serviceData,
    };
    setServices([...services, newService]);
    return newService;
  };

  const updateService = async (id, serviceData) => {
    const updatedServices = services.map((service) =>
      service.id === id ? { ...service, ...serviceData } : service
    );
    setServices(updatedServices);
    return updatedServices.find((service) => service.id === id);
  };

  const deleteService = async (id) => {
    const updatedServices = services.filter((service) => service.id !== id);
    setServices(updatedServices);
    return true;
  };

  // Patient operations with real API calls
  const addPatient = async (patientData) => {
    try {
      const newPatient = await patientService.createPatient(patientData);
      setPatients([...patients, newPatient]);
      return newPatient;
    } catch (error) {
      console.error("Error adding patient:", error);
      throw error;
    }
  };

  const updatePatient = async (id, patientData) => {
    try {
      const updatedPatient = await patientService.updatePatient(
        id,
        patientData
      );
      setPatients(
        patients.map((patient) =>
          patient.id === id ? updatedPatient : patient
        )
      );
      return updatedPatient;
    } catch (error) {
      console.error("Error updating patient:", error);
      throw error;
    }
  };

  const deletePatient = async (id) => {
    try {
      await patientService.deletePatient(id);
      setPatients(patients.filter((patient) => patient.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting patient:", error);
      throw error;
    }
  };

  const value = {
    initialized,
    loading,
    error,
    // Services
    services,
    addService,
    updateService,
    deleteService,
    // Patients
    patients,
    addPatient,
    updatePatient,
    deletePatient,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

// Export useAppData as an alias for useData to maintain compatibility
export const useAppData = useData;
