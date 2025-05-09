// src/components/ui/TableStyles.jsx
import React from 'react';
import { Paper, TableContainer, Table } from '@mui/material';

/**
 * A consistent table wrapper with standardized styling
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The table content
 * @param {Object} [props.sx] - Additional styles to apply to the Paper component
 * @param {Object} [props.tableSx] - Additional styles to apply to the Table component
 */
export const StyledTableContainer = ({ children, sx = {}, tableSx = {} }) => (
  <Paper 
    elevation={0} 
    sx={{ 
      borderRadius: 2,
      overflow: 'hidden',
      border: '1px solid',
      borderColor: 'divider',
      ...sx
    }}
  >
    <TableContainer sx={{ boxShadow: "none" }}>
      <Table
        sx={{
          minWidth: 650,
          "& .MuiTableCell-root": {
            borderBottom: "none",
            padding: "16px",
          },
          "& tbody tr": {
            borderBottom: "1px solid rgba(224, 224, 224, 0.4)",
          },
          "& tbody tr:last-child": {
            border: 0,
          },
          borderCollapse: "separate",
          borderSpacing: 0,
          "& thead tr th:first-of-type": {
            borderRadius: "8px 0 0 8px",
          },
          "& thead tr th:last-of-type": {
            borderRadius: "0 8px 8px 0",
          },
          ...tableSx
        }}
      >
        {children}
      </Table>
    </TableContainer>
  </Paper>
);

/**
 * Standard styles for table headers
 */
export const tableHeaderStyle = {
  backgroundColor: "#f5f5f5"
};

/**
 * Standard styles for action buttons container
 */
export const actionButtonsStyle = {
  display: "flex",
  gap: 1
};