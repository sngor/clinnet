// src/pages/AdminAppointmentsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { DataTable } from '../components/ui';
import StatusChip from '../components/ui/StatusChip';

// Mock appointment data
const mockAppointments = [
  {
    id: 101,
    patientName: "John Doe",
    patientId: 1,
    doctorName: "Dr. Smith",
    doctorId: 201,
    date: "2023-12-05",
    time: "09:00 AM",
    duration: 30,
    type: "Checkup",
    status: "Scheduled",
    notes: "Annual physical examination"
  },
  {
    id: 102,
    patientName: "Jane Smith",
    patientId: 2,
    doctorName: "Dr. Jones",
    doctorId: 202,
    date: "2023-12-05",
    time: "10:00 AM",
    duration: 45,
    type: "Follow-up",
    status: "Checked-in",
    notes: "Follow-up on medication adjustment"
  },
  {
    id: 103,
    patientName: "Michael Johnson",
    patientId: 3,
    doctorName: "Dr. Smith",
    doctorId: 201,
    date: "2023-12-05",
    time: "11:00 AM",
    duration: 60,
    type: "Consultation",
    status: "In Progress",
    notes: "New symptoms discussion"
  },
  {
    id: 104,
    patientName: "Emily Williams",
    patientId: 4,
    doctorName: "Dr. Wilson",
    doctorId: 203,
    date: "2023-12-06",
    time: "09:30 AM",
    duration: 30,
    type: "Checkup",
    status: "Scheduled",
    notes: ""
  },
  {
    id: 105,
    patientName: "David Brown",
    patientId: 5,
    doctorName: "Dr. Taylor",
    doctorId: 204,
    date: "2023-12-06",
    time: "11:30 AM",
    duration: 45,
    type: "Follow-up",
    status: "Cancelled",
    notes: "Patient requested cancellation"
  }
];

function AdminAppointmentsPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);

  // Fetch appointments (using mock data)
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAppointments(mockAppointments);
      setLoading(false);
    }, 500); // Simulate network delay
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle new appointment
  const handleNewAppointment = () => {
    navigate('/admin/appointments/new');
  };

  // Handle appointment click
  const handleAppointmentClick = (appointment) => {
    navigate(`/admin/appointments/${appointment.id}`);
  };

  // Handle filter menu
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    handleFilterClose();
  };

  // Filter appointments based on search term and status filter
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      searchTerm === '' || 
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    if (statusFilter !== 'all') {
      return matchesSearch && appointment.status.toLowerCase() === statusFilter.toLowerCase();
    }
    
    return matchesSearch;
  });

  // Table columns definition
  const columns = [
    { 
      id: 'date', 
      label: 'Date', 
      format: (value) => formatDate(value)
    },
    { 
      id: 'time', 
      label: 'Time'
    },
    { 
      id: 'patientName', 
      label: 'Patient'
    },
    { 
      id: 'doctorName', 
      label: 'Doctor'
    },
    { 
      id: 'type', 
      label: 'Type'
    },
    { 
      id: 'status', 
      label: 'Status',
      format: (value) => <StatusChip status={value} />
    }
  ];

  // Action button for the header
  const actionButton = (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={handleNewAppointment}
      sx={{ borderRadius: 1.5 }}
    >
      New Appointment
    </Button>
  );

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Use the consistent PageHeader component */}
      <PageHeader 
        title="Appointment Management" 
        subtitle="View and manage all appointments"
        action={actionButton}
      />

      {/* Search and filter bar */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          placeholder="Search appointments..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 500 }}
        />
        <Tooltip title="Filter by status">
          <IconButton 
            aria-label="filter" 
            onClick={handleFilterClick}
            color={statusFilter !== 'all' ? 'primary' : 'default'}
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem 
            onClick={() => handleFilterChange('all')}
            selected={statusFilter === 'all'}
          >
            <ListItemText>All Statuses</ListItemText>
          </MenuItem>
          <MenuItem 
            onClick={() => handleFilterChange('scheduled')}
            selected={statusFilter === 'scheduled'}
          >
            <ListItemIcon>
              <MoreTimeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Scheduled</ListItemText>
          </MenuItem>
          <MenuItem 
            onClick={() => handleFilterChange('checked-in')}
            selected={statusFilter === 'checked-in'}
          >
            <ListItemIcon>
              <CheckCircleIcon fontSize="small" color="success" />
            </ListItemIcon>
            <ListItemText>Checked-in</ListItemText>
          </MenuItem>
          <MenuItem 
            onClick={() => handleFilterChange('cancelled')}
            selected={statusFilter === 'cancelled'}
          >
            <ListItemIcon>
              <CancelIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Cancelled</ListItemText>
          </MenuItem>
        </Menu>
      </Box>

      {/* Appointments table */}
      <DataTable
        columns={columns}
        data={filteredAppointments}
        loading={loading}
        emptyMessage="No appointments found"
        onRowClick={handleAppointmentClick}
      />
    </Container>
  );
}

export default AdminAppointmentsPage;