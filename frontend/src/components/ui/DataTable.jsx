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
import { designSystem } from "./DesignSystem";
import LoadingIndicator from "./LoadingIndicator";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(designSystem.borderRadius.lg / 8),
  boxShadow: designSystem.shadows.md,
  overflow: "hidden",
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  transition: designSystem.transitions.normal,
  // Enhanced mobile support with better scrolling
  [theme.breakpoints.down("sm")]: {
    "-webkit-overflow-scrolling": "touch",
    borderRadius: theme.spacing(designSystem.borderRadius.md / 8),
    boxShadow: designSystem.shadows.sm,
    "&::-webkit-scrollbar": {
      height: 6,
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.primary.light,
      borderRadius: 10,
    },
  },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: designSystem.typography.fontWeights.semibold,
  backgroundColor:
    theme.palette.mode === "dark"
      ? `rgba(79, 70, 229, 0.08)`
      : `rgba(79, 70, 229, 0.03)`,
  color: theme.palette.primary.main,
  fontSize: designSystem.typography.fontSizes.sm,
  letterSpacing: "0.025em",
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2, 2.5),
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  // Responsive styling for mobile
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5, 2),
    fontSize: designSystem.typography.fontSizes.xs,
    "&:first-of-type": {
      position: "sticky",
      left: 0,
      backgroundColor:
        theme.palette.mode === "dark"
          ? `rgba(79, 70, 229, 0.12)`
          : `rgba(79, 70, 229, 0.05)`,
      zIndex: 2,
      boxShadow:
        theme.palette.mode === "dark"
          ? "2px 0 4px rgba(0, 0, 0, 0.3)"
          : "2px 0 4px rgba(0, 0, 0, 0.05)",
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
                <TableRow
                  hover
                  tabIndex={-1}
                  key={row.id || index}
                  sx={{
                    backgroundColor: (theme) => theme.palette.background.paper,
                    "&:hover": {
                      backgroundColor: (theme) => theme.palette.action.hover,
                    },
                  }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell
                        key={column.id}
                        align={column.align || "left"}
                        sx={{
                          color: (theme) => theme.palette.text.primary,
                          fontFamily:
                            "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
                          fontSize: designSystem.typography.fontSizes.base,
                        }}
                      >
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
