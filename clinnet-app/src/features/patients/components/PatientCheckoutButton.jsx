// src/features/patients/components/PatientCheckoutButton.jsx
import React, { useState } from "react";
import { Button } from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckoutModal from "../../billing/components/CheckoutModal";

function PatientCheckoutButton({ patient }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleCheckoutComplete = (checkoutData) => {
    // In a real app, you would save this data to your backend
    console.log("Checkout completed:", checkoutData);
    
    // You could also show a success notification here
  };
  
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<PaymentIcon />}
        onClick={handleOpenModal}
        size="small"
      >
        Checkout
      </Button>
      
      <CheckoutModal
        open={isModalOpen}
        onClose={handleCloseModal}
        patient={patient}
        onCheckoutComplete={handleCheckoutComplete}
      />
    </>
  );
}

export default PatientCheckoutButton;