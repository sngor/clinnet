// src/features/services/components/ServicesList.jsx
import React, { useState, useEffect } from "react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Chip,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  serviceCategories,
  formatPrice,
  calculateFinalPrice,
  initialServiceFormData,
} from "../models/serviceModel";
import TableContainer from "../../../components/TableContainer";
import ConfirmDeleteDialog from "../../../components/ui/ConfirmDeleteDialog"; // Updated path
import { useAppData } from "../../../app/providers/DataProvider";
import {
  StyledTableContainer,
  tableHeaderStyle,
  actionButtonsStyle,
} from "../../../components/ui";
import {
  PageContainer,
  CardContainer,
  PrimaryButton,
  AppIconButton,
  FlexBox,
  SecondaryButton,
} from "../../../components/ui";
import LoadingIndicator from "../../../components/LoadingIndicator";

// Table column definitions
const columns = [
  // { id: "id", label: "ID", numeric: true }, // HIDE ID COLUMN
  { id: "name", label: "Service Name", numeric: false },
  { id: "category", label: "Category", numeric: false },
  { id: "price", label: "Price ($)", numeric: true },
  { id: "discountPercentage", label: "Discount (%)", numeric: true },
  { id: "duration", label: "Duration (min)", numeric: true },
  { id: "active", label: "Status", numeric: false },
];

function descendingComparator(a, b, orderBy) {
  // Handle null or undefined values
  if (b[orderBy] == null) return -1;
  if (a[orderBy] == null) return 1;

  // Compare based on type
  if (typeof b[orderBy] === "string") {
    return b[orderBy].toLowerCase().localeCompare(a[orderBy].toLowerCase());
  } else {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1]; // Preserve original order if values are equal
  });
  return stabilizedThis.map((el) => el[0]);
}

function ServicesList() {
  const {
    services: apiServices,
    loading: apiLoading,
    error: apiError,
    addService,
    updateService,
    deleteService,
  } = useAppData();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAddEdit, setOpenAddEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [formData, setFormData] = useState({ ...initialServiceFormData });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Sorting state
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");

  // Use data from API when available
  useEffect(() => {
    if (apiServices && apiServices.length > 0) {
      console.log("Using services data from API:", apiServices);

      // Transform API data to match the expected format if needed
      const formattedServices = apiServices.map((service) => ({
        id: service.id,
        name: service.name || "",
        description: service.description || "",
        category: service.category || "consultation",
        price: service.price || 0,
        discountPercentage: service.discountPercentage || 0,
        duration: service.duration || 30,
        active: service.active !== false,
      }));

      setServices(formattedServices);
      setLoading(false);
    } else if (apiLoading) {
      setLoading(true);
    } else if (apiError) {
      setError(apiError);
      setLoading(false);
    }
  }, [apiServices, apiLoading, apiError]);

  // Defensive: ensure all fields are valid before rendering
  const safeServices = Array.isArray(services)
    ? services.filter(
        (s) =>
          s &&
          typeof s.id !== "undefined" &&
          typeof s.name === "string" &&
          typeof s.category === "string" &&
          typeof s.price === "number" &&
          typeof s.discountPercentage === "number" &&
          typeof s.duration === "number" &&
          (typeof s.active === "boolean" || typeof s.active === "undefined")
      )
    : [];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Convert numeric values
    if (
      name === "price" ||
      name === "discountPercentage" ||
      name === "duration"
    ) {
      setFormData({
        ...formData,
        [name]: value === "" ? "" : Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Open add service dialog
  const handleAddService = () => {
    setCurrentService(null);
    setFormData({ ...initialServiceFormData });
    setOpenAddEdit(true);
  };

  // Open edit service dialog
  const handleEditService = (service) => {
    setCurrentService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      category: service.category,
      price: service.price,
      discountPercentage: service.discountPercentage || 0,
      duration: service.duration || 30,
      active: service.active !== undefined ? service.active : true,
    });
    setOpenAddEdit(true);
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (service) => {
    setCurrentService(service);
    setOpenDelete(true);
  };

  // Close dialogs
  const handleCloseDialog = () => {
    setOpenAddEdit(false);
    setOpenDelete(false);
  };

  // Handle closing snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Save service (add or edit)
  const handleSaveService = async () => {
    try {
      setLoading(true);

      if (currentService) {
        // Edit existing service
        await updateService(currentService.id, formData);

        setSnackbar({
          open: true,
          message: "Service updated successfully",
          severity: "success",
        });
      } else {
        // Add new service
        await addService(formData);

        setSnackbar({
          open: true,
          message: "Service added successfully",
          severity: "success",
        });
      }

      setOpenAddEdit(false);
      setError(null);
    } catch (err) {
      console.error("Error saving service:", err);
      setError("Failed to save service. Please try again.");
      setSnackbar({
        open: true,
        message: "Error saving service",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete service
  const handleDeleteService = async () => {
    try {
      setLoading(true);

      await deleteService(currentService.id);

      setSnackbar({
        open: true,
        message: "Service deleted successfully",
        severity: "success",
      });

      setOpenDelete(false);
      setError(null);
    } catch (err) {
      console.error("Error deleting service:", err);
      setError("Failed to delete service. Please try again.");
      setSnackbar({
        open: true,
        message: "Error deleting service",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Create sort handler for a column
  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };

  return (
    <Box
      sx={{
        background: "#fff",
        borderRadius: 2,
        boxShadow: "0 2px 12px rgba(67,97,238,0.04)",
        p: { xs: 2, sm: 3 },
        mb: 4,
      }}
    >
      <FlexBox justify="space-between" align="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Services</Typography>
        <PrimaryButton
          startIcon={<AddIcon />}
          onClick={handleAddService}
          sx={{ borderRadius: 1.5 }}
          aria-label="Add new service"
        >
          Add Service
        </PrimaryButton>
      </FlexBox>
      <TableContainer
        title={null}
        action={null}
        aria-label="Services table"
        sx={{ boxShadow: "none", border: "none", borderRadius: 1, p: 0 }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <LoadingIndicator size="large" message="Loading services..." />
          </Box>
        ) : (
          <StyledTableContainer sx={{ border: "none", borderRadius: 1 }}>
            <TableHead sx={tableHeaderStyle}>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    sortDirection={orderBy === column.id ? order : false}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : "asc"}
                      onClick={createSortHandler(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {safeServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center">
                    No services found
                  </TableCell>
                </TableRow>
              ) : (
                stableSort(safeServices, getComparator(order, orderBy)).map(
                  (service, idx) => (
                    <TableRow
                      key={service.id}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        borderBottom: "1.5px solid #e0e0e0",
                        backgroundColor: idx % 2 === 0 ? "#fafbfc" : "#fff",
                        transition: "background 0.2s",
                      }}
                    >
                      {/* <TableCell component="th" scope="row">{service.id}</TableCell> */}
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {service.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block" }}
                        >
                          {service.description &&
                          service.description.length > 50
                            ? `${service.description.substring(0, 50)}...`
                            : service.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            service.category
                              ? service.category.charAt(0).toUpperCase() +
                                service.category.slice(1)
                              : "Consultation"
                          }
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {formatPrice(service.price)}
                        {service.discountPercentage > 0 && (
                          <Typography
                            variant="caption"
                            color="success.main"
                            sx={{ display: "block" }}
                          >
                            {formatPrice(
                              calculateFinalPrice(
                                service.price,
                                service.discountPercentage
                              )
                            )}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{service.discountPercentage || 0}%</TableCell>
                      <TableCell>{service.duration || 30} min</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            service.active !== false ? "Active" : "Inactive"
                          }
                          size="small"
                          color={
                            service.active !== false ? "success" : "default"
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit Service">
                          <AppIconButton
                            icon={EditIcon}
                            aria-label="Edit"
                            color="primary"
                            onClick={() => handleEditService(service)}
                          />
                        </Tooltip>
                        <Tooltip title="Delete Service">
                          <AppIconButton
                            icon={DeleteIcon}
                            aria-label="Delete"
                            color="error"
                            onClick={() => handleDeleteClick(service)}
                          />
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </StyledTableContainer>
        )}
      </TableContainer>
      {/* Add/Edit Service Dialog */}
      <Dialog
        open={openAddEdit}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentService ? "Edit Service" : "Add New Service"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              name="name"
              label="Service Name"
              fullWidth
              value={formData.name}
              onChange={handleInputChange}
              required
            />

            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed description of the service"
            />

            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={formData.category}
                label="Category"
                onChange={handleInputChange}
              >
                {serviceCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              name="price"
              label="Price"
              type="number"
              fullWidth
              value={formData.price}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />

            <TextField
              name="discountPercentage"
              label="Discount Percentage"
              type="number"
              fullWidth
              value={formData.discountPercentage}
              onChange={handleInputChange}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              inputProps={{
                min: 0,
                max: 100,
              }}
            />

            <TextField
              name="duration"
              label="Duration (minutes)"
              type="number"
              fullWidth
              value={formData.duration}
              onChange={handleInputChange}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">min</InputAdornment>
                ),
              }}
              inputProps={{
                min: 1,
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="active"
                value={formData.active}
                label="Status"
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.value })
                }
              >
                <MenuItem value={true}>Active</MenuItem>
                <MenuItem value={false}>Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <SecondaryButton onClick={handleCloseDialog}>Cancel</SecondaryButton>
          <PrimaryButton
            onClick={handleSaveService}
            disabled={
              !formData.name || !formData.category || formData.price < 0
            }
          >
            {currentService ? "Save Changes" : "Add Service"}
          </PrimaryButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={openDelete}
        onClose={handleCloseDialog}
        onConfirm={handleDeleteService}
        itemName={currentService?.name}
        itemType="service"
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ServicesList;
