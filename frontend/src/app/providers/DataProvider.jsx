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
import { mockPatients, mockServices } from "../../services/mockData";

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
  const [useMockData, setUseMockData] = useState(false);

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
        setError(null);

        // Fetch services from DynamoDB via API
        try {
          console.log("Fetching services from DynamoDB...");
          const servicesFromApi = await serviceApi.getAllServices();
          console.log("Services loaded from DynamoDB:", servicesFromApi);
          setServices(servicesFromApi || []);
          setUseMockData(false);
        } catch (serviceError) {
          console.error("Error loading services:", serviceError);
          console.error("Error details:", serviceError.message);
          setError("Failed to load services. Using mock data.");
          setServices(mockServices);
          setUseMockData(true);
        }

        // Fetch patients from DynamoDB via API
        try {
          console.log("Fetching patients from DynamoDB...");
          const patientsFromApi = await fetchPatients();
          console.log("Patients loaded from DynamoDB:", patientsFromApi);
          setPatients(patientsFromApi || []);
          setUseMockData(false);
        } catch (patientError) {
          console.error("Error loading patients:", patientError);
          console.error("Error details:", patientError.message);
          setError("Failed to load patients. Using mock data.");
          setPatients(mockPatients);
          setUseMockData(true);
        }

        setInitialized(true);
        console.log("Data initialization complete");
      } catch (err) {
        console.error("Error initializing data:", err);
        setError(err.message || "Failed to initialize application data");
        setUseMockData(true);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [isAuthenticated]);

  // Refresh services data
  const refreshServices = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Refreshing services data...");
      
      try {
        const servicesFromApi = await serviceApi.getAllServices();
        console.log("Services refreshed successfully:", servicesFromApi);
        setServices(servicesFromApi || []);
        setUseMockData(false);
        return servicesFromApi;
      } catch (err) {
        console.error("Error refreshing services:", err);
        console.error("Error details:", err.message);
        setError("Failed to refresh services. Using mock data.");
        setServices(mockServices);
        setUseMockData(true);
        return mockServices;
      }
    } finally {
      setLoading(false);
    }
  };

  // Refresh patients data
  const refreshPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Refreshing patients data...");
      
      try {
        const patientsFromApi = await fetchPatients();
        console.log("Patients refreshed successfully:", patientsFromApi);
        setPatients(patientsFromApi || []);
        setUseMockData(false);
        return patientsFromApi;
      } catch (err) {
        console.error("Error refreshing patients:", err);
        console.error("Error details:", err.message);
        setError("Failed to refresh patients. Using mock data.");
        setPatients(mockPatients);
        setUseMockData(true);
        return mockPatients;
      }
    } finally {
      setLoading(false);
    }
  };

  // Service operations
  const addService = async (serviceData) => {
    try {
      console.log("Adding new service:", serviceData);
      
      if (useMockData) {
        // Create a mock service with ID
        const newService = {
          id: Date.now().toString(),
          ...serviceData,
          createdAt: new Date().toISOString()
        };
        
        // Add to mock data
        mockServices.push(newService);
        setServices([...mockServices]);
        return newService;
      } else {
        const newService = await serviceApi.createService(serviceData);
        console.log("Service added successfully:", newService);
        setServices(prevServices => [...prevServices, newService]);
        return newService;
      }
    } catch (err) {
      console.error("Error adding service:", err);
      throw err;
    }
  };

  const updateService = async (id, serviceData) => {
    try {
      console.log(`Updating service ${id} with data:`, serviceData);
      
      if (useMockData) {
        // Find service in mock data
        const index = mockServices.findIndex(s => s.id === id);
        
        if (index === -1) {
          throw new Error(`Service with ID ${id} not found`);
        }
        
        // Update service
        const updatedService = {
          ...mockServices[index],
          ...serviceData,
          updatedAt: new Date().toISOString()
        };
        
        // Update in mock data
        mockServices[index] = updatedService;
        setServices([...mockServices]);
        return updatedService;
      } else {
        const updatedService = await serviceApi.updateService(id, serviceData);
        console.log("Service updated successfully:", updatedService);
        setServices(services.map(service => 
          service.id === id ? updatedService : service
        ));
        return updatedService;
      }
    } catch (err) {
      console.error(`Error updating service ${id}:`, err);
      throw err;
    }
  };

  const deleteService = async (id) => {
    try {
      console.log(`Deleting service with ID: ${id}`);
      
      if (useMockData) {
        // Find service index
        const index = mockServices.findIndex(s => s.id === id);
        
        if (index === -1) {
          throw new Error(`Service with ID ${id} not found`);
        }
        
        // Remove from mock data
        mockServices.splice(index, 1);
        setServices([...mockServices]);
        return { success: true };
      } else {
        await serviceApi.deleteService(id);
        console.log(`Service ${id} deleted successfully`);
        setServices(services.filter(service => service.id !== id));
        return true;
      }
    } catch (err) {
      console.error(`Error deleting service ${id}:`, err);
      throw err;
    }
  };

  // Patient operations
  const addPatient = async (patientData) => {
    try {
      console.log("Adding new patient:", patientData);
      
      if (useMockData) {
        // Create a mock patient with ID
        const newPatient = {
          id: Date.now().toString(),
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          dateOfBirth: patientData.dob,
          gender: patientData.gender || 'Not Specified',
          phone: patientData.phone,
          contactNumber: patientData.phone,
          email: patientData.email,
          address: patientData.address,
          insuranceProvider: patientData.insuranceProvider,
          insuranceNumber: patientData.insuranceNumber,
          status: patientData.status || 'Active',
          createdAt: new Date().toISOString()
        };
        
        // Add to mock data
        mockPatients.push(newPatient);
        setPatients([...mockPatients]);
        return newPatient;
      } else {
        const newPatient = await createPatient(patientData);
        console.log("Patient added successfully:", newPatient);
        setPatients(prevPatients => [...prevPatients, newPatient]);
        return newPatient;
      }
    } catch (err) {
      console.error("Error adding patient:", err);
      throw err;
    }
  };

  const updatePatient = async (id, patientData) => {
    try {
      console.log(`Updating patient ${id} with data:`, patientData);
      
      if (useMockData) {
        // Find patient in mock data
        const index = mockPatients.findIndex(p => p.id === id);
        
        if (index === -1) {
          throw new Error(`Patient with ID ${id} not found`);
        }
        
        // Update patient
        const updatedPatient = {
          ...mockPatients[index],
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          dateOfBirth: patientData.dob,
          gender: patientData.gender || mockPatients[index].gender,
          phone: patientData.phone,
          contactNumber: patientData.phone,
          email: patientData.email,
          address: patientData.address,
          insuranceProvider: patientData.insuranceProvider,
          insuranceNumber: patientData.insuranceNumber,
          status: patientData.status,
          updatedAt: new Date().toISOString()
        };
        
        // Update in mock data
        mockPatients[index] = updatedPatient;
        setPatients([...mockPatients]);
        return updatedPatient;
      } else {
        const updatedPatient = await updatePatientApi(id, patientData);
        console.log("Patient updated successfully:", updatedPatient);
        setPatients(patients.map(patient => 
          patient.id === id ? updatedPatient : patient
        ));
        return updatedPatient;
      }
    } catch (err) {
      console.error(`Error updating patient ${id}:`, err);
      throw err;
    }
  };

  const deletePatient = async (id) => {
    try {
      console.log(`Deleting patient with ID: ${id}`);
      
      if (useMockData) {
        // Find patient index
        const index = mockPatients.findIndex(p => p.id === id);
        
        if (index === -1) {
          throw new Error(`Patient with ID ${id} not found`);
        }
        
        // Remove from mock data
        mockPatients.splice(index, 1);
        setPatients([...mockPatients]);
        return { success: true };
      } else {
        await deletePatientApi(id);
        console.log(`Patient ${id} deleted successfully`);
        setPatients(patients.filter(patient => patient.id !== id));
        return true;
      }
    } catch (err) {
      console.error(`Error deleting patient ${id}:`, err);
      throw err;
    }
  };

  const value = {
    initialized,
    loading,
    error,
    useMockData,
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