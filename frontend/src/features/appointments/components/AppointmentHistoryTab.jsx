// src/features/appointments/components/AppointmentHistoryTab.jsx
import React, { useState } from 'react';
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
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import NoteIcon from '@mui/icons-material/Note';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { format } from 'date-fns';

function AppointmentHistoryTab({ 
  appointments = [], 
  cancelledAppointments = [], 
  doctorFilter = false,
  doctors = []
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [doctorFilterValue, setDoctorFilterValue] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Combine active and cancelled appointments
  const allAppointments = [
    ...appointments.filter(a => a.status === 'Completed'),
    ...cancelledAppointments
  ];

  // Get color for status chip
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
      case 'No-show':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Format date
  const formatDate = (date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  // Format time
  const formatTime = (date) => {
    return format(new Date(date), 'h:mm a');
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  // Handle type filter change
  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
    setPage(0);
  };

  // Handle date filter change
  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
    setPage(0);
  };

  // Handle doctor filter change
  const handleDoctorFilterChange = (event) => {
    setDoctorFilterValue(event.target.value);
    setPage(0);
  };

  // Open appointment detail dialog
  const handleOpenDetailDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailDialogOpen(true);
  };

  // Close appointment detail dialog
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
  };

  // Filter appointments based on search and filters
  const filteredAppointments = allAppointments.filter(appointment => {
    // Search filter
    const matchesSearch = 
      appointment.patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.doctor && appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      appointment.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.cancellationReason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    // Type filter
    const matchesType = typeFilter === 'all' || appointment.type === typeFilter;
    
    // Doctor filter
    const matchesDoctor = !doctorFilter || doctorFilterValue === 'all' || 
      appointment.doctorId === parseInt(doctorFilterValue);
    
    // Date filter - simplified for now
    let matchesDate = true;
    
    return matchesSearch && matchesStatus && matchesType && matchesDoctor && matchesDate;
  });

  // Get unique appointment types for filter
  const appointmentTypes = [...new Set(allAppointments.map(appointment => appointment.type).filter(Boolean))];
  
  // Get unique appointment statuses for filter
  const appointmentStatuses = [...new Set(allAppointments.map(appointment => appointment.status).filter(Boolean))];

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>Appointment History</Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search appointments"
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {doctorFilter && (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Doctor</InputLabel>
                  <Select
                    value={doctorFilterValue}
                    label="Doctor"
                    onChange={handleDoctorFilterChange}
                  >
                    <MenuItem value="all">All Doctors</MenuItem>
                    {doctors.map(doctor => (
                      <MenuItem key={doctor.id} value={doctor.id}>{doctor.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  {appointmentStatuses.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={handleTypeFilterChange}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  {appointmentTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateFilter}
                  label="Date Range"
                  onChange={handleDateFilterChange}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="week">Past Week</MenuItem>
                  <MenuItem value="month">Past Month</MenuItem>
                  <MenuItem value="quarter">Past 3 Months</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Appointments Table */}
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="appointment history table">
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              {doctorFilter && <TableCell>Doctor</TableCell>}
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAppointments
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((appointment) => (
                <TableRow
                  key={appointment.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {appointment.patient}
                  </TableCell>
                  {doctorFilter && <TableCell>{appointment.doctor}</TableCell>}
                  <TableCell>{formatDate(appointment.start)}</TableCell>
                  <TableCell>{formatTime(appointment.start)} - {formatTime(appointment.end)}</TableCell>
                  <TableCell>{appointment.type}</TableCell>
                  <TableCell>
                    <Chip 
                      label={appointment.status} 
                      color={getStatusColor(appointment.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenDetailDialog(appointment)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            {filteredAppointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={doctorFilter ? 7 : 6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No appointments found matching your filters
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredAppointments.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      
      {/* Appointment Detail Dialog */}
      <Dialog 
        open={detailDialogOpen} 
        onClose={handleCloseDetailDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedAppointment && (
          <>
            <DialogTitle>
              <Typography variant="h6">Appointment Details</Typography>
            </DialogTitle>
            <DialogContent>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{selectedAppointment.patient}</Typography>
                    <Chip 
                      label={selectedAppointment.status} 
                      color={getStatusColor(selectedAppointment.status)} 
                    />
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    {doctorFilter && selectedAppointment.doctor && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocalHospitalIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {selectedAppointment.doctor}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatDate(selectedAppointment.start)}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatTime(selectedAppointment.start)} - {formatTime(selectedAppointment.end)}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          Patient ID: {selectedAppointment.patientId}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <FilterListIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          Type: {selectedAppointment.type}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  
                  {(selectedAppointment.notes || selectedAppointment.cancellationReason) && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      
                      {selectedAppointment.notes && (
                        <>
                          <Typography variant="subtitle1" gutterBottom>Notes</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <NoteIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {selectedAppointment.notes}
                            </Typography>
                          </Box>
                        </>
                      )}
                      
                      {selectedAppointment.cancellationReason && (
                        <>
                          <Typography variant="subtitle1" color="error" gutterBottom>
                            Cancellation Reason
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <NoteIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'error.main' }} />
                            <Typography variant="body2" color="error.main">
                              {selectedAppointment.cancellationReason}
                            </Typography>
                          </Box>
                          {selectedAppointment.cancelledAt && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              Cancelled on: {format(new Date(selectedAppointment.cancelledAt), 'MMM d, yyyy h:mm a')}
                            </Typography>
                          )}
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Patient Medical Record
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To view complete patient medical record, please go to the patient profile.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetailDialog}>Close</Button>
              <Button variant="contained" color="primary">
                View Patient Profile
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Paper>
  );
}

export default AppointmentHistoryTab;