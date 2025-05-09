// src/components/ui/DataTable.jsx
import React from 'react';
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
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  overflow: 'hidden',
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.grey[50],
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
  sx = {} 
}) {
  // For client-side pagination when totalCount is not provided
  const displayedRows = pagination && !totalCount 
    ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) 
    : rows;
  
  const count = totalCount || rows.length;
  
  return (
    <Box sx={{ width: '100%', ...sx }}>
      <StyledTableContainer component={Paper}>
        <Table stickyHeader aria-label="data table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCell
                  key={column.id}
                  align={column.align || 'left'}
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
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : displayedRows.length > 0 ? (
              displayedRows.map((row, index) => (
                <TableRow hover tabIndex={-1} key={row.id || index}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align || 'left'}>
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
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