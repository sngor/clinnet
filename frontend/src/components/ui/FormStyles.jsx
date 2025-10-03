// src/components/ui/FormStyles.jsx
import { styled } from "@mui/material/styles";
import { Box, TextField, FormControl } from "@mui/material";

// Consistent styling for form containers
export const FormContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(3),
}));

// Consistent styling for form sections
export const FormSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
}));

// Consistent styling for form fields
export const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "& .MuiInputBase-root": {
    borderRadius: theme.shape.borderRadius,
  },
}));

// Consistent styling for form controls
export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: "100%",
}));

// Form grid layout with consistent spacing
export const formGridProps = {
  container: true,
  spacing: 2,
  alignItems: "flex-start",
};

// Common form field props for consistency
export const commonFieldProps = {
  fullWidth: true,
  variant: "outlined",
  size: "medium",
  margin: "normal",
};

// Export default object for easier imports
export default {
  FormContainer,
  FormSection,
  StyledTextField,
  StyledFormControl,
  formGridProps,
  commonFieldProps,
};
