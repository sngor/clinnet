// src/pages/FrontdeskCheckoutPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
  Button,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import serviceApi from "../../services/serviceApi";
import patientService from "../../services/patientService"; // Added patientService import
import { apiPost } from "../../utils/api-helper"; // Import for API calls
import PercentIcon from "@mui/icons-material/Percent";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import PrintIcon from "@mui/icons-material/Print";
import PageContainer from "../components/ui/PageContainer";
import PageHeading from "../components/ui/PageHeading";
import ContentCard from "../components/ui/ContentCard";
import EmptyState from "../components/ui/EmptyState";
import LoadingIndicator from "../components/ui/LoadingIndicator";

function FrontdeskCheckoutPage() {
  // State hooks for UI and data
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [total, setTotal] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("percentage");
  const [notes, setNotes] = useState("");
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [finalAmount, setFinalAmount] = useState(0);

  // Fetch initial data for patients and services
  useEffect(() => {
    setLoading(true); // Ensure loading is true at the start

    Promise.all([
      patientService.getPatients(),
      serviceApi.getAllServices()
    ])
    .then(([patientsResponse, servicesResponse]) => {
      const transformedPatients = patientsResponse.data.map(patient => ({
        ...patient,
        name: `${patient.firstName} ${patient.lastName}`
      }));
      setPatients(transformedPatients);
      setServices(servicesResponse.data); // Assuming API returns { data: [...] }
    })
    .catch(error => {
      console.error("Error fetching initial data:", error);
      // Optionally, set an error state here to display a more user-friendly message
      // For example, set an error message in state and display it in the UI
    })
    .finally(() => {
      setLoading(false); // Set loading to false after all API calls complete
    });

    // No cleanup needed for Promise.all like this,
    // but if individual calls had cancellation tokens, they'd be handled here.
  }, []);

  // Calculate total when selected services change
  useEffect(() => {
    setTotal(selectedServices.reduce((sum, s) => sum + s.price, 0));
  }, [selectedServices]);

  // Calculate final amount after discount
  useEffect(() => {
    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = total * (discount / 100);
    } else {
      discountAmount = discount;
    }
    setFinalAmount(Math.max(0, total - Math.min(discountAmount, total)));
  }, [total, discount, discountType]);

  // Filtered patients (memoized for efficiency)
  const filteredPatients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term)
    );
  }, [patients, searchTerm]);

  // Handle patient selection
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setSelectedServices([]);
  };

  // Handle service selection
  const handleServiceSelect = (service) => {
    setSelectedServices([...selectedServices, service]);
  };

  // Handle service removal
  const handleServiceRemove = (serviceId) => {
    setSelectedServices(
      selectedServices.filter((service) => service.id !== serviceId)
    );
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!selectedPatient) {
      alert("Please select a patient.");
      return;
    }
    if (selectedServices.length === 0) {
      alert("Please select at least one service.");
      return;
    }
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    const discountAmount = total - finalAmount;

    const payload = {
      patientId: selectedPatient.id,
      items: selectedServices.map(service => ({
        serviceId: service.id,
        quantity: 1, // Assuming quantity is always 1 for now
      })),
      paymentMethod: paymentMethod,
      discount: discountAmount, // Send the calculated discount amount
      notes: notes,
      subtotal: total,
      total: finalAmount,
    };

    // console.log("Checkout payload:", payload); // For debugging

    apiPost('/billing', payload)
      .then(response => {
        console.log("Checkout successful:", response);
        // Optionally, pass data from response to receipt dialog if needed
        // For example, if the backend returns a transaction ID:
        // setTransactionId(response.data.transactionId);
        setReceiptDialogOpen(true); // Open receipt dialog on success
      })
      .catch(error => {
        console.error("Checkout error:", error);
        alert(`Checkout failed: ${error.message || "Please try again."}`);
        // Do not open receipt dialog on error
      });
  };

  // Handle payment completion
  const handlePaymentComplete = () => {
    // In a real app, this would finalize the transaction in the database
    setReceiptDialogOpen(false);

    // Reset the form
    setSelectedPatient(null);
    setSelectedServices([]);
    setPaymentMethod("");
    setDiscount(0);
    setNotes("");
  };

  return (
    <PageContainer>
      <PageHeading
        title="Patient Checkout"
        subtitle="Process payments for patient services"
      />

      <Grid container spacing={3}>
        {/* Patient Selection */}
        <Grid item xs={12} md={6}>
          <ContentCard title="Select Patient">
            {loading ? (
              <LoadingIndicator message="Loading patients..." />
            ) : (
              <>
                <TextField
                  placeholder="Search patients..."
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />

                {filteredPatients.length > 0 ? (
                  <List sx={{ maxHeight: 300, overflow: "auto" }}>
                    {filteredPatients.map((patient) => (
                      <Paper
                        key={patient.id}
                        elevation={selectedPatient?.id === patient.id ? 3 : 1}
                        sx={{
                          mb: 1,
                          borderLeft:
                            selectedPatient?.id === patient.id ? 4 : 0,
                          borderColor: "primary.main",
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        <ListItem
                          button
                          onClick={() => handlePatientSelect(patient)}
                          selected={selectedPatient?.id === patient.id}
                        >
                          <ListItemText
                            primary={patient.name}
                            secondary={`Patient ID: ${patient.id}`}
                          />
                          <ListItemSecondaryAction>
                            <Chip
                              label={patient.status}
                              size="small"
                              color={
                                patient.status === "waiting"
                                  ? "info"
                                  : patient.status === "in-progress"
                                  ? "warning"
                                  : "success"
                              }
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      </Paper>
                    ))}
                  </List>
                ) : (
                  <EmptyState
                    icon={<SearchIcon />}
                    title="No Patients Found"
                    description="No patients match your search criteria."
                  />
                )}
              </>
            )}
          </ContentCard>
        </Grid>

        {/* Service Selection and Checkout */}
        <Grid item xs={12} md={6}>
          <ContentCard
            title={
              selectedPatient ? `Checkout: ${selectedPatient.name}` : "Checkout"
            }
            subtitle={
              selectedPatient
                ? `Patient ID: ${selectedPatient.id}`
                : "Select a patient to continue"
            }
          >
            {selectedPatient ? (
              <>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Select Services
                </Typography>

                <Grid container spacing={1} sx={{ mb: 3 }}>
                  {services.map((service) => (
                    <Grid item xs={12} sm={6} key={service.id}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => handleServiceSelect(service)}
                        sx={{
                          justifyContent: "flex-start",
                          textTransform: "none",
                        }}
                      >
                        <Box sx={{ textAlign: "left" }}>
                          <Typography variant="body2">
                            {service.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ${service.price.toFixed(2)}
                          </Typography>
                        </Box>
                      </Button>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Selected Services
                </Typography>

                {selectedServices.length > 0 ? (
                  <List sx={{ mb: 2 }}>
                    {selectedServices.map((service) => (
                      <ListItem key={`selected-${service.id}`} disablePadding>
                        <ListItemText
                          primary={service.name}
                          secondary={`$${service.price.toFixed(2)}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleServiceRemove(service.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    No services selected
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Discount Section */}
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Apply Discount
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="discount-type-label">Type</InputLabel>
                      <Select
                        labelId="discount-type-label"
                        value={discountType}
                        label="Type"
                        onChange={(e) => setDiscountType(e.target.value)}
                      >
                        <MenuItem value="percentage">Percentage (%)</MenuItem>
                        <MenuItem value="fixed">Fixed Amount ($)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label={
                        discountType === "percentage"
                          ? "Discount %"
                          : "Discount $"
                      }
                      type="number"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {discountType === "percentage" ? (
                              <PercentIcon />
                            ) : (
                              "$"
                            )}
                          </InputAdornment>
                        ),
                      }}
                      fullWidth
                      size="small"
                      value={discount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        if (isNaN(value)) {
                          setDiscount(0);
                        } else if (
                          discountType === "percentage" &&
                          value > 100
                        ) {
                          setDiscount(100);
                        } else if (value < 0) {
                          setDiscount(0);
                        } else {
                          setDiscount(value);
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                {/* Notes Button */}
                <Button
                  variant="outlined"
                  startIcon={<NoteAddIcon />}
                  fullWidth
                  sx={{ mb: 3 }}
                  onClick={() => setNoteDialogOpen(true)}
                >
                  {notes ? "Edit Notes" : "Add Notes"}
                </Button>

                {/* Payment Method Selection */}
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Payment Method
                </Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Button
                      variant={
                        paymentMethod === "cash" ? "contained" : "outlined"
                      }
                      fullWidth
                      startIcon={<LocalAtmIcon />}
                      onClick={() => setPaymentMethod("cash")}
                    >
                      Cash
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <Button
                      variant={
                        paymentMethod === "card" ? "contained" : "outlined"
                      }
                      fullWidth
                      startIcon={<CreditCardIcon />}
                      onClick={() => setPaymentMethod("card")}
                    >
                      Card
                    </Button>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Totals */}
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body1">Subtotal</Typography>
                    <Typography variant="body1">${total.toFixed(2)}</Typography>
                  </Box>

                  {discount > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1">
                        Discount{" "}
                        {discountType === "percentage" ? `(${discount}%)` : ""}
                      </Typography>
                      <Typography variant="body1" color="error">
                        -${(total - finalAmount).toFixed(2)}
                      </Typography>
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6" color="primary">
                      ${finalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  startIcon={<PaymentIcon />}
                  onClick={handleCheckout}
                  disabled={selectedServices.length === 0}
                >
                  Process Payment
                </Button>
              </>
            ) : (
              <EmptyState
                icon={<ReceiptIcon />}
                title="No Patient Selected"
                description="Please select a patient from the list to proceed with checkout."
              />
            )}
          </ContentCard>
        </Grid>
      </Grid>

      {/* Notes Dialog */}
      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Notes</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notes"
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any special instructions or notes about this transaction"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => setNoteDialogOpen(false)} variant="contained">
            Save Notes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog
        open={receiptDialogOpen}
        onClose={() => setReceiptDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Payment Receipt</DialogTitle>
        <DialogContent>
          {selectedPatient && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom align="center">
                Clinnet EMR
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Patient:
                  </Typography>
                  <Typography variant="body1">
                    {selectedPatient.name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Patient ID:
                  </Typography>
                  <Typography variant="body1">{selectedPatient.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date:
                  </Typography>
                  <Typography variant="body1">
                    {new Date().toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Receipt #:
                  </Typography>
                  <Typography variant="body1">
                    {Math.floor(Math.random() * 10000)
                      .toString()
                      .padStart(4, "0")}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Services
              </Typography>

              {selectedServices.map((service) => (
                <Box
                  key={service.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2">{service.name}</Typography>
                  <Typography variant="body2">
                    ${service.price.toFixed(2)}
                  </Typography>
                </Box>
              ))}

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{ mb: 1, display: "flex", justifyContent: "space-between" }}
              >
                <Typography variant="body2">Subtotal</Typography>
                <Typography variant="body2">${total.toFixed(2)}</Typography>
              </Box>

              {discount > 0 && (
                <Box
                  sx={{
                    mb: 1,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2">
                    Discount{" "}
                    {discountType === "percentage" ? `(${discount}%)` : ""}
                  </Typography>
                  <Typography variant="body2" color="error">
                    -${(total - finalAmount).toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Box
                sx={{ mb: 2, display: "flex", justifyContent: "space-between" }}
              >
                <Typography variant="subtitle2">Total</Typography>
                <Typography variant="subtitle2">
                  ${finalAmount.toFixed(2)}
                </Typography>
              </Box>

              <Box
                sx={{ mb: 1, display: "flex", justifyContent: "space-between" }}
              >
                <Typography variant="body2">Payment Method</Typography>
                <Typography variant="body2">
                  {paymentMethod === "cash" ? "Cash" : "Credit/Debit Card"}
                </Typography>
              </Box>

              {notes && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Notes
                  </Typography>
                  <Typography variant="body2">{notes}</Typography>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" align="center" gutterBottom>
                Thank you for your visit!
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<PrintIcon />}
            onClick={() =>
              alert("Printing functionality would be implemented here")
            }
          >
            Print
          </Button>
          <Button variant="contained" onClick={handlePaymentComplete}>
            Complete
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

export default FrontdeskCheckoutPage;
