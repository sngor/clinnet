// src/utils/statusUtils.js
// Utility functions for handling status-related operations

/**
 * Get color for appointment status chip
 * @param {string} status - The appointment status
 * @returns {string} MUI color name for the status
 */
export const getAppointmentStatusColor = (status) => {
  switch(status) {
    case 'Scheduled':
      return 'info';
    case 'Checked-in':
      return 'primary';
    case 'In Progress':
      return 'warning';
    case 'Ready for Checkout':
      return 'secondary';
    case 'Completed':
      return 'success';
    case 'Cancelled':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Get next possible statuses based on current status
 * @param {string} currentStatus - The current appointment status
 * @returns {Array} Array of possible next statuses
 */
export const getNextPossibleStatuses = (currentStatus) => {
  switch(currentStatus) {
    case 'Scheduled':
      return ['Checked-in', 'Cancelled'];
    case 'Checked-in':
      return ['In Progress', 'Cancelled'];
    case 'In Progress':
      return ['Ready for Checkout', 'Cancelled'];
    case 'Ready for Checkout':
      return ['Completed', 'Cancelled'];
    case 'Completed':
      return [];
    case 'Cancelled':
      return ['Scheduled'];
    default:
      return [];
  }
};