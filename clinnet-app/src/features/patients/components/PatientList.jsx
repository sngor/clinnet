// src/features/patients/components/PatientList.jsx
import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import NoteAddIcon from "@mui/icons-material/NoteAdd"; // Import the icon for adding notes
// We'll create these next
// import PatientFormModal from "./PatientFormModal";
// import ConfirmDeleteDialog from "../../users/components/ConfirmDeleteDialog"; // Can reuse or create specific one

// Placeholder data - replace with API data
const mockPatients = [
  {
    id: 101,
    firstName: "John",
    lastName: "Doe",
    dob: "1985-05-15",
    phone: "555-1234",
  },
  {
    id: 102,
    firstName: "Jane",
    lastName: "Smith",
    dob: "1992-08-22",
    phone: "555-5678",
  },
];

function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State for modals ---
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  // --- Fetch initial patients (Placeholder) ---
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        setPatients(mockPatients); // Use mock data for now
        // Replace with:
        // fetch("/api/patients") // Your GET endpoint for patients
        //   .then((res) => res.ok ? res.json() : Promise.reject(new Error('Failed to fetch patients')))
        //   .then(setPatients)
        //   .catch((err) => setError(`Failed to load patients: ${err.message}`))
        setLoading(false);
      } catch (err) {
        setError(`Failed to load patients: ${err.message}`);
        setLoading(false);
      }
    }, 500); // Simulate network delay
  }, []);

  // --- Modal/Dialog Handlers ---
  const handleAddPatient = () => {
    console.log("Add New Patient clicked");
    setEditingPatient(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditPatient = (patient) => {
    console.log("Edit Patient clicked:", patient);
    setEditingPatient(patient);
    setIsAddEditModalOpen(true);
  };

  const handleDeletePatient = (patient) => {
    console.log("Delete Patient clicked:", patient);
    setPatientToDelete(patient);
    setIsDeleteDialogOpen(true);
  };

  const handleAddNote = (patient) => {
    console.log("Add Note clicked for patient:", patient);
    // Later: Open a modal or navigate to a note-taking page for this patient
  };

  const handleCloseAddEditModal = () => setIsAddEditModalOpen(false);
  const handleCloseDeleteDialog = () => setIsDeleteDialogOpen(false);

  // --- Form Submission / Confirmation Handlers (Placeholders) ---
  const handleSubmitPatientForm = (formData) => {
    console.log("Patient Form submitted:", formData);
    setError(null);
    // Replace with API call (POST for add, PUT/PATCH for edit)
    if (editingPatient) {
      setPatients(
        patients.map((p) => (p.id === formData.id ? { ...p, ...formData } : p))
      );
    } else {
      const newPatient = { ...formData, id: Date.now() }; // Mock ID
      setPatients([...patients, newPatient]);
    }
    handleCloseAddEditModal();
  };

  const handleConfirmDelete = () => {
    console.log("Confirm delete for patient:", patientToDelete);
    setError(null);
    // Replace with API call (DELETE /api/patients/:id)
    setPatients(patients.filter((p) => p.id !== patientToDelete.id));
    handleCloseDeleteDialog();
  };

  // --- Define Columns ---
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "firstName", headerName: "First Name", width: 150 },
    { field: "lastName", headerName: "Last Name", width: 150 },
    { field: "dob", headerName: "Date of Birth", width: 130 },
    { field: "phone", headerName: "Phone", width: 130 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <>
          <IconButton
            onClick={() => handleEditPatient(params.row)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDeletePatient(params.row)}
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ height: 500, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Patient Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddPatient}
        >
          Add Patient
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DataGrid
        rows={patients}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        checkboxSelection={false}
        disableSelectionOnClick
      />

      {/* Add Modals Here Later */}
      {/* <PatientFormModal open={isAddEditModalOpen} onClose={handleCloseAddEditModal} onSubmit={handleSubmitPatientForm} initialData={editingPatient} /> */}
      {/* <ConfirmDeleteDialog open={isDeleteDialogOpen} onClose={handleCloseDeleteDialog} onConfirm={handleConfirmDelete} userName={patientToDelete ? `${patientToDelete.firstName} ${patientToDelete.lastName}` : ''} /> */}
    </Box>
  );
}

export default PatientList;
