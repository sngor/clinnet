/**
 * UnifiedFormField Component
 * A flexible, reusable form field system handling all input types
 *
 * Features:
 * - Comprehensive input type support (text, email, password, number, select, textarea, checkbox, radio, switch, file)
 * - Consistent validation styling and error states
 * - Full accessibility support with ARIA attributes and screen reader support
 * - Theme-aware styling for light/dark modes
 * - Design token integration for consistent styling
 * - Customizable adornments (start/end icons, buttons)
 * - Flexible sizing and spacing options
 * - Keyboard navigation support for complex inputs
 *
 * Replaces: EnhancedTextField, FormField, Input, and various form components
 */

import React, { forwardRef, useState, useId } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  FormHelperText,
  InputLabel,
  OutlinedInput,
  Select,
  MenuItem,
  Checkbox,
  Radio,
  RadioGroup,
  FormControlLabel,
  Switch,
  TextareaAutosize,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CloudUpload,
  Clear,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
} from "@mui/icons-material";
import { designSystem } from "../../design-system/tokens/index.js";

// Base form field container with consistent styling
const StyledFormField = styled(FormControl, {
  shouldForwardProp: (prop) =>
    !["size", "variant", "hasError", "hasSuccess", "fullWidth"].includes(prop),
})(
  ({
    theme,
    size = "md",
    variant = "outlined",
    hasError = false,
    hasSuccess = false,
    fullWidth = true,
  }) => {
    const isDark = theme.palette.mode === "dark";

    // Size configurations
    const sizeConfig = {
      sm: {
        fontSize: designSystem.typography.fontSizes.sm,
        padding: designSystem.spacing.semantic.form.padding.sm,
        minHeight: "36px",
        borderRadius: designSystem.borders.radius.md,
        gap: designSystem.spacing[1],
      },
      md: {
        fontSize: designSystem.typography.fontSizes.base,
        padding: designSystem.spacing.semantic.form.padding.md,
        minHeight: designSystem.accessibility.minTouchTarget,
        borderRadius: designSystem.borders.radius.lg,
        gap: designSystem.spacing[1.5],
      },
      lg: {
        fontSize: designSystem.typography.fontSizes.lg,
        padding: designSystem.spacing.semantic.form.padding.lg,
        minHeight: "48px",
        borderRadius: designSystem.borders.radius.lg,
        gap: designSystem.spacing[2],
      },
    };

    const currentSize = sizeConfig[size];

    return {
      width: fullWidth ? "100%" : "auto",
      marginBottom: designSystem.spacing.semantic.form.spacing.field,

      // Label styling
      "& .MuiFormLabel-root": {
        fontSize: currentSize.fontSize,
        fontWeight: designSystem.typography.fontWeights.medium,
        color: hasError
          ? theme.palette.error.main
          : hasSuccess
          ? theme.palette.success.main
          : theme.palette.text.primary,
        marginBottom: designSystem.spacing[1],

        "&.Mui-focused": {
          color: hasError
            ? theme.palette.error.main
            : hasSuccess
            ? theme.palette.success.main
            : theme.palette.primary.main,
        },

        "&.Mui-required::after": {
          content: '" *"',
          color: theme.palette.error.main,
        },
      },

      // Input styling
      "& .MuiOutlinedInput-root": {
        fontSize: currentSize.fontSize,
        borderRadius: currentSize.borderRadius,
        minHeight: currentSize.minHeight,
        transition: designSystem.transitions.combinations.normal,

        "& fieldset": {
          borderColor: hasError
            ? theme.palette.error.main
            : hasSuccess
            ? theme.palette.success.main
            : theme.palette.divider,
          borderWidth: designSystem.borders.width[1],
        },

        "&:hover fieldset": {
          borderColor: hasError
            ? theme.palette.error.main
            : hasSuccess
            ? theme.palette.success.main
            : theme.palette.primary.main,
        },

        "&.Mui-focused fieldset": {
          borderColor: hasError
            ? theme.palette.error.main
            : hasSuccess
            ? theme.palette.success.main
            : theme.palette.primary.main,
          borderWidth: designSystem.borders.width[2],
        },

        "&.Mui-disabled": {
          backgroundColor: theme.palette.action.disabledBackground,

          "& fieldset": {
            borderColor: theme.palette.action.disabled,
          },
        },
      },

      // Helper text styling
      "& .MuiFormHelperText-root": {
        fontSize: designSystem.typography.fontSizes.sm,
        marginTop: designSystem.spacing[1],
        marginLeft: 0,
        marginRight: 0,
        color: hasError
          ? theme.palette.error.main
          : hasSuccess
          ? theme.palette.success.main
          : theme.palette.text.secondary,

        "&.Mui-error": {
          color: theme.palette.error.main,
        },
      },

      // Focus ring for accessibility
      "& .MuiOutlinedInput-root.Mui-focused": {
        outline: `${designSystem.accessibility.focusRing.width} ${
          designSystem.accessibility.focusRing.style
        } ${
          hasError
            ? theme.palette.error.main
            : hasSuccess
            ? theme.palette.success.main
            : theme.palette.primary.main
        }`,
        outlineOffset: designSystem.accessibility.focusRing.offset,
      },
    };
  }
);

// Styled input component with adornment support
const StyledInput = styled(OutlinedInput, {
  shouldForwardProp: (prop) =>
    !["size", "hasStartAdornment", "hasEndAdornment"].includes(prop),
})(({ theme, size = "md", hasStartAdornment, hasEndAdornment }) => {
  const sizeConfig = {
    sm: { padding: "8px 12px" },
    md: { padding: "12px 16px" },
    lg: { padding: "16px 20px" },
  };

  return {
    ...sizeConfig[size],

    ...(hasStartAdornment && {
      paddingLeft: designSystem.spacing[2],
    }),

    ...(hasEndAdornment && {
      paddingRight: designSystem.spacing[2],
    }),
  };
});

// Adornment wrapper for consistent styling
// Enhanced adornment wrapper with size-aware styling and theme support
const AdornmentWrapper = styled(Box, {
  shouldForwardProp: (prop) =>
    !["position", "size", "interactive"].includes(prop),
})(({ theme, position, size = "md", interactive = false }) => {
  const sizeConfig = {
    sm: {
      fontSize: "1em",
      padding: designSystem.spacing[0.5],
      minWidth: "24px",
      minHeight: "24px",
    },
    md: {
      fontSize: "1.2em",
      padding: designSystem.spacing[1],
      minWidth: "28px",
      minHeight: "28px",
    },
    lg: {
      fontSize: "1.4em",
      padding: designSystem.spacing[1.5],
      minWidth: "32px",
      minHeight: "32px",
    },
  };

  const currentSize = sizeConfig[size];

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.text.secondary,
    minWidth: currentSize.minWidth,
    minHeight: currentSize.minHeight,
    borderRadius: designSystem.borders.radius.sm,
    transition: designSystem.transitions.combinations.fast,

    "& > svg": {
      fontSize: currentSize.fontSize,
      transition: "inherit",
    },

    "& > .MuiIconButton-root": {
      padding: currentSize.padding,

      "& svg": {
        fontSize: currentSize.fontSize,
      },
    },

    ...(position === "start" && {
      marginRight: designSystem.spacing[1],
    }),

    ...(position === "end" && {
      marginLeft: designSystem.spacing[1],
    }),

    // Interactive adornments (like buttons)
    ...(interactive && {
      cursor: "pointer",

      "&:hover": {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.text.primary,
      },

      "&:focus-visible": {
        outline: `${designSystem.accessibility.focusRing.width} ${designSystem.accessibility.focusRing.style} ${theme.palette.primary.main}`,
        outlineOffset: designSystem.accessibility.focusRing.offset,
        backgroundColor: theme.palette.action.focus,
      },
    }),

    // Theme-aware color adjustments
    ...(theme.palette.mode === "dark" && {
      color: theme.palette.text.primary,

      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
    }),
  };
});

// File input styling
const StyledFileInput = styled(Box)(({ theme, isDragActive, hasError }) => ({
  border: `2px dashed ${
    hasError
      ? theme.palette.error.main
      : isDragActive
      ? theme.palette.primary.main
      : theme.palette.divider
  }`,
  borderRadius: designSystem.borders.radius.lg,
  padding: designSystem.spacing.semantic.form.padding.lg,
  textAlign: "center",
  cursor: "pointer",
  transition: designSystem.transitions.combinations.normal,
  backgroundColor: isDragActive ? theme.palette.action.hover : "transparent",

  "&:hover": {
    borderColor: hasError
      ? theme.palette.error.main
      : theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },

  "& input": {
    display: "none",
  },
}));

// Validation icon component
const ValidationIcon = ({ hasError, hasSuccess, size = "md" }) => {
  const iconSizes = {
    sm: "16px",
    md: "18px",
    lg: "20px",
  };

  if (hasError) {
    return (
      <ErrorIcon
        sx={{
          color: "error.main",
          fontSize: iconSizes[size],
        }}
      />
    );
  }

  if (hasSuccess) {
    return (
      <SuccessIcon
        sx={{
          color: "success.main",
          fontSize: iconSizes[size],
        }}
      />
    );
  }

  return null;
};

// Main UnifiedFormField Component
const UnifiedFormField = forwardRef(
  (
    {
      type = "text",
      name,
      label,
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      required = false,
      disabled = false,
      error,
      success,
      helperText,
      size = "md",
      variant = "outlined",
      fullWidth = true,
      multiline = false,
      rows = 4,
      maxRows,
      options = [],
      startAdornment,
      endAdornment,
      showValidationIcon = true,
      // Additional customization props
      inputProps: customInputProps = {},
      InputProps: customMuiInputProps = {},
      FormHelperTextProps = {},
      // Styling customization
      sx = {},
      // Advanced props
      autoComplete,
      autoFocus = false,
      className,
      style,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const fieldId = useId();
    const helperTextId = useId();
    const errorId = useId();

    const hasError = Boolean(error);
    const hasSuccess = Boolean(success) && !hasError;
    const hasHelperText = Boolean(helperText) || hasError || hasSuccess;

    // Enhanced accessibility attributes with comprehensive screen reader support
    const getAriaDescribedBy = () => {
      const descriptions = [];

      if (ariaDescribedBy) descriptions.push(ariaDescribedBy);
      if (hasHelperText) descriptions.push(helperTextId);
      if (hasError) descriptions.push(errorId);

      return descriptions.length > 0 ? descriptions.join(" ") : undefined;
    };

    const getAriaLabel = () => {
      if (ariaLabel) return ariaLabel;
      if (label) return undefined; // Use label instead
      return `${type} input field`;
    };

    // Screen reader announcements for validation states
    const getAriaLive = () => {
      if (hasError) return "assertive";
      if (hasSuccess) return "polite";
      return "off";
    };

    // Enhanced keyboard navigation support
    const handleKeyDown = (event) => {
      // Handle escape key to clear field (if not required)
      if (event.key === "Escape" && !required && value) {
        if (onChange) {
          onChange({
            target: {
              name,
              value: type === "checkbox" || type === "switch" ? false : "",
            },
          });
        }
      }

      // Handle Enter key for select fields to open dropdown
      if (type === "select" && event.key === "Enter") {
        event.preventDefault();
        event.target.click();
      }

      // Handle space key for checkbox and switch
      if ((type === "checkbox" || type === "switch") && event.key === " ") {
        event.preventDefault();
        if (onChange) {
          onChange({
            target: {
              name,
              value: !value,
            },
          });
        }
      }

      // Handle arrow keys for radio groups
      if (
        type === "radio" &&
        (event.key === "ArrowUp" || event.key === "ArrowDown")
      ) {
        event.preventDefault();
        const currentIndex = options.findIndex(
          (option) => option.value === value
        );
        let nextIndex;

        if (event.key === "ArrowUp") {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        } else {
          nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        }

        if (onChange && options[nextIndex]) {
          onChange({
            target: {
              name,
              value: options[nextIndex].value,
            },
          });
        }
      }
    };

    // Common input props with enhanced accessibility
    const commonInputProps = {
      id: fieldId,
      name,
      value: value ?? "",
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      onKeyDown: handleKeyDown,
      required,
      disabled,
      error: hasError,
      size,
      fullWidth,
      placeholder,
      autoComplete,
      autoFocus,
      "aria-label": getAriaLabel(),
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": getAriaDescribedBy(),
      "aria-invalid": hasError,
      "aria-required": required,
      "aria-live": getAriaLive(),
      role: type === "search" ? "searchbox" : undefined,
      ref,
      ...props,
    };

    // Password visibility toggle
    const handleTogglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    // File input handlers
    const handleFileChange = (event) => {
      const files = Array.from(event.target.files || []);
      setSelectedFiles(files);
      if (onChange) {
        onChange({
          target: {
            name,
            value: files,
            files,
          },
        });
      }
    };

    const handleFileDrop = (event) => {
      event.preventDefault();
      setIsDragActive(false);
      const files = Array.from(event.dataTransfer.files);
      setSelectedFiles(files);
      if (onChange) {
        onChange({
          target: {
            name,
            value: files,
            files,
          },
        });
      }
    };

    const handleDragOver = (event) => {
      event.preventDefault();
      setIsDragActive(true);
    };

    const handleDragLeave = () => {
      setIsDragActive(false);
    };

    const removeFile = (index) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);
      if (onChange) {
        onChange({
          target: {
            name,
            value: newFiles,
            files: newFiles,
          },
        });
      }
    };

    // Render different input types
    const renderInput = () => {
      switch (type) {
        case "textarea":
          const textareaPadding = {
            sm: "8px 12px",
            md: "12px 16px",
            lg: "16px 20px",
          };

          return (
            <Box sx={{ position: "relative" }}>
              <TextareaAutosize
                {...commonInputProps}
                minRows={rows}
                maxRows={maxRows}
                style={{
                  width: "100%",
                  padding: textareaPadding[size],
                  border: `${designSystem.borders.width[1]} solid`,
                  borderColor: hasError
                    ? "#d32f2f"
                    : hasSuccess
                    ? "#2e7d32"
                    : "#e0e0e0",
                  borderRadius: designSystem.borders.radius.lg,
                  fontSize:
                    designSystem.typography.fontSizes[
                      size === "sm" ? "sm" : size === "lg" ? "lg" : "base"
                    ],
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                  transition: designSystem.transitions.combinations.normal,
                  backgroundColor: "transparent",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = hasError
                    ? "#d32f2f"
                    : hasSuccess
                    ? "#2e7d32"
                    : "#1976d2";
                  e.target.style.borderWidth = designSystem.borders.width[2];
                  if (onFocus) onFocus(e);
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = hasError
                    ? "#d32f2f"
                    : hasSuccess
                    ? "#2e7d32"
                    : "#e0e0e0";
                  e.target.style.borderWidth = designSystem.borders.width[1];
                  if (onBlur) onBlur(e);
                }}
              />
              {showValidationIcon && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    pointerEvents: "none",
                  }}
                >
                  <ValidationIcon
                    hasError={hasError}
                    hasSuccess={hasSuccess}
                    size={size}
                  />
                </Box>
              )}
            </Box>
          );

        case "select":
          return (
            <>
              <InputLabel id={`${fieldId}-label`} required={required}>
                {label}
              </InputLabel>
              <Select
                {...commonInputProps}
                labelId={`${fieldId}-label`}
                label={label}
                startAdornment={
                  startAdornment && (
                    <AdornmentWrapper position="start" size={size}>
                      {startAdornment}
                    </AdornmentWrapper>
                  )
                }
                endAdornment={
                  (endAdornment || showValidationIcon) && (
                    <AdornmentWrapper position="end" size={size}>
                      {endAdornment}
                      {showValidationIcon && (
                        <ValidationIcon
                          hasError={hasError}
                          hasSuccess={hasSuccess}
                          size={size}
                        />
                      )}
                    </AdornmentWrapper>
                  )
                }
              >
                {options.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </>
          );

        case "checkbox":
          return (
            <FormControlLabel
              control={
                <Checkbox
                  {...commonInputProps}
                  checked={Boolean(value)}
                  color={
                    hasError ? "error" : hasSuccess ? "success" : "primary"
                  }
                  inputProps={{
                    "aria-describedby": getAriaDescribedBy(),
                    "aria-invalid": hasError,
                    "aria-required": required,
                  }}
                />
              }
              label={label}
              disabled={disabled}
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize:
                    designSystem.typography.fontSizes[
                      size === "sm" ? "sm" : size === "lg" ? "lg" : "base"
                    ],
                  fontWeight: designSystem.typography.fontWeights.normal,
                },
                alignItems: "flex-start",
                mt: 0.5,
              }}
            />
          );

        case "radio":
          return (
            <>
              <FormLabel
                component="legend"
                required={required}
                id={`${fieldId}-label`}
                sx={{
                  fontSize:
                    designSystem.typography.fontSizes[
                      size === "sm" ? "sm" : size === "lg" ? "lg" : "base"
                    ],
                  fontWeight: designSystem.typography.fontWeights.medium,
                }}
              >
                {label}
              </FormLabel>
              <RadioGroup
                {...commonInputProps}
                row={props.row}
                aria-labelledby={`${fieldId}-label`}
                role="radiogroup"
                aria-required={required}
                aria-invalid={hasError}
                sx={{
                  mt: 1,
                  gap: designSystem.spacing[1],
                }}
              >
                {options.map((option, index) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={
                      <Radio
                        color={
                          hasError
                            ? "error"
                            : hasSuccess
                            ? "success"
                            : "primary"
                        }
                        inputProps={{
                          "aria-describedby": getAriaDescribedBy(),
                          "aria-posinset": index + 1,
                          "aria-setsize": options.length,
                        }}
                      />
                    }
                    label={option.label}
                    disabled={disabled || option.disabled}
                    sx={{
                      "& .MuiFormControlLabel-label": {
                        fontSize:
                          designSystem.typography.fontSizes[
                            size === "sm" ? "sm" : size === "lg" ? "lg" : "base"
                          ],
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </>
          );

        case "switch":
          return (
            <FormControlLabel
              control={
                <Switch
                  {...commonInputProps}
                  checked={Boolean(value)}
                  color={
                    hasError ? "error" : hasSuccess ? "success" : "primary"
                  }
                  inputProps={{
                    "aria-describedby": getAriaDescribedBy(),
                    "aria-invalid": hasError,
                    "aria-required": required,
                    role: "switch",
                  }}
                />
              }
              label={label}
              disabled={disabled}
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize:
                    designSystem.typography.fontSizes[
                      size === "sm" ? "sm" : size === "lg" ? "lg" : "base"
                    ],
                  fontWeight: designSystem.typography.fontWeights.normal,
                },
                alignItems: "center",
                mt: 0.5,
              }}
            />
          );

        case "file":
          return (
            <Box>
              <StyledFileInput
                isDragActive={isDragActive}
                hasError={hasError}
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById(fieldId).click()}
              >
                <input
                  {...commonInputProps}
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <CloudUpload
                  sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                />
                <Typography variant="body1" color="text.primary">
                  {isDragActive
                    ? "Drop files here"
                    : "Click to upload or drag and drop"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {placeholder || "Select files to upload"}
                </Typography>
              </StyledFileInput>

              {selectedFiles.length > 0 && (
                <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {selectedFiles.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => removeFile(index)}
                      deleteIcon={<Clear />}
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}
            </Box>
          );

        case "password":
          return (
            <StyledInput
              {...commonInputProps}
              type={showPassword ? "text" : "password"}
              size={size}
              hasStartAdornment={Boolean(startAdornment)}
              hasEndAdornment={true}
              startAdornment={
                startAdornment && (
                  <AdornmentWrapper position="start" size={size}>
                    {startAdornment}
                  </AdornmentWrapper>
                )
              }
              endAdornment={
                <AdornmentWrapper position="end" size={size} interactive>
                  <IconButton
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                  {showValidationIcon && (
                    <ValidationIcon
                      hasError={hasError}
                      hasSuccess={hasSuccess}
                      size={size}
                    />
                  )}
                </AdornmentWrapper>
              }
            />
          );

        case "date":
        case "time":
        case "datetime-local":
          return (
            <StyledInput
              {...commonInputProps}
              type={type}
              size={size}
              hasStartAdornment={Boolean(startAdornment)}
              hasEndAdornment={Boolean(endAdornment) || showValidationIcon}
              startAdornment={
                startAdornment && (
                  <AdornmentWrapper position="start" size={size}>
                    {startAdornment}
                  </AdornmentWrapper>
                )
              }
              endAdornment={
                (endAdornment || showValidationIcon) && (
                  <AdornmentWrapper position="end" size={size}>
                    {endAdornment}
                    {showValidationIcon && (
                      <ValidationIcon
                        hasError={hasError}
                        hasSuccess={hasSuccess}
                        size={size}
                      />
                    )}
                  </AdornmentWrapper>
                )
              }
              inputProps={{
                ...commonInputProps.inputProps,
                // Ensure proper date/time input styling
                style: {
                  colorScheme: "light dark",
                },
              }}
            />
          );

        case "number":
          return (
            <StyledInput
              {...commonInputProps}
              type="number"
              size={size}
              hasStartAdornment={Boolean(startAdornment)}
              hasEndAdornment={Boolean(endAdornment) || showValidationIcon}
              startAdornment={
                startAdornment && (
                  <AdornmentWrapper position="start" size={size}>
                    {startAdornment}
                  </AdornmentWrapper>
                )
              }
              endAdornment={
                (endAdornment || showValidationIcon) && (
                  <AdornmentWrapper position="end" size={size}>
                    {endAdornment}
                    {showValidationIcon && (
                      <ValidationIcon
                        hasError={hasError}
                        hasSuccess={hasSuccess}
                        size={size}
                      />
                    )}
                  </AdornmentWrapper>
                )
              }
              inputProps={{
                ...commonInputProps.inputProps,
                min: props.min,
                max: props.max,
                step: props.step,
              }}
            />
          );

        case "email":
        case "tel":
        case "url":
        case "search":
        case "text":
        default:
          return (
            <StyledInput
              {...commonInputProps}
              type={type}
              multiline={multiline}
              rows={multiline ? rows : undefined}
              maxRows={multiline ? maxRows : undefined}
              size={size}
              hasStartAdornment={Boolean(startAdornment)}
              hasEndAdornment={Boolean(endAdornment) || showValidationIcon}
              startAdornment={
                startAdornment && (
                  <AdornmentWrapper position="start" size={size}>
                    {startAdornment}
                  </AdornmentWrapper>
                )
              }
              endAdornment={
                (endAdornment || showValidationIcon) && (
                  <AdornmentWrapper position="end" size={size}>
                    {endAdornment}
                    {showValidationIcon && (
                      <ValidationIcon
                        hasError={hasError}
                        hasSuccess={hasSuccess}
                        size={size}
                      />
                    )}
                  </AdornmentWrapper>
                )
              }
            />
          );
      }
    };

    return (
      <StyledFormField
        size={size}
        variant={variant}
        hasError={hasError}
        hasSuccess={hasSuccess}
        fullWidth={fullWidth}
        className={className}
        style={style}
        sx={sx}
        error={hasError}
        required={required}
        disabled={disabled}
      >
        {/* Label for non-checkbox/radio/switch types */}
        {label && !["checkbox", "radio", "switch"].includes(type) && (
          <FormLabel htmlFor={fieldId} required={required}>
            {label}
          </FormLabel>
        )}

        {renderInput()}

        {/* Helper text and error messages with screen reader support */}
        {hasHelperText && (
          <FormHelperText
            id={helperTextId}
            error={hasError}
            aria-live={getAriaLive()}
            role={hasError ? "alert" : hasSuccess ? "status" : undefined}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              ...FormHelperTextProps.sx,
            }}
            {...FormHelperTextProps}
          >
            {hasError && error
              ? error
              : hasSuccess && success
              ? success
              : helperText}
          </FormHelperText>
        )}

        {/* Hidden error announcement for screen readers */}
        {hasError && (
          <Box
            id={errorId}
            sx={{
              position: "absolute",
              left: "-10000px",
              width: "1px",
              height: "1px",
              overflow: "hidden",
            }}
            aria-live="assertive"
            role="alert"
          >
            {`Error in ${label || name}: ${error}`}
          </Box>
        )}
      </StyledFormField>
    );
  }
);

UnifiedFormField.displayName = "UnifiedFormField";

// PropTypes
UnifiedFormField.propTypes = {
  type: PropTypes.oneOf([
    "text",
    "email",
    "password",
    "number",
    "tel",
    "url",
    "search",
    "select",
    "textarea",
    "checkbox",
    "radio",
    "switch",
    "file",
    "date",
    "time",
    "datetime-local",
  ]),
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  success: PropTypes.string,
  helperText: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  variant: PropTypes.oneOf(["outlined", "filled", "standard"]),
  fullWidth: PropTypes.bool,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  maxRows: PropTypes.number,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
      disabled: PropTypes.bool,
    })
  ),
  startAdornment: PropTypes.node,
  endAdornment: PropTypes.node,
  showValidationIcon: PropTypes.bool,
  // Additional customization props
  inputProps: PropTypes.object,
  InputProps: PropTypes.object,
  FormHelperTextProps: PropTypes.object,
  sx: PropTypes.object,
  // Standard props
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  "aria-label": PropTypes.string,
  "aria-labelledby": PropTypes.string,
  "aria-describedby": PropTypes.string,
};

export default UnifiedFormField;
