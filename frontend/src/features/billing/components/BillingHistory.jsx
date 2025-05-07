// src/features/billing/components/BillingHistory.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { getPatientBillingHistory } from "../services/billingService";

function BillingHistory({ patient }) {
  const [billingRecords, setBillingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  
  // Fetch billing history for the patient
  useEffect(() => {
    const fetchBillingHistory = async () => {
      if (!patient?.id) return;
      
      try {
        setLoading(true);
        const data = await getPatientBillingHistory(patient.id);
        setBillingRecords(data);
      } catch (err) {
        setError("Failed to load billing history: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBillingHistory();
  }, [patient]);
  
  // Handle viewing a receipt
  const handleViewReceipt = (bill) => {
    setSelectedBill(bill);
    setReceiptDialogOpen(true);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Billing History
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : billingRecords.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
          No billing records found for this patient.
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Services</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {billingRecords.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell>{formatDate(bill.date)}</TableCell>
                  <TableCell>
                    {bill.services.map(service => service.name).join(", ")}
                  </TableCell>
                  <TableCell align="right">${bill.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={bill.status} 
                      color={bill.status === "Paid" ? "success" : "warning"} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      startIcon={<ReceiptIcon />}
                      size="small"
                      onClick={() => handleViewReceipt(bill)}
                    >
                      Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Receipt Dialog */}
      <Dialog 
        open={receiptDialogOpen} 
        onClose={() => setReceiptDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Receipt</DialogTitle>
        <DialogContent>
          {selectedBill && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
                Clinnet Medical Center
              </Typography>
              
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="body2">
                  Receipt #: {selectedBill.id}
                </Typography>
                <Typography variant="body2">
                  Date: {formatDate(selectedBill.date)}
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                Patient: {patient?.firstName} {patient?.lastName}
              </Typography>
              
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Service</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedBill.services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{service.name}</TableCell>
                        <TableCell align="right">${service.price.toFixed(2)}</TableCell>
                        <TableCell align="right">{service.quantity}</TableCell>
                        <TableCell align="right">
                          ${(service.price * service.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", mb: 2 }}>
                <Typography variant="body2">
                  Subtotal: ${selectedBill.subtotal.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  Tax: ${selectedBill.tax.toFixed(2)}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  Total: ${selectedBill.total.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Amount Paid: ${selectedBill.amountPaid.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  Payment Method: {
                    selectedBill.paymentMethod === 1 ? "Cash" :
                    selectedBill.paymentMethod === 2 ? "Credit Card" :
                    selectedBill.paymentMethod === 3 ? "Debit Card" :
                    selectedBill.paymentMethod === 4 ? "Insurance" :
                    selectedBill.paymentMethod === 5 ? "Bank Transfer" : "Other"
                  }
                </Typography>
                {selectedBill.paymentReference && (
                  <Typography variant="body2">
                    Reference: {selectedBill.paymentReference}
                  </Typography>
                )}
              </Box>
              
              <Typography variant="body2" sx={{ textAlign: "center", mt: 3 }}>
                Thank you for choosing Clinnet Medical Center!
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReceiptDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<ReceiptIcon />}
            onClick={() => {
              // In a real app, this would print or download the receipt
              console.log("Print receipt:", selectedBill);
              alert("Printing receipt...");
            }}
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BillingHistory;