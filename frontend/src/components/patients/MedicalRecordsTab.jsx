// src/components/patients/MedicalRecordsTab.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../../app/providers/AuthProvider";
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Snackbar, // Added for error notifications
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation"; // For EmptyState
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save"; // For Quick Save Note

import medicalRecordService from "../../services/medicalRecordService";
import EmptyState from "../ui/EmptyState"; // Assuming EmptyState component exists
import LoadingIndicator from "../ui/LoadingIndicator"; // Assuming LoadingIndicator component exists

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]); // Get only base64 part
    reader.onerror = (error) => reject(error);
  });
};

// Placeholder for Doctor ID - In a real app, this might come from auth context or be selectable
// const PLACEHOLDER_DOCTOR_ID = "doc-from-patient-tab-placeholder"; // No longer needed

function MedicalRecordsTab({ patientId }) {
  const { user } = useAuth();
  const isDoctor = user?.role === "doctor";

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Form states
  const [currentReportContent, setCurrentReportContent] = useState("");
  const [currentDoctorNotes, setCurrentDoctorNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // State for inline note editing
  const [editingNoteRecordId, setEditingNoteRecordId] = useState(null);
  const [currentEditingNote, setCurrentEditingNote] = useState("");

  // Snackbar state for notifications
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const fileInputRef = useRef(null);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarState((prev) => ({ ...prev, open: false }));
  };

  const handleCancelQuickNote = () => {
    setEditingNoteRecordId(null);
    setCurrentEditingNote("");
  };

  const handleSaveQuickNote = async (reportIdToSave, noteContent) => {
    setIsSubmitting(true); // Using existing isSubmitting state
    setModalError(null); // Clear previous errors
    try {
      await medicalRecordService.updateMedicalRecord(reportIdToSave, {
        doctorNotes: noteContent,
      });
      await fetchRecords(); // Refresh data
      setEditingNoteRecordId(null);
      setCurrentEditingNote("");
      // TODO: Consider adding a success snackbar here
      // Example: setSnackbarState({ open: true, message: "Note saved successfully!", severity: 'success' });
    } catch (err) {
      console.error(
        `Failed to quick save note for record ${reportIdToSave}:`,
        err
      );
      setSnackbarState({
        open: true,
        message: err.message || "Failed to save note. Please try again.",
        severity: "error",
      });
      // Potentially leave the editing state active so user can retry or copy text (current behavior)
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchRecords = useCallback(async () => {
    if (!patientId) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const fetchedRecords = await medicalRecordService.getMedicalRecords(
        "patient",
        patientId
      );
      setRecords(Array.isArray(fetchedRecords) ? fetchedRecords : []);
    } catch (err) {
      console.error(
        `Failed to fetch medical records for patient ${patientId}:`,
        err
      );
      setError(
        err.message || "An unexpected error occurred while fetching records."
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const resetFormStates = () => {
    setCurrentReportContent("");
    setCurrentDoctorNotes("");
    setSelectedFiles([]);
    setImagePreviews([]);
    setModalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenCreateModal = () => {
    resetFormStates();
    setOpenCreateModal(true);
  };
  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
    resetFormStates();
  };

  const handleOpenEditModal = (record) => {
    resetFormStates();
    setSelectedRecord(record);
    setCurrentReportContent(record.reportContent || "");
    setCurrentDoctorNotes(record.doctorNotes || "");
    setOpenEditModal(true);
  };
  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedRecord(null);
    resetFormStates();
  };

  const handleOpenDeleteConfirmDialog = (record) => {
    setRecordToDelete(record);
    setOpenDeleteConfirmDialog(true);
  };
  const handleCloseDeleteConfirmDialog = () => {
    setRecordToDelete(null);
    setOpenDeleteConfirmDialog(false);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeSelectedFile = (indexToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, index) => index !== indexToRemove)
    );
    if (fileInputRef.current && selectedFiles.length === 1) {
      fileInputRef.current.value = "";
    }
  };

  const handleCreateRecord = async () => {
    setIsSubmitting(true);
    setModalError(null);
    try {
      const newRecordData = {
        patientId: patientId, // From props
        doctorId: user?.id,
        reportContent: currentReportContent,
        doctorNotes: currentDoctorNotes,
      };
      const createdRecord = await medicalRecordService.createMedicalRecord(
        newRecordData
      );

      if (createdRecord && createdRecord.reportId && selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            const base64String = await fileToBase64(file);
            await medicalRecordService.uploadImageToRecord(
              createdRecord.reportId,
              {
                imageName: file.name,
                imageData: base64String,
                contentType: file.type,
              }
            );
          } catch (uploadError) {
            console.error(`Failed to upload image ${file.name}:`, uploadError);
            setModalError(
              `Record created, but failed to upload image ${file.name}. Some images may not have been saved.`
            );
          }
        }
      }
      await fetchRecords();
      handleCloseCreateModal();
    } catch (err) {
      console.error("Failed to create medical record:", err);
      setModalError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRecord = async () => {
    if (!selectedRecord) return;
    setIsSubmitting(true);
    setModalError(null);
    try {
      const updatedRecordData = {
        reportContent: currentReportContent,
        doctorNotes: currentDoctorNotes,
      };
      await medicalRecordService.updateMedicalRecord(
        selectedRecord.reportId,
        updatedRecordData
      );

      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          try {
            const base64String = await fileToBase64(file);
            await medicalRecordService.uploadImageToRecord(
              selectedRecord.reportId,
              {
                imageName: file.name,
                imageData: base64String,
                contentType: file.type,
              }
            );
          } catch (uploadError) {
            console.error(
              `Failed to upload new image ${file.name} during update:`,
              uploadError
            );
            setModalError(
              `Record updated, but failed to upload new image ${file.name}.`
            );
          }
        }
      }
      await fetchRecords();
      handleCloseEditModal();
    } catch (err) {
      console.error("Failed to update medical record:", err);
      setModalError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    setError(null);
    try {
      await medicalRecordService.deleteMedicalRecord(recordToDelete.reportId);
      await fetchRecords();
      handleCloseDeleteConfirmDialog();
    } catch (err) {
      console.error("Failed to delete medical record:", err);
      setError(
        `Failed to delete record ${recordToDelete.reportId}: ${err.message}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { field: "reportId", headerName: "Record ID", width: 180 },
    {
      field: "reportContent",
      headerName: "Report Content",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Tooltip title={params.value || ""} placement="top-start">
          <Typography variant="body2" noWrap>
            {params.value
              ? params.value.substring(0, 70) +
                (params.value.length > 70 ? "..." : "")
              : "N/A"}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "doctorNotes",
      headerName: "Doctor Notes",
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        if (isDoctor && editingNoteRecordId === params.row.reportId) {
          return (
            <TextField
              value={currentEditingNote}
              onChange={(e) => setCurrentEditingNote(e.target.value)}
              multiline
              fullWidth
              variant="outlined"
              size="small"
              autoFocus
              onClick={(e) => e.stopPropagation()} // Prevent DataGrid click events
              sx={{ backgroundColor: "#fbfbfb", my: 1 }} // Ensure it's visible and has some padding
            />
          );
        }
        if (isDoctor) {
          return (
            <Box
              sx={{
                whiteSpace: "pre-wrap",
                maxHeight: "100px",
                overflowY: "auto",
                width: "100%",
                py: 1,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography variant="body2">{params.value || "N/A"}</Typography>
            </Box>
          );
        }
        // Default view for non-doctors (truncated with tooltip)
        return (
          <Tooltip title={params.value || ""} placement="top-start">
            <Typography variant="body2" noWrap>
              {params.value
                ? params.value.substring(0, 50) +
                  (params.value.length > 50 ? "..." : "")
                : "N/A"}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "imagePresignedUrls",
      headerName: "Images",
      width: 120,
      sortable: false,
      renderCell: (params) => {
        if (!params.value || params.value.length === 0)
          return <Typography variant="caption">N/A</Typography>;
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              overflowX: "auto",
            }}
          >
            {params.value.map((url, index) =>
              url ? (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={url}
                    alt={`Record Image ${index + 1}`}
                    style={{
                      width: 30,
                      height: 30,
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                </a>
              ) : (
                <Tooltip key={index} title="Image not available">
                  <BrokenImageIcon
                    sx={{ width: 30, height: 30, color: "grey.400" }}
                  />
                </Tooltip>
              )
            )}
          </Box>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "updatedAt",
      headerName: "Updated",
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false, // Increased width for more icons
      renderCell: (params) => {
        const isCurrentlyEditingThisNote =
          editingNoteRecordId === params.row.reportId;

        if (isDoctor && isCurrentlyEditingThisNote) {
          // Show Save & Cancel for inline note edit
          return (
            <Box
              sx={{ display: "flex", alignItems: "center" }}
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip title="Save Note">
                <span>
                  {" "}
                  {/* Span needed for disabled tooltip to work */}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveQuickNote(
                        params.row.reportId,
                        currentEditingNote
                      );
                    }}
                    disabled={isSubmitting}
                  >
                    <SaveIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Cancel Edit">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelQuickNote();
                  }}
                  disabled={isSubmitting}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        }

        return (
          // Make sure this Box also stops propagation if it's not handled by inner elements
          <Box onClick={(e) => e.stopPropagation()}>
            {isDoctor &&
              !editingNoteRecordId && ( // Only show Quick Edit Note if NO note is being edited anywhere
                <Tooltip title="Quick Edit Note">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingNoteRecordId(params.row.reportId);
                      setCurrentEditingNote(params.row.doctorNotes || "");
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            {/* Regular Edit (modal) and Delete buttons - hide if ANY note is being quick-edited */}
            {!editingNoteRecordId && (
              <>
                <Tooltip title="Edit Full Record">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenEditModal(params.row)}
                  >
                    <MedicalInformationIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Record">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDeleteConfirmDialog(params.row)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        );
      },
    },
  ];

  if (!patientId) {
    return (
      <Alert severity="warning">
        No patient selected. Please select a patient to view their medical
        records.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarState.severity}
          sx={{ width: "100%" }}
          variant="filled"
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">
          Medical Records for Patient: {patientId}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleOpenCreateModal}
        >
          New Record
        </Button>
      </Box>

      {loading ? (
        <LoadingIndicator message="Loading records..." />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box sx={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={records}
            columns={columns}
            getRowId={(row) => row.reportId}
            pageSize={5}
            rowsPerPageOptions={[5, 10]}
            density="compact"
            components={{
              NoRowsOverlay: () => (
                <EmptyState
                  title="No Records Found"
                  description="This patient has no medical records yet."
                  icon={<MedicalInformationIcon />}
                />
              ),
            }}
            sx={{
              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
                { outline: "none" },
            }}
          />
        </Box>
      )}

      {/* Create Record Modal */}
      <Dialog
        open={openCreateModal}
        onClose={handleCloseCreateModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Create New Medical Record for Patient: {patientId}
        </DialogTitle>
        <DialogContent>
          {modalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {modalError}
            </Alert>
          )}
          <TextField
            margin="dense"
            label="Report Content"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={currentReportContent}
            onChange={(e) => setCurrentReportContent(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            margin="dense"
            label="Doctor Notes"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={currentDoctorNotes}
            onChange={(e) => setCurrentDoctorNotes(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
            Upload Images (Optional)
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "block", marginBottom: "10px" }}
          />
          {imagePreviews.length > 0 && (
            <ImageList
              sx={{ width: "100%", height: "auto", maxHeight: 250 }}
              cols={3}
              rowHeight={80}
              gap={8}
            >
              {imagePreviews.map((preview, index) => (
                <ImageListItem
                  key={index}
                  sx={{ border: "1px solid #ddd", borderRadius: "4px" }}
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <ImageListItemBar
                    sx={{ background: "rgba(0,0,0,0.7)" }}
                    position="top"
                    actionIcon={
                      <IconButton
                        sx={{ color: "white" }}
                        onClick={() => removeSelectedFile(index)}
                        size="small"
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    }
                    actionPosition="right"
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseCreateModal}
            color="secondary"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateRecord}
            variant="contained"
            color="primary"
            disabled={isSubmitting || !currentReportContent}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Create Record"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Record Modal */}
      {selectedRecord && (
        <Dialog
          open={openEditModal}
          onClose={handleCloseEditModal}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Edit Medical Record (ID: {selectedRecord.reportId})
          </DialogTitle>
          <DialogContent>
            {modalError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {modalError}
              </Alert>
            )}
            <TextField
              margin="dense"
              label="Report Content"
              type="text"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={currentReportContent}
              onChange={(e) => setCurrentReportContent(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              margin="dense"
              label="Doctor Notes"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={currentDoctorNotes}
              onChange={(e) => setCurrentDoctorNotes(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
              Existing Images
            </Typography>
            {selectedRecord.imagePresignedUrls &&
            selectedRecord.imagePresignedUrls.length > 0 ? (
              <ImageList
                sx={{ width: "100%", height: "auto", maxHeight: 120, mb: 2 }}
                cols={5}
                rowHeight={60}
                gap={8}
              >
                {selectedRecord.imagePresignedUrls.map((url, index) =>
                  url ? (
                    <ImageListItem key={`existing-${index}`}>
                      <img
                        src={url}
                        alt={`Existing ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    </ImageListItem>
                  ) : (
                    <ImageListItem key={`existing-broken-${index}`}>
                      <BrokenImageIcon
                        sx={{
                          width: "100%",
                          height: "100%",
                          color: "grey.300",
                        }}
                      />
                    </ImageListItem>
                  )
                )}
              </ImageList>
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                No existing images.
              </Typography>
            )}
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
              Upload New Images (Optional)
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "block", marginBottom: "10px" }}
            />
            {imagePreviews.length > 0 && (
              <ImageList
                sx={{ width: "100%", height: "auto", maxHeight: 250 }}
                cols={3}
                rowHeight={80}
                gap={8}
              >
                {imagePreviews.map((preview, index) => (
                  <ImageListItem
                    key={index}
                    sx={{ border: "1px solid #ddd", borderRadius: "4px" }}
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <ImageListItemBar
                      sx={{ background: "rgba(0,0,0,0.7)" }}
                      position="top"
                      actionIcon={
                        <IconButton
                          sx={{ color: "white" }}
                          onClick={() => removeSelectedFile(index)}
                          size="small"
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      }
                      actionPosition="right"
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseEditModal}
              color="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRecord}
              variant="contained"
              color="primary"
              disabled={isSubmitting || !currentReportContent}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Update Record"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteConfirmDialog}
        onClose={handleCloseDeleteConfirmDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this medical record?
            {recordToDelete && ` (ID: ${recordToDelete.reportId})`} This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseDeleteConfirmDialog}
            color="secondary"
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

MedicalRecordsTab.propTypes = {
  patientId: PropTypes.string.isRequired,
};

export default MedicalRecordsTab;
