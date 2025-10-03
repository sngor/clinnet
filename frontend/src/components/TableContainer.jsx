// src/components/TableContainer.jsx
import React from "react";
import {
  Box,
  Typography,
  Paper,
  TableContainer as MuiTableContainer, // Import MUI's TableContainer
} from "@mui/material";

/**
 * A consistent container for tables throughout the application
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Table content
 * @param {string} props.title - Table title
 * @param {React.ReactNode} props.action - Action button or component
 * @param {Object} props.sx - Additional styles to apply
 */
function TableContainer({ children, title, action, sx = {} }) {
  return (
    <Box sx={{ width: "100%", ...sx }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6" color="primary.main" fontWeight={600}>
          {title}
        </Typography>
        {action}
      </Box>

      <MuiTableContainer
        component={Paper}
        sx={{
          boxShadow: "none",
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        {children}
      </MuiTableContainer>
    </Box>
  );
}

export default TableContainer;
