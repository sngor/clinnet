// src/pages/DoctorMedicalRecordsPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
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
  Chip,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import CancelIcon from "@mui/icons-material/Cancel"; // For removing selected files
import { Link } from "react-router-dom"; // Added Link import

// Import for summarization
import { summarizeDoctorNotes } from "../services/medicalRecordService";

import PageContainer from "../components/ui/PageContainer";
import PageHeading from "../components/ui/PageHeading";
import ContentCard from "../components/ui/ContentCard";
import EmptyState from "../components/ui/EmptyState";
import LoadingIndicator from "../components/ui/LoadingIndicator";

import medicalRecordService from "../services/medicalRecordService";

const getCurrentDoctorId = () => "doctor-67890"; // Replace with actual auth logic

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]); // Get only base64 part
    reader.onerror = (error) => reject(error);
  });
};

function DoctorMedicalRecordsPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Form states
  const [currentPatientId, setCurrentPatientId] = useState("");
  const [currentReportContent, setCurrentReportContent] = useState("");
  const [currentDoctorNotes, setCurrentDoctorNotes] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // State for summarization
  const [currentSummary, setCurrentSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizationError, setSummarizationError] = useState(null);

  // State for delete confirmation
  const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // For delete button loading state

  const fileInputRef = useRef(null); // For resetting file input

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const doctorId = getCurrentDoctorId();
      const fetchedRecords = await medicalRecordService.getMedicalRecords(
        "doctor",
        doctorId
      );
      setRecords(Array.isArray(fetchedRecords) ? fetchedRecords : []);
    } catch (err) {
      console.error("Failed to fetch medical records:", err);
      setError(
        err.message || "An unexpected error occurred while fetching records."
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const resetFormStates = () => {
    setCurrentPatientId("");
    setCurrentReportContent("");
    setCurrentDoctorNotes("");
    setSelectedFiles([]);
    setImagePreviews([]);
    setModalError(null);
    // Reset summarization states
    setCurrentSummary("");
    setIsSummarizing(false);
    setSummarizationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
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
    setCurrentPatientId(record.patientId || ""); // patientId might not be directly editable but good to have
    setCurrentReportContent(record.reportContent || "");
    setCurrentDoctorNotes(record.doctorNotes || "");
    // Existing images are shown via DataGrid, new images can be added
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setSelectedRecord(null);
    resetFormStates();
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
    if (fileInputRef.current) {
      // Also reset the actual file input if all files are removed
      if (selectedFiles.length === 1) fileInputRef.current.value = "";
    }
  };

  const handleCreateRecord = async () => {
    setIsSubmitting(true);
    setModalError(null);
    try {
      const newRecordData = {
        patientId: currentPatientId,
        doctorId: getCurrentDoctorId(),
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
            // Decide if you want to set a partial error message or continue
            setModalError(
              `Record created, but failed to upload image ${file.name}.`
            );
            // Potentially collect these errors and show them all
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

  const handleOpenDeleteConfirmDialog = (record) => {
    setRecordToDelete(record);
    setOpenDeleteConfirmDialog(true);
  };

  const handleCloseDeleteConfirmDialog = () => {
    setRecordToDelete(null);
    setOpenDeleteConfirmDialog(false);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    setError(null); // Clear main page error
    try {
      await medicalRecordService.deleteMedicalRecord(recordToDelete.reportId);
      console.log("Record deleted successfully:", recordToDelete.reportId); // Basic feedback
      // Optionally: show a success toast/notification here
      await fetchRecords(); // Refresh the list
      handleCloseDeleteConfirmDialog();
    } catch (err) {
      console.error("Failed to delete medical record:", err);
      // Optionally: show an error toast/notification here
      // Set error for the main page or a specific delete error state if preferred
      setError(
        `Failed to delete record ${recordToDelete.reportId}: ${err.message}`
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  const handleFilterChange = (event) => setFilterType(event.target.value);

  const handleSummarizeNotes = async () => {
    setIsSummarizing(true);
    setCurrentSummary("");
    setSummarizationError(null);
    try {
      console.log("Summarizing notes:", currentDoctorNotes);
      const data = await summarizeDoctorNotes(currentDoctorNotes);
      if (data && data.summary) {
        setCurrentSummary(data.summary);
      } else {
        setSummarizationError(
          "Failed to get a valid summary from the service."
        );
      }
    } catch (err) {
      console.error("Summarization failed:", err);
      setSummarizationError(
        err.response?.data?.error ||
          err.message ||
          "An unexpected error occurred during summarization."
      );
    } finally {
      setIsSummarizing(false);
    }
  };

  const filteredRecords = records.filter((record) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (record.patientId &&
        record.patientId.toLowerCase().includes(searchTermLower)) ||
      (record.reportId &&
        record.reportId.toLowerCase().includes(searchTermLower)) ||
      (record.reportContent &&
        record.reportContent.toLowerCase().includes(searchTermLower)) ||
      (record.doctorNotes &&
        record.doctorNotes.toLowerCase().includes(searchTermLower))
    );
    // Add filterType logic if applicable
  });

  const columns = [
    { field: "reportId", headerName: "Record ID", width: 200 },
    {
      field: "patientId",
      headerName: "Patient ID",
      width: 150,
      renderCell: (params) => (
        <Link
          to={`/doctor/patients/${params.value}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "reportContent",
      headerName: "Report Content",
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <Tooltip title={params.value || ""} placement="top-start">
          <Typography variant="body2" noWrap>
            {params.value
              ? params.value.substring(0, 100) +
                (params.value.length > 100 ? "..." : "")
              : "N/A"}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "doctorNotes",
      headerName: "Doctor Notes",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Tooltip title={params.value || ""} placement="top-start">
          <Typography variant="body2" noWrap>
            {params.value
              ? params.value.substring(0, 100) +
                (params.value.length > 100 ? "..." : "")
              : "N/A"}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "imagePresignedUrls",
      headerName: "Images",
      width: 150,
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
                    alt={`Record ${params.row.reportId} Image ${index + 1}`}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                </a>
              ) : (
                <Tooltip key={index} title="Image not available">
                  <BrokenImageIcon
                    sx={{ width: 40, height: 40, color: "grey.400" }}
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
      headerName: "Created At",
      width: 180,
      renderCell: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: "updatedAt",
      headerName: "Last Updated",
      width: 180,
      renderCell: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleOpenEditModal(params.row)}
            aria-label="edit"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleOpenDeleteConfirmDialog(params.row)}
            aria-label="delete"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeading
        title="Medical Records"
        subtitle="View and manage patient medical records"
      />
      <ContentCard>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { sm: "center" },
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, flexGrow: { xs: 1, sm: 0.5 } }}>
            <TextField
              placeholder="Search..."
              variant="outlined"
              fullWidth
              size="small"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter</InputLabel>
              <Select
                value={filterType}
                label="Filter"
                onChange={handleFilterChange}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleOpenCreateModal}
            sx={{ mt: { xs: 2, sm: 0 } }}
          >
            Create New Record
          </Button>
        </Box>

        {loading ? (
          <LoadingIndicator message="Loading medical records..." />
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            <Typography>Error: {error}</Typography>
          </Alert>
        ) : filteredRecords.length > 0 ? (
          <Box sx={{ height: 500, width: "100%" }}>
            <DataGrid
              rows={filteredRecords}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20, 50]}
              getRowId={(row) => row.reportId}
              disableSelectionOnClick
              density="standard"
              sx={{
                "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
                  { outline: "none" },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: (theme) => theme.palette.action.hover,
                },
              }}
            />
          </Box>
        ) : (
          <EmptyState
            icon={<MedicalInformationIcon />}
            title="No Medical Records Found"
            description={
              searchTerm || filterType !== "all"
                ? "No records match your current search or filter criteria."
                : "You have not created or been associated with any medical records yet."
            }
          />
        )}
      </ContentCard>

      {/* Create Record Modal */}
      <Dialog
        open={openCreateModal}
        onClose={handleCloseCreateModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Medical Record</DialogTitle>
        <DialogContent>
          {modalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {modalError}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Patient ID"
            type="text"
            fullWidth
            variant="outlined"
            value={currentPatientId}
            onChange={(e) => setCurrentPatientId(e.target.value)}
            sx={{ mb: 2 }}
          />
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

          {/* Summarization Section */}
          <Box sx={{ mt: 1, mb: 2 }}>
            <Button
              variant="outlined"
              onClick={handleSummarizeNotes}
              disabled={isSummarizing || !currentDoctorNotes.trim()}
              sx={{ mt: 1, mb: 1 }}
              startIcon={isSummarizing ? <CircularProgress size={20} /> : null}
            >
              {isSummarizing ? "Summarizing..." : "Generate Summary"}
            </Button>
            {summarizationError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {summarizationError}
              </Alert>
            )}
            {currentSummary && (
              <TextField
                label="Generated Summary"
                multiline
                fullWidth
                rows={3} // Adjust as needed
                value={currentSummary}
                InputProps={{ readOnly: true }}
                variant="outlined"
                sx={{ mt: 2, backgroundColor: "action.hover" }}
              />
            )}
          </Box>

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
              sx={{ width: "100%", height: "auto", maxHeight: 300 }}
              cols={3}
              rowHeight={100}
              gap={8}
            >
              {imagePreviews.map((preview, index) => (
                <ImageListItem
                  key={index}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "4px",
                  }}
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
                    sx={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
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
            disabled={
              isSubmitting || !currentPatientId || !currentReportContent
            }
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
              label="Patient ID"
              type="text"
              fullWidth
              variant="outlined"
              value={currentPatientId}
              disabled
              sx={{ mb: 2 }}
            />
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

            {/* Summarization Section for Edit Modal */}
            <Box sx={{ mt: 1, mb: 2 }}>
              <Button
                variant="outlined"
                onClick={handleSummarizeNotes}
                disabled={isSummarizing || !currentDoctorNotes.trim()}
                sx={{ mt: 1, mb: 1 }}
                startIcon={
                  isSummarizing ? <CircularProgress size={20} /> : null
                }
              >
                {isSummarizing ? "Summarizing..." : "Generate Summary"}
              </Button>
              {summarizationError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {summarizationError}
                </Alert>
              )}
              {currentSummary && (
                <TextField
                  label="Generated Summary"
                  multiline
                  fullWidth
                  rows={3} // Adjust as needed
                  value={currentSummary}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  sx={{ mt: 2, backgroundColor: "action.hover" }}
                />
              )}
            </Box>

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
              Existing Images
            </Typography>
            {selectedRecord.imagePresignedUrls &&
            selectedRecord.imagePresignedUrls.length > 0 ? (
              <ImageList
                sx={{ width: "100%", height: "auto", maxHeight: 150, mb: 2 }}
                cols={4}
                rowHeight={80}
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
                sx={{ width: "100%", height: "auto", maxHeight: 300 }}
                cols={3}
                rowHeight={100}
                gap={8}
              >
                {imagePreviews.map((preview, index) => (
                  <ImageListItem
                    key={index}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "4px",
                    }}
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
                      sx={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
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
        aria-labelledby="delete-confirm-dialog-title"
        aria-describedby="delete-confirm-dialog-description"
      >
        <DialogTitle id="delete-confirm-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography id="delete-confirm-dialog-description">
            Are you sure you want to delete this medical record?
            {recordToDelete &&
              ` (ID: ${recordToDelete.reportId}, Patient: ${recordToDelete.patientId})`}
            <br />
            This action cannot be undone.
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
    </PageContainer>
  );
}

export default DoctorMedicalRecordsPage;
