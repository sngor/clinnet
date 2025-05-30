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
        const patientResult = await patientService.fetchPatients();
        if (patientResult.error) {
          console.warn("API error fetching patients:", patientResult.error);
          if (process.env.NODE_ENV === 'production') {
            const errorMsg = patientResult.error.message || 'Failed to load patient data. Please try again later.';
            console.error("Production: Failed to load patients, setting error state:", errorMsg);
            setError(errorMsg);
            setPatients([]); // Set to empty array in production on error
          } else {
            // Development fallback
            console.log("[DataProvider] Development mode: Falling back to mock data for patients.");
            const { mockPatients } = await import("../../mock/mockPatients");
            setPatients(mockPatients || []);
          }
        } else {
          console.log("[DataProvider] setPatients (API):", patientResult.data);
          setPatients(patientResult.data || []);
        }

        // Fetch appointments from API (do not affect patients state)
        try {
          const appointmentsData = await appointmentApi.getAllAppointments();
          setAppointments(appointmentsData || []);
        } catch (err) {
          console.error("Error fetching appointments:", err);
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
    setLoading(true);
    setError(null);
    const result = await patientService.createPatient(patientData);
    setLoading(false);

    if (result.error) {
      const errorMsg = result.error.message || "Failed to add patient";
      console.error("Error adding patient in DataProvider:", errorMsg, result.error);
      setError(errorMsg);
      throw result.error; // Re-throw for the component to catch
    }

    setPatients(prevPatients => [...prevPatients, result.data]);
    return result.data; // Return data directly on success
  };

  const updatePatient = async (id, patientData) => {
    setLoading(true);
    setError(null);
    const result = await patientService.updatePatient(id, patientData);
    setLoading(false);

    if (result.error) {
      const errorMsg = result.error.message || `Failed to update patient ${id}`;
      console.error("Error updating patient in DataProvider:", errorMsg, result.error);
      setError(errorMsg);
      throw result.error;
    }

    setPatients(prevPatients =>
      prevPatients.map((patient) =>
        patient.id === id ? result.data : patient
      )
    );
    return result.data;
  };

  const deletePatient = async (id) => {
    setLoading(true);
    setError(null);
    const result = await patientService.deletePatient(id);
    setLoading(false);

    if (result.error) {
      const errorMsg = result.error.message || `Failed to delete patient ${id}`;
      console.error("Error deleting patient in DataProvider:", errorMsg, result.error);
      setError(errorMsg);
      throw result.error;
    }

    setPatients(prevPatients => prevPatients.filter((patient) => patient.id !== id));
    // result.data might contain a success message, e.g., { message: "Patient deleted" }
    return result.data || true; // Return data or true for generic success
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
      setLoading(true);
      setError(null);
      const result = await patientService.fetchPatients();
      setLoading(false);

      if (result.error) {
        const errorMsg = result.error.message || "Failed to refresh patients";
        console.error("Error refreshing patients in DataProvider:", errorMsg, result.error);
        setError(errorMsg);
        // Optionally re-throw or return an error indicator if components need to react
        // For now, just setting context error and returning null or empty array for data part
        return { data: null, error: result.error }; // Or just return null/undefined
      }

      if (result.data) {
        console.log("Patients refreshed from API:", result.data);
        setPatients(result.data);
      }
      return { data: result.data, error: null }; // Consistent return
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
