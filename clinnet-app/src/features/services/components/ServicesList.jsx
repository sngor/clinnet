// src/features/services/components/ServicesList.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer as MuiTableContainer,
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
  IconButton,
  InputAdornment,
  Chip,
  Typography,
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
import { initialServices } from "../data/initialServices";
import TableContainer from "../../../components/TableContainer";
import ConfirmDeleteDialog from "../../../components/ConfirmDeleteDialog";

// Table column definitions
const columns = [
  { id: "id", label: "ID", numeric: true },
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
  const [services, setServices] = useState(initialServices);
  const [openAddEdit, setOpenAddEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [formData, setFormData] = useState({ ...initialServiceFormData });

  // Sorting state
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");

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
      discountPercentage: service.discountPercentage,
      duration: service.duration,
      active: service.active,
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

  // Save service (add or edit)
  const handleSaveService = () => {
    if (currentService) {
      // Edit existing service
      setServices(
        services.map((service) =>
          service.id === currentService.id
            ? { ...service, ...formData, id: currentService.id }
            : service
        )
      );
    } else {
      // Add new service
      const newService = {
        ...formData,
        id: Math.max(...services.map((s) => s.id)) + 1, // Simple ID generation
      };
      setServices([...services, newService]);
    }
    setOpenAddEdit(false);
  };

  // Delete service
  const handleDeleteService = () => {
    setServices(services.filter((service) => service.id !== currentService.id));
    setOpenDelete(false);
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

  // Action button for the table
  const actionButton = (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={handleAddService}
      sx={{ borderRadius: 1.5 }}
    >
      Add Service
    </Button>
  );

  return (
    <Box sx={{ width: "100%" }}>
      <TableContainer title="Medical Services" action={actionButton}>
        <MuiTableContainer sx={{ boxShadow: "none" }}>
          <Table
            sx={{
              minWidth: 650,
              "& .MuiTableCell-root": {
                borderBottom: "none",
                padding: "16px",
              },
              "& tbody tr": {
                borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
              },
              "& tbody tr:last-child": {
                border: 0,
              },
              borderCollapse: "separate",
              borderSpacing: 0,
              "& thead tr th:first-of-type": {
                borderRadius: "8px 0 0 8px",
              },
              "& thead tr th:last-of-type": {
                borderRadius: "0 8px 8px 0",
              },
            }}
            aria-label="services table"
          >
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
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
              {stableSort(services, getComparator(order, orderBy)).map(
                (service) => (
                  <TableRow
                    key={service.id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {service.id}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {service.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {service.description.length > 50
                          ? `${service.description.substring(0, 50)}...`
                          : service.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          service.category.charAt(0).toUpperCase() +
                          service.category.slice(1)
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
                    <TableCell>{service.discountPercentage}%</TableCell>
                    <TableCell>{service.duration} min</TableCell>
                    <TableCell>
                      <Chip
                        label={service.active ? "Active" : "Inactive"}
                        size="small"
                        color={service.active ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => handleEditService(service)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeleteClick(service)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </MuiTableContainer>
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveService}
            variant="contained"
            disabled={
              !formData.name || !formData.category || formData.price < 0
            }
          >
            {currentService ? "Save Changes" : "Add Service"}
          </Button>
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
    </Box>
  );
}

export default ServicesList;
