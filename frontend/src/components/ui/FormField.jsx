// src/components/ui/FormField.jsx
import React from "react";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Checkbox,
} from "@mui/material";
import { styled } from "@mui/material/styles";

/**
 * FormField component for consistent form field styling across the application
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Field type (text, email, password, select, date, radio, checkbox)
 * @param {string} props.name - Field name
 * @param {string} props.label - Field label
 * @param {any} props.value - Field value
 * @param {function} props.onChange - Change handler
 * @param {boolean} props.required - Whether field is required
 * @param {boolean} props.error - Whether field has an error
 * @param {string} props.helperText - Helper text or error message
 * @param {Array} props.options - Options for select, radio fields
 * @param {boolean} props.fullWidth - Whether field should take full width
 * @param {Object} props.InputProps - Props for the Input component
 * @param {Object} props.InputLabelProps - Props for the InputLabel component
 * @param {Object} props.sx - Additional styles
 */
const FormField = ({
  type = "text",
  name,
  label,
  value,
  onChange,
  required = false,
  error = false,
  helperText = "",
  options = [],
  fullWidth = true,
  InputProps = {},
  InputLabelProps = {},
  sx = {},
  ...props
}) => {
  const fieldStyles = {
    mb: 2,
    ...sx,
  };

  // Common props for all field types
  const commonProps = {
    name,
    value: value ?? "",
    onChange,
    required,
    error,
    fullWidth,
    ...props,
  };

  switch (type) {
    case "select":
      return (
        <FormControl
          fullWidth={fullWidth}
          error={error}
          required={required}
          sx={fieldStyles}
        >
          <InputLabel id={`${name}-label`}>{label}</InputLabel>
          <Select
            labelId={`${name}-label`}
            id={name}
            label={label}
            {...commonProps}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );

    case "radio":
      return (
        <FormControl
          component="fieldset"
          error={error}
          required={required}
          sx={fieldStyles}
        >
          <FormLabel component="legend">{label}</FormLabel>
          <RadioGroup
            row
            name={name}
            value={value ?? ""}
            onChange={onChange}
            {...props}
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
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );

    case "checkbox":
      return (
        <FormControl
          error={error}
          required={required}
          sx={fieldStyles}
        >
          <FormControlLabel
            control={
              <Checkbox
                name={name}
                checked={Boolean(value)}
                onChange={onChange}
                {...props}
              />
            }
            label={label}
          />
          {helperText && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
      );

    case "date":
      return (
        <TextField
          type="date"
          label={label}
          InputLabelProps={{ shrink: true, ...InputLabelProps }}
          sx={fieldStyles}
          helperText={helperText}
          {...commonProps}
        />
      );

    case "password":
    case "email":
    case "number":
    case "tel":
    case "text":
    default:
      return (
        <TextField
          type={type}
          label={label}
          sx={fieldStyles}
          helperText={helperText}
          InputProps={InputProps}
          InputLabelProps={InputLabelProps}
          {...commonProps}
        />
      );
  }
};

export default FormField;