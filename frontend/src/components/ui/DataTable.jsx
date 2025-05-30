// src/components/ui/DataTable.jsx
// Consistent data table for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Uses semantic <table> structure
// - Keyboard and screen reader accessible
// - Supports loading and empty states
// - Mobile responsive with horizontal scrolling
//
// Usage Example:
// import { DataTable } from '../components/ui';
// <DataTable columns={columns} rows={rows} loading={loading} />
//
// For fully responsive tables with mobile card layout, use ResponsiveTable instead

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LoadingIndicator from "./LoadingIndicator";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: "0 10px 30px rgba(67, 97, 238, 0.05)",
  overflow: "hidden",
  border: "1px solid rgba(231, 236, 248, 0.8)",
  transition: "all 0.3s ease",
  // Enhanced mobile support with better scrolling
  [theme.breakpoints.down("sm")]: {
    "-webkit-overflow-scrolling": "touch",
    borderRadius: theme.shape.borderRadius - 4,
    boxShadow: "0 6px 16px rgba(67, 97, 238, 0.03)",
    "&::-webkit-scrollbar": {
      height: 6,
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      borderRadius: 10,
    },
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: "rgba(67, 97, 238, 0.03)",
  color: theme.palette.primary.main,
  fontSize: "0.875rem",
  letterSpacing: "0.01em",
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: "16px 20px",
  // Responsive styling for mobile
  [theme.breakpoints.down("sm")]: {
    padding: "12px 16px",
    fontSize: "0.8125rem",
    "&:first-of-type": {
      position: "sticky",
      left: 0,
      backgroundColor: "rgba(67, 97, 238, 0.05)",
      zIndex: 2,
      boxShadow: "2px 0 4px rgba(0, 0, 0, 0.05)",
    },
  },
}));

/**
 * A consistent data table component for displaying tabular data
 *
 * @param {Object} props - Component props
 * @param {Array} props.columns - Array of column definitions with { id, label, align, format, minWidth }
 * @param {Array} props.rows - Array of data rows
 * @param {boolean} [props.loading=false] - Whether the data is loading
 * @param {boolean} [props.pagination=true] - Whether to show pagination
 * @param {number} [props.page=0] - Current page index
 * @param {number} [props.rowsPerPage=10] - Number of rows per page
 * @param {Function} [props.onPageChange] - Callback for page change
 * @param {Function} [props.onRowsPerPageChange] - Callback for rows per page change
 * @param {number} [props.totalCount] - Total number of rows (for server-side pagination)
 * @param {boolean} [props.stickyFirstColumn=false] - Whether to make the first column sticky for horizontal scrolling
 * @param {Object} [props.sx] - Additional styles to apply
 */
function DataTable({
  columns,
  rows,
  loading = false,
  pagination = true,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  totalCount,
  stickyFirstColumn = false,
  sx = {},
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // For client-side pagination when totalCount is not provided
  const displayedRows =
    pagination && !totalCount
      ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : rows;

  const count = totalCount || rows.length;

  return (
    <Box sx={{ width: "100%", ...sx }}>
      <StyledTableContainer component={Paper}>
        <Table stickyHeader aria-label="data table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCell
                  key={column.id}
                  align={column.align || "left"}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 8 }}
                >
                  <LoadingIndicator size="medium" message="Loading data..." />
                </TableCell>
              </TableRow>
            ) : displayedRows.length > 0 ? (
              displayedRows.map((row, index) => (
                <TableRow hover tabIndex={-1} key={row.id || index}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align || "left"}>
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 6 }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No data available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={count}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </Box>
  );
}

export default DataTable;
