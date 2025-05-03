// src/app/providers/DateAdapter.jsx
import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import DateFnsUtils from '@date-io/date-fns';

/**
 * Custom adapter that uses @date-io/date-fns instead of the built-in adapter
 * to avoid compatibility issues with date-fns versions
 */
class CustomDateFnsAdapter extends DateFnsUtils {
  // Override any methods if needed
}

/**
 * DateAdapter provider component that wraps the application with the appropriate
 * date adapter for MUI date pickers.
 */
function DateAdapter({ children }) {
  return (
    <LocalizationProvider dateAdapter={CustomDateFnsAdapter}>
      {children}
    </LocalizationProvider>
  );
}

export default DateAdapter;