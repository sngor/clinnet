// src/features/appointments/components/AdminAppointmentHistory.jsx
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
import { format, subDays, subWeeks, subMonths } from 'date-fns';

// Mock past appointments with doctor information
const mockPastAppointments = [
  {
    id: 101,
    patient: "Alice Brown",
    patientId: 101,
    doctor: "Dr. Smith",
    doctorId: 1,
    date: subDays(new Date(), 1),
    startTime: "09:00 AM",
    endTime: "10:00 AM",
    type: "Checkup",
    status: "Completed",
    notes: "Patient reported feeling better. Prescribed medication refill."
  },
  {
    id: 102,
    patient: "Bob White",
    patientId: 102,
    doctor: "Dr. Jones",
    doctorId: 2,
    date: subDays(new Date(), 2),
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    type: "Consultation",
    status: "Completed",
    notes: "Discussed treatment options. Patient decided on conservative approach."
  },
  {
    id: 103,
    patient: "Charlie Green",
    patientId: 103,
    doctor: "Dr. Smith",
    doctorId: 1,
    date: subDays(new Date(), 3),
    startTime: "02:00 PM",
    endTime: "03:00 PM",
    type: "Follow-up",
    status: "Completed",
    notes: "Test results normal. No further action needed."
  },
  {
    id: 104,
    patient: "David Black",
    patientId: 104,
    doctor: "Dr. Wilson",
    doctorId: 3,
    date: subWeeks(new Date(), 1),
    startTime: "10:30 AM",
    endTime: "11:30 AM",
    type: "Checkup",
    status: "Completed",
    notes: "Annual physical completed. All vitals normal."
  },
  {
    id: 105,
    patient: "Eva Gray",
    patientId: 105,
    doctor: "Dr. Taylor",
    doctorId: 4,
    date: subWeeks(new Date(), 1),
    startTime: "01:30 PM",
    endTime: "02:30 PM",
    type: "Consultation",
    status: "Cancelled",
    notes: "Patient called to cancel. Will reschedule next week."
  },
  {
    id: 106,
    patient: "Frank Wilson",
    patientId: 106,
    doctor: "Dr. Jones",
    doctorId: 2,
    date: subWeeks(new Date(), 2),
    startTime: "09:00 AM",
    endTime: "10:00 AM",
    type: "Emergency",
    status: "Completed",
    notes: "Treated for acute allergic reaction. Prescribed antihistamines."
  },
  {
    id: 107,
    patient: "Grace Miller",
    patientId: 107,
    doctor: "Dr. Smith",
    doctorId: 1,
    date: subWeeks(new Date(), 2),
    startTime: "03:00 PM",
    endTime: "04:00 PM",
    type: "Follow-up",
    status: "Completed",
    notes: "Wound healing well. Removed stitches."
  },
  {
    id: 108,
    patient: "Henry Davis",
    patientId: 108,
    doctor: "Dr. Wilson",
    doctorId: 3,
    date: subMonths(new Date(), 1),
    startTime: "11:00 AM",
    endTime: "12:00 PM",
    type: "Checkup",
    status: "Completed",
    notes: "Routine checkup. Recommended lifestyle changes."
  },
  {
    id: 109,
    patient: "Irene Smith",
    patientId: 109,
    doctor: "Dr. Taylor",
    doctorId: 4,
    date: subMonths(new Date(), 1),
    startTime: "02:00 PM",
    endTime: "03:00 PM",
    type: "Consultation",
    status: "No-show",
    notes: "Patient did not arrive for appointment."
  },
  {
    id: 110,
    patient: "Jack Brown",
    patientId: 110,
    doctor: "Dr. Smith",
    doctorId: 1,
    date: subMonths(new Date(), 2),
    startTime: "09:30 AM",
    endTime: "10:30 AM",
    type: "Follow-up",
    status: "Completed",
    notes: "Medication working well. Continue current regimen."
  }
];

// Mock data for doctors
const mockDoctors = [
  { id: 1, name: "Dr. Smith", specialty: "General Medicine" },
  { id: 2, name: "Dr. Jones", specialty: "Cardiology" },
  { id: 3, name: "Dr. Wilson", specialty: "Pediatrics" },
  { id: 4, name: "Dr. Taylor", specialty: "Dermatology" }
];

function AdminAppointmentHistory() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

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
    setDoctorFilter(event.target.value);
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
  const filteredAppointments = mockPastAppointments.filter(appointment => {
    // Search filter
    const matchesSearch = 
      appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    // Type filter
    const matchesType = typeFilter === 'all' || appointment.type === typeFilter;
    
    // Doctor filter
    const matchesDoctor = doctorFilter === 'all' || appointment.doctorId === parseInt(doctorFilter);
    
    // Date filter
    let matchesDate = true;
    const today = new Date();
    const appointmentDate = new Date(appointment.date);
    
    if (dateFilter === 'week') {
      const weekAgo = subDays(today, 7);
      matchesDate = appointmentDate >= weekAgo;
    } else if (dateFilter === 'month') {
      const monthAgo = subDays(today, 30);
      matchesDate = appointmentDate >= monthAgo;
    } else if (dateFilter === 'quarter') {
      const quarterAgo = subDays(today, 90);
      matchesDate = appointmentDate >= quarterAgo;
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDoctor && matchesDate;
  });

  // Get unique appointment types for filter
  const appointmentTypes = [...new Set(mockPastAppointments.map(appointment => appointment.type))];
  
  // Get unique appointment statuses for filter
  const appointmentStatuses = [...new Set(mockPastAppointments.map(appointment => appointment.status))];

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>Appointment History</Typography>
      
      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search patients, doctors, or types"
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
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Doctor</InputLabel>
                <Select
                  value={doctorFilter}
                  label="Doctor"
                  onChange={handleDoctorFilterChange}
                >
                  <MenuItem value="all">All Doctors</MenuItem>
                  {mockDoctors.map(doctor => (
                    <MenuItem key={doctor.id} value={doctor.id}>{doctor.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
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
              <TableCell>Doctor</TableCell>
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
                  <TableCell>{appointment.doctor}</TableCell>
                  <TableCell>{formatDate(appointment.date)}</TableCell>
                  <TableCell>{appointment.startTime} - {appointment.endTime}</TableCell>
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
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
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
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocalHospitalIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {selectedAppointment.doctor}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatDate(selectedAppointment.date)}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {selectedAppointment.startTime} - {selectedAppointment.endTime}
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
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>Notes</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <NoteIcon fontSize="small" sx={{ mr: 1, mt: 0.3, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {selectedAppointment.notes}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Patient Medical Record
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Appointment ID: {selectedAppointment.id}
                </Typography>
              </Box>
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

export default AdminAppointmentHistory;