import React from "react";
import { TextField, InputAdornment, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: theme.spacing(1.5),
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor: theme.palette.background.paper,

    "& fieldset": {
      borderColor: theme.palette.divider,
      borderWidth: "1px",
    },

    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
    },

    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: "2px",
      boxShadow: `0 0 0 3px ${theme.palette.primary.main}20`,
    },

    "&.Mui-error fieldset": {
      borderColor: theme.palette.error.main,
    },

    "&.Mui-error:hover fieldset": {
      borderColor: theme.palette.error.main,
    },

    "&.Mui-error.Mui-focused fieldset": {
      borderColor: theme.palette.error.main,
      boxShadow: `0 0 0 3px ${theme.palette.error.main}20`,
    },
  },

  "& .MuiInputLabel-root": {
    fontWeight: theme.typography.fontWeightMedium,

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
    fontSize: "0.75rem",

    "&.Mui-error": {
      color: theme.palette.error.main,
    },
  },
}));

const StyledFieldContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

/**
 * Enhanced text field with consistent styling
 */
const EnhancedTextField = ({
  label,
  helperText,
  error = false,
  required = false,
  startIcon,
  endIcon,
  description,
  containerProps = {},
  ...props
}) => {
  return (
    <StyledFieldContainer {...containerProps}>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, display: "block" }}
        >
          {description}
        </Typography>
      )}

      <StyledTextField
        label={label}
        helperText={helperText}
        error={error}
        required={required}
        fullWidth
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
        }}
        {...props}
      />
    </StyledFieldContainer>
  );
};

export default EnhancedTextField;
