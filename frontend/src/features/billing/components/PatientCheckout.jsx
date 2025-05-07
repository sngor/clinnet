// src/features/billing/components/PatientCheckout.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  InputAdornment,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import DeleteIcon from "@mui/icons-material/Delete";
import { getServices, getPaymentMethods } from "../services/billingService";

function PatientCheckout({ patient, onCheckoutComplete, initialServices = [] }) {
  // State for selected services
  const [selectedServices, setSelectedServices] = useState([]);
  const [services, setServices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // State for adding a service
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  
  // State for payment
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  
  // Calculate totals
  const subtotal = selectedServices.reduce(
    (sum, service) => sum + service.price * service.quantity,
    0
  );
  const tax = subtotal * 0.08; // Assuming 8% tax
  const total = subtotal + tax;
  const balance = total - selectedServices.reduce(
    (sum, service) => sum + (service.amountPaid || 0),
    0
  );
  
  // Initialize with any provided services
  useEffect(() => {
    if (initialServices && initialServices.length > 0) {
      const formattedServices = initialServices.map(service => ({
        ...service,
        quantity: 1,
        notes: "",
        amountPaid: 0
      }));
      setSelectedServices(formattedServices);
    }
  }, [initialServices]);
  
  // Fetch services and payment methods
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch services
        const servicesData = await getServices();
        setServices(servicesData);
        
        // Fetch payment methods
        const paymentMethodsData = await getPaymentMethods();
        setPaymentMethods(paymentMethodsData);
      } catch (err) {
        setError("Failed to load data: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle opening the add service dialog
  const handleOpenServiceDialog = () => {
    setSelectedService("");
    setQuantity(1);
    setNotes("");
    setServiceDialogOpen(true);
  };
  
  // Handle adding a service to the bill
  const handleAddService = () => {
    if (!selectedService) {
      setError("Please select a service");
      return;
    }
    
    const serviceToAdd = services.find(s => s.id === selectedService);
    if (!serviceToAdd) return;
    
    const newService = {
      ...serviceToAdd,
      quantity,
      notes,
      amountPaid: 0,
    };
    
    setSelectedServices([...selectedServices, newService]);
    setServiceDialogOpen(false);
    setError(null);
  };
  
  // Handle removing a service from the bill
  const handleRemoveService = (serviceId) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };
  
  // Handle opening the payment dialog
  const handleOpenPaymentDialog = () => {
    setPaymentMethod("");
    setAmountPaid(balance.toFixed(2));
    setPaymentReference("");
    setPaymentDialogOpen(true);
  };
  
  // Handle processing a payment
  const handleProcessPayment = () => {
    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }
    
    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }
    
    // In a real app, you would make an API call to process the payment
    // For now, we'll just update the local state
    
    // Update the amount paid for each service proportionally
    const paymentAmount = parseFloat(amountPaid);
    const paymentRatio = Math.min(paymentAmount / total, 1);
    
    const updatedServices = selectedServices.map(service => {
      const serviceTotalPrice = service.price * service.quantity;
      const servicePayment = serviceTotalPrice * paymentRatio;
      
      return {
        ...service,
        amountPaid: (service.amountPaid || 0) + servicePayment,
      };
    });
    
    setSelectedServices(updatedServices);
    setPaymentDialogOpen(false);
    
    // Show success message
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    
    // If payment is complete (paid in full), notify parent component
    if (paymentAmount >= balance) {
      if (onCheckoutComplete) {
        onCheckoutComplete({
          patientId: patient.id,
          services: updatedServices,
          subtotal,
          tax,
          total,
          amountPaid: total,
          paymentMethod,
          paymentReference,
          date: new Date().toISOString(),
        });
      }
    }
  };
  
  return (
    <Box sx={{ mt: 2 }}>
      {/* Patient Info Card */}
      <Card sx={{ mb: 3, bgcolor: "primary.light", color: "primary.contrastText" }}>
        <CardContent>
          <Typography variant="h6">
            Patient: {patient?.firstName} {patient?.lastName}
          </Typography>
          <Typography variant="body2">
            ID: {patient?.id} | DOB: {patient?.dob}
          </Typography>
          <Typography variant="body2">
            Insurance: {patient?.insuranceProvider || "None"} 
            {patient?.insuranceNumber ? ` (${patient.insuranceNumber})` : ""}
          </Typography>
        </CardContent>
      </Card>
      
      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
          Payment processed successfully!
        </Alert>
      )}
      
      {/* Loading indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Services Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Services</Typography>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleOpenServiceDialog}
          >
            Add Service
          </Button>
        </Box>
        
        {selectedServices.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>
            No services added yet. Click "Add Service" to begin.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Service</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>${service.price.toFixed(2)}</TableCell>
                    <TableCell>{service.quantity}</TableCell>
                    <TableCell>${(service.price * service.quantity).toFixed(2)}</TableCell>
                    <TableCell>{service.notes || "-"}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleRemoveService(service.id)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Billing Summary */}
      {selectedServices.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Billing Summary
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body1">Subtotal:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" align="right">
                ${subtotal.toFixed(2)}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body1">Tax (8%):</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" align="right">
                ${tax.toFixed(2)}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Total:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" align="right" sx={{ fontWeight: "bold" }}>
                ${total.toFixed(2)}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body1" color="text.secondary">
                Amount Paid:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" align="right" color="text.secondary">
                ${(total - balance).toFixed(2)}
              </Typography>
            </Grid>
            
            <Grid item xs={6}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Balance Due:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography 
                variant="body1" 
                align="right" 
                sx={{ 
                  fontWeight: "bold",
                  color: balance > 0 ? "error.main" : "success.main"
                }}
              >
                ${balance.toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PaymentIcon />}
              onClick={handleOpenPaymentDialog}
              disabled={balance <= 0}
            >
              Process Payment
            </Button>
          </Box>
        </Paper>
      )}
      
      {/* Add Service Dialog */}
      <Dialog open={serviceDialogOpen} onClose={() => setServiceDialogOpen(false)}>
        <DialogTitle>Add Service</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel id="service-select-label">Service</InputLabel>
            <Select
              labelId="service-select-label"
              id="service-select"
              value={selectedService}
              label="Service"
              onChange={(e) => setSelectedService(e.target.value)}
            >
              {services.map((service) => (
                <MenuItem key={service.id} value={service.id}>
                  {service.name} - ${service.price.toFixed(2)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            id="quantity"
            label="Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            InputProps={{ inputProps: { min: 1 } }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="notes"
            label="Notes (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setServiceDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddService} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent sx={{ minWidth: 400 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Total Due: ${balance.toFixed(2)}
          </Typography>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="payment-method-label">Payment Method</InputLabel>
            <Select
              labelId="payment-method-label"
              id="payment-method"
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method.id} value={method.id}>
                  {method.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            id="amount"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={amountPaid}
            onChange={(e) => setAmountPaid(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="reference"
            label="Reference/Transaction ID (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleProcessPayment} variant="contained" color="primary">
            Complete Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PatientCheckout;