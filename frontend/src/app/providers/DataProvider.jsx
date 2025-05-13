// src/app/providers/DataProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { 
  fetchPatients, 
  fetchPatientById, 
  createPatient, 
  updatePatient as updatePatientApi, 
  deletePatient as deletePatientApi 
} from "../../services/patients";

// Create context
const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data for services and patients
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
        setLoading(true);

        // Mock services data
        const mockServices = [
          {
            id: 1,
            name: "General Consultation",
            description:
              "Standard medical consultation with a general practitioner",
            category: "consultation",
            price: 100,
            discountPercentage: 0,
            duration: 30,
            active: true,
          },
          {
            id: 2,
            name: "Blood Test",
            description: "Complete blood count and analysis",
            category: "laboratory",
            price: 75,
            discountPercentage: 0,
            duration: 15,
            active: true,
          },
        ];

        // Fetch patients from DynamoDB via API
        try {
          const patientsFromApi = await fetchPatients();
          setPatients(patientsFromApi);
          console.log("Patients loaded from DynamoDB:", patientsFromApi);
        } catch (patientError) {
          console.error("Error loading patients:", patientError);
          setError("Failed to load patients. Please try again later.");
        }

        setServices(mockServices);
        console.log("Services loaded:", mockServices);

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

  // Refresh patients data
  const refreshPatients = async () => {
    try {
      setLoading(true);
      const patientsFromApi = await fetchPatients();
      setPatients(patientsFromApi);
      console.log("Patients refreshed:", patientsFromApi);
      return patientsFromApi;
    } catch (err) {
      console.error("Error refreshing patients:", err);
      setError(err.message || "Failed to refresh patients");
      throw err;
    } finally {
      setLoading(false);
    }
  };

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

  // Patient operations using DynamoDB API
  const addPatient = async (patientData) => {
    try {
      const newPatient = await createPatient(patientData);
      setPatients([...patients, newPatient]);
      return newPatient;
    } catch (err) {
      console.error("Error adding patient:", err);
      throw err;
    }
  };

  const updatePatient = async (id, patientData) => {
    try {
      const updatedPatient = await updatePatientApi(id, patientData);
      setPatients(patients.map(patient => 
        patient.id === id ? updatedPatient : patient
      ));
      return updatedPatient;
    } catch (err) {
      console.error(`Error updating patient ${id}:`, err);
      throw err;
    }
  };

  const deletePatient = async (id) => {
    try {
      await deletePatientApi(id);
      setPatients(patients.filter(patient => patient.id !== id));
      return true;
    } catch (err) {
      console.error(`Error deleting patient ${id}:`, err);
      throw err;
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
    refreshPatients,
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