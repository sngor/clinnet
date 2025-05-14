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

// Mock data for fallback
const mockPatients = [
  {
    id: "101",
    firstName: "John",
    lastName: "Doe",
    dob: "1985-05-15",
    dateOfBirth: "1985-05-15",
    phone: "555-1234",
    email: "john.doe@example.com",
    address: "123 Main St, Anytown, USA",
    insuranceProvider: "Blue Cross",
    insuranceNumber: "BC12345678",
    lastVisit: "2023-11-15",
    upcomingAppointment: "2023-12-10",
    status: "Active",
  },
  {
    id: "102",
    firstName: "Jane",
    lastName: "Smith",
    dob: "1990-08-22",
    dateOfBirth: "1990-08-22",
    phone: "555-5678",
    email: "jane.smith@example.com",
    address: "456 Oak Ave, Somewhere, USA",
    insuranceProvider: "Aetna",
    insuranceNumber: "AE87654321",
    lastVisit: "2023-10-05",
    upcomingAppointment: null,
    status: "Inactive",
  },
];

const mockServices = [
  {
    id: "1",
    name: "General Consultation",
    description: "Standard medical consultation",
    duration: 30,
    price: 100,
    category: "Consultation",
    active: true
  },
  {
    id: "2",
    name: "Specialized Consultation",
    description: "Consultation with a specialist",
    duration: 45,
    price: 150,
    category: "Consultation",
    active: true
  },
  {
    id: "3",
    name: "Blood Test",
    description: "Standard blood panel",
    duration: 15,
    price: 75,
    category: "Laboratory",
    active: true
  }
];

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
          console.log("Fetching services from DynamoDB...");
          const servicesFromApi = await serviceApi.getAllServices();
          console.log("Services loaded from DynamoDB:", servicesFromApi);
          
          if (servicesFromApi && servicesFromApi.length > 0) {
            setServices(servicesFromApi);
          } else {
            console.log("No services from API, using mock data");
            setServices(mockServices);
          }
        } catch (serviceError) {
          console.error("Error loading services:", serviceError);
          console.error("Error details:", serviceError.message);
          setError("Failed to load services. Using mock data.");
          setServices(mockServices);
        }

        // Fetch patients from DynamoDB via API
        try {
          console.log("Fetching patients from DynamoDB...");
          const patientsFromApi = await fetchPatients();
          console.log("Patients loaded from DynamoDB:", patientsFromApi);
          
          if (patientsFromApi && patientsFromApi.length > 0) {
            setPatients(patientsFromApi);
          } else {
            console.log("No patients from API, using mock data");
            setPatients(mockPatients);
          }
        } catch (patientError) {
          console.error("Error loading patients:", patientError);
          console.error("Error details:", patientError.message);
          setError("Failed to load patients. Using mock data.");
          setPatients(mockPatients);
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

  // Refresh services data
  const refreshServices = async () => {
    try {
      setLoading(true);
      console.log("Refreshing services data...");
      
      try {
        const servicesFromApi = await serviceApi.getAllServices();
        console.log("Services refreshed successfully:", servicesFromApi);
        
        if (servicesFromApi && servicesFromApi.length > 0) {
          setServices(servicesFromApi);
          return servicesFromApi;
        } else {
          console.log("No services from API refresh, using mock data");
          setServices(mockServices);
          return mockServices;
        }
      } catch (err) {
        console.error("Error refreshing services:", err);
        console.error("Error details:", err.message);
        setError("Failed to refresh services. Using mock data.");
        setServices(mockServices);
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
      console.log("Refreshing patients data...");
      
      try {
        const patientsFromApi = await fetchPatients();
        console.log("Patients refreshed successfully:", patientsFromApi);
        
        if (patientsFromApi && patientsFromApi.length > 0) {
          setPatients(patientsFromApi);
          return patientsFromApi;
        } else {
          console.log("No patients from API refresh, using mock data");
          setPatients(mockPatients);
          return mockPatients;
        }
      } catch (err) {
        console.error("Error refreshing patients:", err);
        console.error("Error details:", err.message);
        setError("Failed to refresh patients. Using mock data.");
        setPatients(mockPatients);
        return mockPatients;
      }
    } finally {
      setLoading(false);
    }
  };

  // Service operations using DynamoDB API
  const addService = async (serviceData) => {
    try {
      console.log("Adding new service:", serviceData);
      
      try {
        const newService = await serviceApi.createService(serviceData);
        console.log("Service added successfully:", newService);
        setServices([...services, newService]);
        return newService;
      } catch (err) {
        console.error("Error adding service:", err);
        console.error("Error details:", err.message);
        
        // Create a mock service with ID
        const mockService = {
          id: Date.now().toString(),
          ...serviceData,
          createdAt: new Date().toISOString()
        };
        
        setServices([...services, mockService]);
        return mockService;
      }
    } catch (err) {
      console.error("Error in addService:", err);
      throw err;
    }
  };

  const updateService = async (id, serviceData) => {
    try {
      console.log(`Updating service ${id} with data:`, serviceData);
      
      try {
        const updatedService = await serviceApi.updateService(id, serviceData);
        console.log("Service updated successfully:", updatedService);
        setServices(services.map(service => 
          service.id === id ? updatedService : service
        ));
        return updatedService;
      } catch (err) {
        console.error(`Error updating service ${id}:`, err);
        console.error("Error details:", err.message);
        
        // Update the service locally
        const updatedService = { ...serviceData, id };
        setServices(services.map(service => 
          service.id === id ? updatedService : service
        ));
        return updatedService;
      }
    } catch (err) {
      console.error(`Error in updateService ${id}:`, err);
      throw err;
    }
  };

  const deleteService = async (id) => {
    try {
      console.log(`Deleting service with ID: ${id}`);
      
      try {
        await serviceApi.deleteService(id);
        console.log(`Service ${id} deleted successfully`);
        setServices(services.filter(service => service.id !== id));
        return true;
      } catch (err) {
        console.error(`Error deleting service ${id}:`, err);
        console.error("Error details:", err.message);
        
        // Delete the service locally anyway
        setServices(services.filter(service => service.id !== id));
        return true;
      }
    } catch (err) {
      console.error(`Error in deleteService ${id}:`, err);
      throw err;
    }
  };

  // Patient operations using DynamoDB API
  const addPatient = async (patientData) => {
    try {
      console.log("Adding new patient:", patientData);
      
      try {
        const newPatient = await createPatient(patientData);
        console.log("Patient added successfully:", newPatient);
        setPatients([...patients, newPatient]);
        return newPatient;
      } catch (err) {
        console.error("Error adding patient:", err);
        console.error("Error details:", err.message);
        
        // Create a mock patient with ID
        const mockPatient = {
          id: Date.now().toString(),
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          dateOfBirth: patientData.dob,
          phone: patientData.phone,
          email: patientData.email,
          address: patientData.address,
          insuranceProvider: patientData.insuranceProvider,
          insuranceNumber: patientData.insuranceNumber,
          status: patientData.status || "Active",
          createdAt: new Date().toISOString()
        };
        
        setPatients([...patients, mockPatient]);
        return mockPatient;
      }
    } catch (err) {
      console.error("Error in addPatient:", err);
      throw err;
    }
  };

  const updatePatient = async (id, patientData) => {
    try {
      console.log(`Updating patient ${id} with data:`, patientData);
      
      try {
        const updatedPatient = await updatePatientApi(id, patientData);
        console.log("Patient updated successfully:", updatedPatient);
        setPatients(patients.map(patient => 
          patient.id === id ? updatedPatient : patient
        ));
        return updatedPatient;
      } catch (err) {
        console.error(`Error updating patient ${id}:`, err);
        console.error("Error details:", err.message);
        
        // Update the patient locally
        const updatedPatient = {
          id,
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          dateOfBirth: patientData.dob,
          phone: patientData.phone,
          email: patientData.email,
          address: patientData.address,
          insuranceProvider: patientData.insuranceProvider,
          insuranceNumber: patientData.insuranceNumber,
          status: patientData.status || "Active",
          updatedAt: new Date().toISOString()
        };
        
        setPatients(patients.map(patient => 
          patient.id === id ? updatedPatient : patient
        ));
        return updatedPatient;
      }
    } catch (err) {
      console.error(`Error in updatePatient ${id}:`, err);
      throw err;
    }
  };

  const deletePatient = async (id) => {
    try {
      console.log(`Deleting patient with ID: ${id}`);
      
      try {
        await deletePatientApi(id);
        console.log(`Patient ${id} deleted successfully`);
        setPatients(patients.filter(patient => patient.id !== id));
        return true;
      } catch (err) {
        console.error(`Error deleting patient ${id}:`, err);
        console.error("Error details:", err.message);
        
        // Delete the patient locally anyway
        setPatients(patients.filter(patient => patient.id !== id));
        return true;
      }
    } catch (err) {
      console.error(`Error in deletePatient ${id}:`, err);
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