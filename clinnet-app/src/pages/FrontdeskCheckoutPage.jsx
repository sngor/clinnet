// src/pages/FrontdeskCheckoutPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate, useParams } from "react-router-dom";
import PatientCheckout from "../features/billing/components/PatientCheckout";
import PatientVisitSummary from "../features/patients/components/PatientVisitSummary";

// Mock data for appointments
const mockAppointments = [
  {
    id: 201,
    patientId: 101,
    patientName: "Alice Brown",
    time: "09:00 AM",
    doctorName: "Dr. Smith",
    status: "Ready for Checkout",
    type: "Checkup"
  },
  {
    id: 202,
    patientId: 102,
    patientName: "Bob White",
    time: "09:30 AM",
    doctorName: "Dr. Jones",
    status: "Ready for Checkout",
    type: "Follow-up"
  },
  {
    id: 203,
    patientId: 103,
    patientName: "Charlie Green",
    time: "10:00 AM",
    doctorName: "Dr. Smith",
    status: "Ready for Checkout",
    type: "Consultation"
  },
  {
    id: 204,
    patientId: 104,
    patientName: "David Black",
    time: "10:30 AM",
    doctorName: "Dr. Jones",
    status: "Ready for Checkout",
    type: "New Patient"
  },
];

// Mock patient data
const mockPatients = [
  {
    id: 101,
    firstName: "Alice",
    lastName: "Brown",
    dob: "1985-05-15",
    phone: "555-1234",
    email: "alice.b@example.com",
    address: "123 Main St, Anytown, USA",
    insuranceProvider: "Blue Cross",
    insuranceNumber: "BC12345678"
  },
  {
    id: 102,
    firstName: "Bob",
    lastName: "White",
    dob: "1992-08-22",
    phone: "555-5678",
    email: "bob.w@example.com",
    address: "456 Oak Ave, Somewhere, USA",
    insuranceProvider: "Aetna",
    insuranceNumber: "AE87654321"
  },
  {
    id: 103,
    firstName: "Charlie",
    lastName: "Green",
    dob: "1978-03-10",
    phone: "555-9012",
    email: "charlie.g@example.com",
    address: "789 Pine Rd, Elsewhere, USA",
    insuranceProvider: "United Healthcare",
    insuranceNumber: "UH56781234"
  },
  {
    id: 104,
    firstName: "David",
    lastName: "Black",
    dob: "1990-11-28",
    phone: "555-3456",
    email: "david.b@example.com",
    address: "321 Elm St, Nowhere, USA",
    insuranceProvider: "Cigna",
    insuranceNumber: "CI43218765"
  },
];

// Mock services for each appointment
const mockServices = {
  201: [
    { id: 1, name: "General Consultation", price: 150.00, category: "Consultation" },
    { id: 3, name: "Blood Test", price: 75.00, category: "Laboratory" }
  ],
  202: [
    { id: 2, name: "Follow-up Visit", price: 100.00, category: "Consultation" }
  ],
  203: [
    { id: 1, name: "General Consultation", price: 150.00, category: "Consultation" },
    { id: 4, name: "X-Ray", price: 200.00, category: "Radiology" }
  ],
  204: [
    { id: 1, name: "General Consultation", price: 150.00, category: "Consultation" },
    { id: 5, name: "Vaccination", price: 50.00, category: "Preventive Care" }
  ],
};

function FrontdeskCheckoutPage() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  
  // Steps for the checkout process
  const steps = ['Review Visit', 'Process Payment', 'Complete Checkout'];
  
  // Fetch appointment and patient data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // In a real app, these would be API calls
        // For now, we'll use mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find the appointment
        const appt = mockAppointments.find(a => a.id === parseInt(appointmentId));
        if (!appt) {
          throw new Error(`Appointment with ID ${appointmentId} not found`);
        }
        
        // Find the patient
        const pat = mockPatients.find(p => p.id === appt.patientId);
        if (!pat) {
          throw new Error(`Patient with ID ${appt.patientId} not found`);
        }
        
        // Get services for this appointment
        const svc = mockServices[appt.id] || [];
        
        setAppointment(appt);
        setPatient(pat);
        setServices(svc);
      } catch (err) {
        setError(`Failed to load checkout data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (appointmentId) {
      fetchData();
    }
  }, [appointmentId]);
  
  // Handle going back to appointments page
  const handleBackToAppointments = () => {
    navigate("/frontdesk/appointments");
  };
  
  // Handle moving to the next step
  const handleNextStep = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  // Handle moving to the previous step
  const handlePrevStep = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle checkout completion
  const handleCheckoutComplete = (checkoutData) => {
    console.log("Checkout completed:", checkoutData);
    
    // In a real app, you would update the appointment status to "Completed"
    // and save the payment information
    
    setCheckoutComplete(true);
    setActiveStep(2); // Move to the final step
  };
  
  // Render content based on current step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <PatientVisitSummary 
            appointment={appointment}
            patient={patient}
            services={services}
          />
        );
      case 1:
        return (
          <PatientCheckout 
            patient={patient}
            onCheckoutComplete={handleCheckoutComplete}
            initialServices={services}
          />
        );
      case 2:
        return (
          <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Checkout Complete
            </Typography>
            <Typography variant="body1" paragraph>
              The patient visit has been successfully completed and payment has been processed.
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleBackToAppointments}
              sx={{ mt: 2 }}
            >
              Return to Appointments
            </Button>
          </Paper>
        );
      default:
        return null;
    }
  };
  
  // Render navigation buttons based on current step
  const renderNavButtons = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={activeStep === 0 ? handleBackToAppointments : handlePrevStep}
        >
          {activeStep === 0 ? 'Back to Appointments' : 'Previous'}
        </Button>
        
        {activeStep < 1 && (
          <Button
            variant="contained"
            onClick={handleNextStep}
          >
            Next: Process Payment
          </Button>
        )}
      </Box>
    );
  };
  
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Patient Checkout
      </Typography>
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Checkout stepper */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {/* Main content */}
          {renderStepContent()}
          
          {/* Navigation buttons */}
          {!checkoutComplete && renderNavButtons()}
        </>
      )}
    </Box>
  );
}

export default FrontdeskCheckoutPage;