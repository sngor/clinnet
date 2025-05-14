// src/app/providers/DataProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { 
  getPatients as fetchPatients, 
  getPatientById as fetchPatientById, 
  createPatient, 
  updatePatient as updatePatientApi, 
  deletePatient as deletePatientApi 
} from "../../services/patientService";
import serviceApi from "../../services/serviceApi";

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

        // Fetch services from DynamoDB via API
        try {
          const servicesFromApi = await serviceApi.getAllServices();
          setServices(servicesFromApi);
          console.log("Services loaded from DynamoDB:", servicesFromApi);
        } catch (serviceError) {
          console.error("Error loading services:", serviceError);
          setError("Failed to load services. Please try again later.");
        }

        // Fetch patients from DynamoDB via API
        try {
          console.log("Fetching patients from DynamoDB...");
          const patientsFromApi = await fetchPatients();
          console.log("Patients loaded from DynamoDB:", patientsFromApi);
          setPatients(patientsFromApi);
        } catch (patientError) {
          console.error("Error loading patients:", patientError);
          setError("Failed to load patients. Please try again later.");
        }

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
      console.log("Refreshing patients data...");
      const patientsFromApi = await fetchPatients();
      console.log("Patients refreshed successfully:", patientsFromApi);
      setPatients(patientsFromApi);
      return patientsFromApi;
    } catch (err) {
      console.error("Error refreshing patients:", err);
      setError(err.message || "Failed to refresh patients");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Refresh services data
  const refreshServices = async () => {
    try {
      setLoading(true);
      const servicesFromApi = await serviceApi.getAllServices();
      setServices(servicesFromApi);
      console.log("Services refreshed:", servicesFromApi);
      return servicesFromApi;
    } catch (err) {
      console.error("Error refreshing services:", err);
      setError(err.message || "Failed to refresh services");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Service operations using DynamoDB API
  const addService = async (serviceData) => {
    try {
      const newService = await serviceApi.createService(serviceData);
      setServices([...services, newService]);
      return newService;
    } catch (err) {
      console.error("Error adding service:", err);
      throw err;
    }
  };

  const updateService = async (id, serviceData) => {
    try {
      const updatedService = await serviceApi.updateService(id, serviceData);
      setServices(services.map(service => 
        service.id === id ? updatedService : service
      ));
      return updatedService;
    } catch (err) {
      console.error(`Error updating service ${id}:`, err);
      throw err;
    }
  };

  const deleteService = async (id) => {
    try {
      await serviceApi.deleteService(id);
      setServices(services.filter(service => service.id !== id));
      return true;
    } catch (err) {
      console.error(`Error deleting service ${id}:`, err);
      throw err;
    }
  };

  // Patient operations using DynamoDB API
  const addPatient = async (patientData) => {
    try {
      console.log("Adding new patient:", patientData);
      
      // Add error handling for missing data
      if (!patientData.firstName || !patientData.lastName) {
        throw new Error("Patient first name and last name are required");
      }
      
      const newPatient = await createPatient(patientData);
      console.log("Patient added successfully:", newPatient);
      
      // Only update state if we got a valid response
      if (newPatient) {
        setPatients(prevPatients => [...prevPatients, newPatient]);
        return newPatient;
      } else {
        throw new Error("Failed to create patient - no data returned");
      }
    } catch (err) {
      console.error("Error adding patient:", err);
      console.error("Error details:", err.message);
      throw err;
    }
  };

  const updatePatient = async (id, patientData) => {
    try {
      console.log(`Updating patient ${id} with data:`, patientData);
      const updatedPatient = await updatePatientApi(id, patientData);
      console.log("Patient updated successfully:", updatedPatient);
      setPatients(patients.map(patient => 
        patient.id === id ? updatedPatient : patient
      ));
      return updatedPatient;
    } catch (err) {
      console.error(`Error updating patient ${id}:`, err);
      console.error("Error details:", err.message);
      throw err;
    }
  };

  const deletePatient = async (id) => {
    try {
      console.log(`Deleting patient with ID: ${id}`);
      await deletePatientApi(id);
      console.log(`Patient ${id} deleted successfully`);
      setPatients(patients.filter(patient => patient.id !== id));
      return true;
    } catch (err) {
      console.error(`Error deleting patient ${id}:`, err);
      console.error("Error details:", err.message);
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
    refreshServices,
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