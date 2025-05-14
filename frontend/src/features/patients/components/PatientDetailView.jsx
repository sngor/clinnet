// src/features/patients/components/PatientDetailView.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import CloseIcon from "@mui/icons-material/Close";
import PatientCheckout from "../../billing/components/PatientCheckout";
import BillingHistory from "../../billing/components/BillingHistory";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function PatientDetailView({ patient, onClose }) {
  // Safety check for null/undefined patient
  if (!patient) {
    return (
      <Paper sx={{ p: 3, my: 2, borderRadius: 2 }}>
        <Typography variant="h6" align="center">
          Patient information not available
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Paper>
    );
  }

  const [tabValue, setTabValue] = useState(0);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenCheckout = () => {
    setCheckoutDialogOpen(true);
  };

  const handleCloseCheckout = () => {
    setCheckoutDialogOpen(false);
  };

  const handleCheckoutComplete = (checkoutData) => {
    console.log("Checkout completed:", checkoutData);
    setCheckoutDialogOpen(false);
    // You could refresh the billing history here
  };

  return (
    <Box>
      {/* Header with patient info and actions */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Typography variant="h5">
              {patient.firstName || "N/A"} {patient.lastName || ""}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {patient.id || "N/A"} | DOB:{" "}
              {patient.dob || patient.dateOfBirth || "N/A"} | Status:{" "}
              {patient.status || "Active"}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={4}
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", sm: "flex-end" },
            }}
          >
            <Button
              variant="contained"
              startIcon={<PaymentIcon />}
              onClick={handleOpenCheckout}
              sx={{ mr: 1 }}
            >
              Checkout
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={onClose}
            >
              Close
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for different sections */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab icon={<PersonIcon />} label="Information" />
          <Tab icon={<EventNoteIcon />} label="Appointments" />
          <Tab icon={<ReceiptIcon />} label="Billing" />
        </Tabs>

        {/* Patient Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Personal Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Full Name
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {patient.firstName || "N/A"} {patient.lastName || ""}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Date of Birth
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {patient.dob || patient.dateOfBirth || "N/A"}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {patient.phone || "N/A"}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Email
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {patient.email || "N/A"}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {patient.address || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Insurance Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Provider
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {patient.insuranceProvider || "None"}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Policy Number
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {patient.insuranceNumber || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Visit Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Last Visit
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {patient.lastVisit || "No previous visits"}
                      </Typography>
                    </Grid>

                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">
                        Next Appointment
                      </Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body2">
                        {patient.upcomingAppointment ||
                          "No upcoming appointments"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Appointments Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="body1">
            Appointment history and scheduling would go here.
          </Typography>
          {/* This would be replaced with an actual appointments component */}
        </TabPanel>

        {/* Billing Tab */}
        <TabPanel value={tabValue} index={2}>
          <BillingHistory patient={patient} />
        </TabPanel>
      </Paper>

      {/* Checkout Dialog */}
      <Dialog
        open={checkoutDialogOpen}
        onClose={handleCloseCheckout}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Patient Checkout</DialogTitle>
        <DialogContent dividers>
          <PatientCheckout
            patient={patient}
            onCheckoutComplete={handleCheckoutComplete}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCheckout}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PatientDetailView;
