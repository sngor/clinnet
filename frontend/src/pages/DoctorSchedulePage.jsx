// src/pages/DoctorSchedulePage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PageContainer from '../components/ui/PageContainer';
import PageHeading from '../components/ui/PageHeading';
import ContentCard from '../components/ui/ContentCard';
import EmptyState from '../components/ui/EmptyState';
import LoadingIndicator from '../components/ui/LoadingIndicator';

// Styled components for the schedule grid
const TimeSlot = styled(Paper)(({ theme, isAvailable }) => ({
  padding: theme.spacing(1.5),
  textAlign: 'center',
  backgroundColor: isAvailable ? theme.palette.success.light : theme.palette.grey[100],
  color: isAvailable ? theme.palette.success.contrastText : theme.palette.text.secondary,
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: isAvailable ? theme.palette.success.main : theme.palette.grey[200],
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2]
  }
}));

const TimeLabel = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  textAlign: 'right',
  fontWeight: 'bold',
  color: theme.palette.text.secondary
}));

const DayHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  textAlign: 'center',
  fontWeight: 'bold',
  borderBottom: `1px solid ${theme.palette.divider}`
}));

function DoctorSchedulePage() {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState({});
  const [selectedWeek, setSelectedWeek] = useState('current');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Days of the week
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Time slots
  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      // Generate mock schedule data
      const mockSchedule = {};
      
      days.forEach(day => {
        mockSchedule[day] = {};
        timeSlots.forEach(time => {
          // Randomly set availability (70% chance of being available)
          mockSchedule[day][time] = Math.random() < 0.7;
        });
      });
      
      setSchedule(mockSchedule);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle slot click
  const handleSlotClick = (day, time) => {
    setSelectedSlot({ day, time, isAvailable: schedule[day][time] });
    setEditDialogOpen(true);
  };

  // Handle availability toggle
  const handleAvailabilityToggle = () => {
    if (selectedSlot) {
      const { day, time } = selectedSlot;
      setSchedule(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [time]: !prev[day][time]
        }
      }));
      setEditDialogOpen(false);
    }
  };

  // Handle bulk update
  const handleBulkUpdate = (isAvailable) => {
    const newSchedule = { ...schedule };
    
    days.forEach(day => {
      timeSlots.forEach(time => {
        newSchedule[day][time] = isAvailable;
      });
    });
    
    setSchedule(newSchedule);
  };

  return (
    <PageContainer>
      <PageHeading 
        title="My Schedule" 
        subtitle="Manage your availability for appointments"
        action={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<EventBusyIcon />}
              onClick={() => handleBulkUpdate(false)}
            >
              Mark All Unavailable
            </Button>
            <Button
              variant="outlined"
              color="success"
              startIcon={<EventAvailableIcon />}
              onClick={() => handleBulkUpdate(true)}
            >
              Mark All Available
            </Button>
          </Box>
        }
      />

      <ContentCard>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Weekly Schedule</Typography>
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="week-select-label">Select Week</InputLabel>
            <Select
              labelId="week-select-label"
              id="week-select"
              value={selectedWeek}
              label="Select Week"
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              <MenuItem value="previous">Previous Week</MenuItem>
              <MenuItem value="current">Current Week</MenuItem>
              <MenuItem value="next">Next Week</MenuItem>
              <MenuItem value="twoWeeks">Two Weeks Ahead</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {loading ? (
          <LoadingIndicator message="Loading schedule..." />
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Grid container spacing={1}>
              {/* Empty cell for the corner */}
              <Grid item xs={2}>
                <Box sx={{ height: '100%' }}></Box>
              </Grid>
              
              {/* Day headers */}
              {days.map((day) => (
                <Grid item xs key={day}>
                  <DayHeader>{day}</DayHeader>
                </Grid>
              ))}
              
              {/* Time slots */}
              {timeSlots.map((time) => (
                <React.Fragment key={time}>
                  {/* Time label */}
                  <Grid item xs={2}>
                    <TimeLabel>{time}</TimeLabel>
                  </Grid>
                  
                  {/* Availability cells for each day */}
                  {days.map((day) => (
                    <Grid item xs key={`${day}-${time}`}>
                      <TimeSlot 
                        isAvailable={schedule[day]?.[time]} 
                        onClick={() => handleSlotClick(day, time)}
                        elevation={schedule[day]?.[time] ? 1 : 0}
                      >
                        {schedule[day]?.[time] ? 'Available' : 'Unavailable'}
                      </TimeSlot>
                    </Grid>
                  ))}
                </React.Fragment>
              ))}
            </Grid>
          </Box>
        )}
      </ContentCard>

      <Box sx={{ mt: 4 }}>
        <ContentCard title="Schedule Legend">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip 
                  label="Available" 
                  color="success" 
                  size="small" 
                  sx={{ mr: 2 }} 
                />
                <Typography variant="body2">
                  You are available for appointments during this time slot
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip 
                  label="Unavailable" 
                  color="default" 
                  size="small" 
                  sx={{ mr: 2 }} 
                />
                <Typography variant="body2">
                  You are not available for appointments during this time slot
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Click on any time slot to toggle your availability. Changes will be reflected in the appointment booking system.
              </Typography>
            </Grid>
          </Grid>
        </ContentCard>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>
          Edit Availability
          <IconButton
            aria-label="close"
            onClick={() => setEditDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedSlot && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                {selectedSlot.day} at {selectedSlot.time}
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 3 }}>
                Current status: 
                <Chip 
                  label={selectedSlot.isAvailable ? "Available" : "Unavailable"} 
                  color={selectedSlot.isAvailable ? "success" : "default"}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              
              <TextField
                label="Notes (optional)"
                multiline
                rows={3}
                fullWidth
                placeholder="Add any notes about this time slot"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color={selectedSlot?.isAvailable ? "error" : "success"}
            onClick={handleAvailabilityToggle}
            startIcon={selectedSlot?.isAvailable ? <EventBusyIcon /> : <EventAvailableIcon />}
          >
            Mark as {selectedSlot?.isAvailable ? "Unavailable" : "Available"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

export default DoctorSchedulePage;