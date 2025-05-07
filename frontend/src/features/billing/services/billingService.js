// src/features/billing/services/billingService.js

// Function to get all services
export const getServices = async () => {
  // In a real app, this would be an API call
  // For now, we'll return mock data
  return [
    { id: 1, name: "General Consultation", price: 150.00, category: "Consultation" },
    { id: 2, name: "Follow-up Visit", price: 100.00, category: "Consultation" },
    { id: 3, name: "Blood Test", price: 75.00, category: "Laboratory" },
    { id: 4, name: "X-Ray", price: 200.00, category: "Radiology" },
    { id: 5, name: "Vaccination", price: 50.00, category: "Preventive Care" },
    { id: 6, name: "Physical Therapy Session", price: 120.00, category: "Therapy" },
  ];
};

// Function to process a payment
export const processPayment = async (paymentData) => {
  // In a real app, this would be an API call to process the payment
  // For now, we'll just simulate a successful payment
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a mock response
  return {
    success: true,
    transactionId: `TXN-${Date.now()}`,
    amount: paymentData.amount,
    date: new Date().toISOString(),
    paymentMethod: paymentData.paymentMethod,
  };
};

// Function to save a billing record
export const saveBillingRecord = async (billingData) => {
  // In a real app, this would be an API call to save the billing record
  // For now, we'll just simulate a successful save
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Return a mock response
  return {
    success: true,
    billingId: `BILL-${Date.now()}`,
    ...billingData,
  };
};

// Function to get billing history for a patient
export const getPatientBillingHistory = async (patientId) => {
  // In a real app, this would be an API call
  // For now, we'll return mock data
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Return mock billing history
  return [
    {
      id: "BILL-1234567890",
      patientId,
      date: "2023-11-15T10:30:00Z",
      services: [
        { id: 1, name: "General Consultation", price: 150.00, quantity: 1 },
        { id: 3, name: "Blood Test", price: 75.00, quantity: 1 }
      ],
      subtotal: 225.00,
      tax: 18.00,
      total: 243.00,
      amountPaid: 243.00,
      paymentMethod: 1,
      paymentReference: "CC-4567",
      status: "Paid"
    },
    {
      id: "BILL-0987654321",
      patientId,
      date: "2023-10-05T14:15:00Z",
      services: [
        { id: 2, name: "Follow-up Visit", price: 100.00, quantity: 1 }
      ],
      subtotal: 100.00,
      tax: 8.00,
      total: 108.00,
      amountPaid: 108.00,
      paymentMethod: 4,
      paymentReference: "INS-7890",
      status: "Paid"
    }
  ];
};

// Function to get payment methods
export const getPaymentMethods = async () => {
  // In a real app, this would be an API call
  // For now, we'll return mock data
  return [
    { id: 1, name: "Cash" },
    { id: 2, name: "Credit Card" },
    { id: 3, name: "Debit Card" },
    { id: 4, name: "Insurance" },
    { id: 5, name: "Bank Transfer" },
  ];
};