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
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { designSystem } from "../DesignSystem";

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(designSystem.borderRadius.sm / 8),
    transition: designSystem.transitions.normal,
    backgroundColor: theme.palette.background.paper,
    minHeight: designSystem.components.input.height,

    "& fieldset": {
      borderColor: theme.palette.divider,
      borderWidth: "1px",
    },

    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: "1px",
    },

    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
      boxShadow: `${designSystem.components.input.focusRing} ${theme.palette.primary.main}20`,
    },

    "&.Mui-error fieldset": {
      borderColor: theme.palette.error.main,
    },

    "&.Mui-error:hover fieldset": {
      borderColor: theme.palette.error.main,
    },

    "&.Mui-error.Mui-focused fieldset": {
      borderColor: theme.palette.error.main,
      boxShadow: `${designSystem.components.input.focusRing} ${theme.palette.error.main}20`,
    },
  },

  "& .MuiInputLabel-root": {
    fontWeight: designSystem.typography.fontWeights.medium,
    fontSize: designSystem.typography.fontSizes.sm,

    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },

    "&.Mui-error": {
      color: theme.palette.error.main,
    },
  },

  "& .MuiFormHelperText-root": {
    marginLeft: theme.spacing(0.5),
    marginTop: theme.spacing(1),
    fontSize: designSystem.typography.fontSizes.xs,
    lineHeight: designSystem.typography.lineHeights.normal,

    "&.Mui-error": {
      color: theme.palette.error.main,
    },
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(designSystem.borderRadius.sm / 8),
    transition: designSystem.transitions.normal,
    minHeight: designSystem.components.input.height,

    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.palette.primary.main,
    },

    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderWidth: "2px",
      boxShadow: `${designSystem.components.input.focusRing} ${theme.palette.primary.main}20`,
    },
  },

  "& .MuiInputLabel-root": {
    fontWeight: designSystem.typography.fontWeights.medium,
    fontSize: designSystem.typography.fontSizes.sm,
  },

  "& .MuiFormHelperText-root": {
    marginLeft: theme.spacing(0.5),
    marginTop: theme.spacing(1),
    fontSize: designSystem.typography.fontSizes.xs,
  },
}));

const FieldContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(designSystem.spacing.lg / 8),
}));

/**
 * Unified form field component with consistent styling
 * Replaces: EnhancedTextField, FormField variations
 */
const UnifiedFormField = ({
  type = "text",
  name,
  label,
  value,
  onChange,
  required = false,
  error = false,
  helperText = "",
  description,
  options = [],
  fullWidth = true,
  startIcon,
  endIcon,
  placeholder,
  disabled = false,
  multiline = false,
  rows,
  InputProps = {},
  InputLabelProps = {},
  containerProps = {},
  sx = {},
  ...props
}) => {
  const fieldStyles = {
    width: fullWidth ? "100%" : "auto",
    ...sx,
  };

  // Common props for all field types
  const commonProps = {
    name,
    value: value ?? "",
    onChange,
    required,
    error,
    disabled,
    fullWidth,
    placeholder,
    ...props,
  };

  const renderTextField = () => (
    <StyledTextField
      type={type}
      label={label}
      helperText={helperText}
      multiline={multiline}
      rows={rows}
      sx={fieldStyles}
      InputProps={{
        ...(startIcon && {
          startAdornment: (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ),
        }),
        ...(endIcon && {
          endAdornment: (
            <InputAdornment position="end">{endIcon}</InputAdornment>
          ),
        }),
        ...InputProps,
      }}
      InputLabelProps={{
        shrink: type === "date" || type === "datetime-local" || undefined,
        ...InputLabelProps,
      }}
      {...commonProps}
    />
  );

  const renderSelect = () => (
    <StyledFormControl fullWidth={fullWidth} error={error} required={required}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        id={name}
        label={label}
        sx={fieldStyles}
        {...commonProps}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </StyledFormControl>
  );

  const renderRadio = () => (
    <FormControl component="fieldset" error={error} required={required}>
      <FormLabel
        component="legend"
        sx={{
          fontWeight: designSystem.typography.fontWeights.medium,
          fontSize: designSystem.typography.fontSizes.sm,
          mb: 1,
        }}
      >
        {label}
      </FormLabel>
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

  const renderCheckbox = () => (
    <FormControl error={error} required={required}>
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
        sx={{
          "& .MuiFormControlLabel-label": {
            fontWeight: designSystem.typography.fontWeights.medium,
            fontSize: designSystem.typography.fontSizes.sm,
          },
        }}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );

  const renderField = () => {
    switch (type) {
      case "select":
        return renderSelect();
      case "radio":
        return renderRadio();
      case "checkbox":
        return renderCheckbox();
      case "date":
      case "datetime-local":
      case "time":
      case "password":
      case "email":
      case "number":
      case "tel":
      case "url":
      case "text":
      case "textarea":
      default:
        return renderTextField();
    }
  };

  return (
    <FieldContainer {...containerProps}>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            display: "block",
            fontSize: designSystem.typography.fontSizes.sm,
            lineHeight: designSystem.typography.lineHeights.normal,
          }}
        >
          {description}
        </Typography>
      )}
      {renderField()}
    </FieldContainer>
  );
};

export default UnifiedFormField;
