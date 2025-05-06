// src/components/FormFields.jsx
import React from 'react';
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Checkbox,
  FormControlLabel,
  RadioGroup,
  Radio,
  Box,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

/**
 * A consistent text field component
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {string} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} [props.required=false] - Whether field is required
 * @param {boolean} [props.disabled=false] - Whether field is disabled
 * @param {string} [props.error] - Error message
 * @param {Object} [props.inputProps] - Additional props for the input
 * @param {Object} [props.sx] - Additional styles
 */
export const FormTextField = ({ 
  name, 
  label, 
  value, 
  onChange, 
  required = false, 
  disabled = false, 
  error, 
  inputProps = {}, 
  sx = {},
  ...rest 
}) => {
  return (
    <TextField
      name={name}
      label={label}
      value={value || ''}
      onChange={onChange}
      required={required}
      disabled={disabled}
      error={!!error}
      helperText={error}
      fullWidth
      margin="normal"
      InputProps={inputProps}
      sx={{ ...sx }}
      {...rest}
    />
  );
};

/**
 * A consistent select field component
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {string|number} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Select options
 * @param {boolean} [props.required=false] - Whether field is required
 * @param {boolean} [props.disabled=false] - Whether field is disabled
 * @param {string} [props.error] - Error message
 * @param {Object} [props.sx] - Additional styles
 */
export const FormSelectField = ({ 
  name, 
  label, 
  value, 
  onChange, 
  options = [], 
  required = false, 
  disabled = false, 
  error, 
  sx = {},
  ...rest 
}) => {
  return (
    <FormControl 
      fullWidth 
      margin="normal" 
      required={required} 
      disabled={disabled} 
      error={!!error}
      sx={{ ...sx }}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        name={name}
        value={value || ''}
        onChange={onChange}
        label={label}
        {...rest}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

/**
 * A consistent date field component
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {Date|string} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} [props.required=false] - Whether field is required
 * @param {boolean} [props.disabled=false] - Whether field is disabled
 * @param {string} [props.error] - Error message
 * @param {Object} [props.sx] - Additional styles
 */
export const FormDateField = ({ 
  name, 
  label, 
  value, 
  onChange, 
  required = false, 
  disabled = false, 
  error, 
  sx = {},
  ...rest 
}) => {
  const handleDateChange = (date) => {
    // Create a synthetic event to match the onChange API of other form fields
    onChange({
      target: {
        name,
        value: date ? date.toISOString().split('T')[0] : null
      }
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={value ? new Date(value) : null}
        onChange={handleDateChange}
        disabled={disabled}
        slotProps={{
          textField: {
            fullWidth: true,
            margin: "normal",
            required: required,
            error: !!error,
            helperText: error,
            name: name,
            sx: { ...sx }
          }
        }}
        {...rest}
      />
    </LocalizationProvider>
  );
};

/**
 * A consistent checkbox field component
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {boolean} props.checked - Whether checkbox is checked
 * @param {Function} props.onChange - Change handler
 * @param {boolean} [props.disabled=false] - Whether field is disabled
 * @param {Object} [props.sx] - Additional styles
 */
export const FormCheckbox = ({ 
  name, 
  label, 
  checked, 
  onChange, 
  disabled = false, 
  sx = {},
  ...rest 
}) => {
  const handleChange = (event) => {
    onChange({
      target: {
        name,
        value: event.target.checked
      }
    });
  };

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={!!checked}
          onChange={handleChange}
          disabled={disabled}
          name={name}
          {...rest}
        />
      }
      label={label}
      sx={{ ...sx }}
    />
  );
};

/**
 * A consistent radio group component
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {string|number} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Radio options
 * @param {boolean} [props.required=false] - Whether field is required
 * @param {boolean} [props.disabled=false] - Whether field is disabled
 * @param {string} [props.error] - Error message
 * @param {Object} [props.sx] - Additional styles
 */
export const FormRadioGroup = ({ 
  name, 
  label, 
  value, 
  onChange, 
  options = [], 
  required = false, 
  disabled = false, 
  error, 
  sx = {},
  ...rest 
}) => {
  return (
    <FormControl 
      component="fieldset" 
      required={required} 
      disabled={disabled} 
      error={!!error}
      margin="normal"
      sx={{ ...sx }}
    >
      {label && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{label}</Typography>}
      <RadioGroup
        name={name}
        value={value || ''}
        onChange={onChange}
        {...rest}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
};

/**
 * A consistent textarea component
 * 
 * @param {Object} props - Component props
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {string} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {number} [props.rows=4] - Number of rows
 * @param {boolean} [props.required=false] - Whether field is required
 * @param {boolean} [props.disabled=false] - Whether field is disabled
 * @param {string} [props.error] - Error message
 * @param {Object} [props.sx] - Additional styles
 */
export const FormTextArea = ({ 
  name, 
  label, 
  value, 
  onChange, 
  rows = 4, 
  required = false, 
  disabled = false, 
  error, 
  sx = {},
  ...rest 
}) => {
  return (
    <TextField
      name={name}
      label={label}
      value={value || ''}
      onChange={onChange}
      required={required}
      disabled={disabled}
      error={!!error}
      helperText={error}
      fullWidth
      margin="normal"
      multiline
      rows={rows}
      sx={{ ...sx }}
      {...rest}
    />
  );
};

/**
 * A form section with title
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {React.ReactNode} props.children - Section content
 * @param {Object} [props.sx] - Additional styles
 */
export const FormSection = ({ title, children, sx = {} }) => {
  return (
    <Box sx={{ mb: 4, ...sx }}>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          mb: 2, 
          fontWeight: 500,
          color: 'primary.main',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 1
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
};