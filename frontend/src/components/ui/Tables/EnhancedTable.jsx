import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography,
  Skeleton,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { designSystem } from "../DesignSystem";
import EnhancedCard from "../Cards/EnhancedCard";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(designSystem.borderRadius.lg / 8),
  border: `1px solid ${theme.palette.divider}`,
  overflow: "hidden",
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.grey[50],
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(designSystem.spacing.md / 8),
  color: theme.palette.text.primary,
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",

  "&.MuiTableCell-head": {
    fontWeight: designSystem.typography.fontWeights.semibold,
    color: theme.palette.text.primary,
    fontSize: designSystem.typography.fontSizes.sm,
    textTransform: "uppercase",
    letterSpacing: "0.025em",
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[50],
  },

  "&.MuiTableCell-body": {
    fontSize: designSystem.typography.fontSizes.base,
    backgroundColor: theme.palette.background.paper,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: designSystem.transitions.normal,

  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },

  "&:last-child td": {
    borderBottom: 0,
  },
}));

/**
 * Enhanced table with consistent styling and features
 */
const EnhancedTable = ({
  columns = [],
  rows = [],
  loading = false,
  pagination = false,
  page = 0,
  rowsPerPage = 10,
  totalRows = 0,
  onPageChange,
  onRowsPerPageChange,
  emptyMessage = "No data available",
  title,
  actions,
  ...props
}) => {
  const renderCell = (row, column) => {
    const value = row[column.field];

    if (column.renderCell) {
      return column.renderCell(row, value);
    }

    if (column.type === "status") {
      return (
        <Chip
          label={value}
          size="small"
          color={
            column.getStatusColor ? column.getStatusColor(value) : "default"
          }
          variant="outlined"
        />
      );
    }

    if (column.type === "date") {
      return new Date(value).toLocaleDateString();
    }

    return value;
  };

  const renderLoadingSkeleton = () =>
    Array.from({ length: rowsPerPage }).map((_, index) => (
      <StyledTableRow key={index}>
        {columns.map((column, colIndex) => (
          <StyledTableCell key={colIndex}>
            <Skeleton variant="text" width="80%" />
          </StyledTableCell>
        ))}
      </StyledTableRow>
    ));

  const renderEmptyState = () => (
    <StyledTableRow>
      <StyledTableCell colSpan={columns.length} align="center">
        <Box sx={{ py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Box>
      </StyledTableCell>
    </StyledTableRow>
  );

  return (
    <EnhancedCard variant="flat" sx={{ overflow: "hidden" }}>
      {(title || actions) && (
        <Box
          sx={{
            p: 3,
            pb: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {title && (
            <Typography variant="h6" component="h2" fontWeight="semibold">
              {title}
            </Typography>
          )}
          {actions && <Box sx={{ display: "flex", gap: 1 }}>{actions}</Box>}
        </Box>
      )}

      <StyledTableContainer
        component={Paper}
        elevation={0}
        sx={{
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <Table {...props}>
          <StyledTableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCell
                  key={column.field}
                  align={column.align || "left"}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.headerName}
                </StyledTableCell>
              ))}
            </TableRow>
          </StyledTableHead>

          <TableBody>
            {loading
              ? renderLoadingSkeleton()
              : rows.length === 0
              ? renderEmptyState()
              : rows.map((row, index) => (
                  <StyledTableRow key={row.id || index}>
                    {columns.map((column) => (
                      <StyledTableCell
                        key={column.field}
                        align={column.align || "left"}
                      >
                        {renderCell(row, column)}
                      </StyledTableCell>
                    ))}
                  </StyledTableRow>
                ))}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {pagination && (
        <TablePagination
          component="div"
          count={totalRows}
          page={page}
          onPageChange={onPageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: `1px solid ${(theme) => theme.palette.divider}`,
            "& .MuiTablePagination-toolbar": {
              px: 3,
            },
          }}
        />
      )}
    </EnhancedCard>
  );
};

export default EnhancedTable;
