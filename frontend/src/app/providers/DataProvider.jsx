// src/app/providers/DataProvider.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import patientService from "../../services/patients";
import serviceApi from "../../services/serviceApi";
import appointmentApi from "../../features/appointments/api/appointmentApi";

// Create context
const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for services, patients, and appointments
  const [services, setServices] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Initialize data when authenticated
  useEffect(() => {
    const initializeData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        console.log("Initializing app data...");

        // Fetch real services data from the API
        const servicesData = await serviceApi.getAllServices();
        if (servicesData && servicesData.length > 0) {
          setServices(servicesData);
        } else {
          setServices([]);
        }

        // Fetch real patients data from the API
        const patientsData = await patientService.fetchPatients();
        if (patientsData && patientsData.length > 0) {
          console.log("Patients loaded from API:", patientsData);
          setPatients(patientsData);
        } else {
          console.warn("No patients returned from API, using mock data");
          // Import mock data if API returns empty result
          const { mockPatients } = await import("../../mock/mockPatients");
          setPatients(mockPatients);
        }

        // Fetch appointments from API
        const appointmentsData = await appointmentApi.getAllAppointments();
        setAppointments(appointmentsData || []);

        setInitialized(true);
        console.log("Data initialization complete");
      } catch (err) {
        console.error("Error initializing data:", err);
        setError(err.message || "Failed to initialize application data");

        // Fallback to mock data on error
        try {
          console.warn("Falling back to mock data due to API error");
          const { mockPatients } = await import("../../mock/mockPatients");
          setPatients(mockPatients);
        } catch (mockErr) {
          console.error("Error loading mock data:", mockErr);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [isAuthenticated]);

  // Service CRUD operations using real API
  const addService = async (serviceData) => {
    const newService = await serviceApi.createService(serviceData);
    setServices((prev) => [...prev, newService]);
    return newService;
  };

  const updateService = async (id, serviceData) => {
    const updatedService = await serviceApi.updateService(id, serviceData);
    setServices((prev) =>
      prev.map((service) => (service.id === id ? updatedService : service))
    );
    return updatedService;
  };

  const deleteService = async (id) => {
    await serviceApi.deleteService(id);
    setServices((prev) => prev.filter((service) => service.id !== id));
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

  // Appointment CRUD operations
  const addAppointment = async (appointmentData) => {
    const newAppointment = await appointmentApi.createAppointment(
      appointmentData
    );
    setAppointments((prev) => [...prev, newAppointment]);
    return newAppointment;
  };

  const updateAppointment = async (id, appointmentData) => {
    const updatedAppointment = await appointmentApi.updateAppointment(
      id,
      appointmentData
    );
    setAppointments((prev) =>
      prev.map((appt) => (appt.id === id ? updatedAppointment : appt))
    );
    return updatedAppointment;
  };

  const deleteAppointment = async (id) => {
    await appointmentApi.deleteAppointment(id);
    setAppointments((prev) => prev.filter((appt) => appt.id !== id));
    return true;
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
    // Appointments
    appointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    // Refresh function
    refreshPatients: async () => {
      try {
        setLoading(true);
        const patientsData = await patientService.fetchPatients();
        if (patientsData && patientsData.length > 0) {
          console.log("Patients refreshed from API:", patientsData);
          setPatients(patientsData);
        }
        return patientsData;
      } catch (err) {
        console.error("Error refreshing patients:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
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
