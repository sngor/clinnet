/**
 * UnifiedTable Component
 * A comprehensive, reusable table system with generic TypeScript support
 *
 * Features:
 * - Generic data type support with TypeScript
 * - Configurable column definitions with custom renderers
 * - Consistent header styling with proper typography hierarchy
 * - Sorting functionality with visual indicators
 * - Row selection with bulk actions support
 * - Responsive behavior with mobile card fallback
 * - Pagination controls with accessibility
 * - Empty states and loading states with skeleton placeholders
 * - Full accessibility support with ARIA attributes
 * - Theme-aware styling for light/dark modes
 *
 * Replaces: DataTable, EnhancedTable, ResponsiveTable, PatientTable, AppointmentTable, and all table variations
 */

import React, { forwardRef, useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Checkbox,
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery,
  Chip,
  Card,
  CardContent,
  Stack,
  Divider,
} from "@mui/material";
import {
  ArrowUpward as SortAscIcon,
  ArrowDownward as SortDescIcon,
  UnfoldMore as SortIcon,
} from "@mui/icons-material";
import { designSystem } from "../../design-system/tokens/index.js";

// Styled components using design tokens
const StyledTableContainer = styled(TableContainer, {
  shouldForwardProp: (prop) =>
    !["responsive", "mobileBreakpoint"].includes(prop),
})(({ theme, responsive = true, mobileBreakpoint = 768 }) => ({
  borderRadius: designSystem.borders.radius.lg,
  border: `${designSystem.borders.width[1]} solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  boxShadow:
    designSystem.shadows.semantic.card?.default ||
    designSystem.shadows.light.sm,
  overflow: "hidden",
  transition: designSystem.transitions.combinations.normal,

  // Enhanced scrolling for mobile
  ...(responsive && {
    [`@media (max-width: ${mobileBreakpoint}px)`]: {
      borderRadius: designSystem.borders.radius.md,
      "-webkit-overflow-scrolling": "touch",
      "&::-webkit-scrollbar": {
        height: "6px",
      },
      "&::-webkit-scrollbar-thumb": {
        backgroundColor: theme.palette.primary.light,
        borderRadius: designSystem.borders.radius.full,
      },
      "&::-webkit-scrollbar-track": {
        backgroundColor: theme.palette.action.hover,
      },
    },
  }),
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? `rgba(${theme.palette.primary.main
          .replace("#", "")
          .match(/.{2}/g)
          .map((hex) => parseInt(hex, 16))
          .join(", ")}, 0.08)`
      : `rgba(${theme.palette.primary.main
          .replace("#", "")
          .match(/.{2}/g)
          .map((hex) => parseInt(hex, 16))
          .join(", ")}, 0.03)`,
}));

const StyledHeaderCell = styled(TableCell, {
  shouldForwardProp: (prop) => !["sortable", "sortDirection"].includes(prop),
})(({ theme, sortable = false, sortDirection }) => ({
  fontFamily: designSystem.typography.fontFamilies.sans,
  fontSize: designSystem.typography.fontSizes.sm,
  fontWeight: designSystem.typography.fontWeights.semibold,
  color: theme.palette.primary.main,
  letterSpacing: designSystem.typography.letterSpacing.wide,
  textTransform: "uppercase",
  padding: `${
    designSystem.spacing.semantic.table?.header?.padding ||
    designSystem.spacing[3]
  } ${
    designSystem.spacing.semantic.table?.cell?.padding ||
    designSystem.spacing[4]
  }`,
  borderBottom: `${designSystem.borders.width[2]} solid ${theme.palette.divider}`,
  position: "relative",
  userSelect: "none",

  ...(sortable && {
    cursor: "pointer",
    transition: designSystem.transitions.combinations.fast,

    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      color: theme.palette.primary.dark,
    },

    "&:focus-visible": {
      outline: `${designSystem.accessibility.focusRing.width} ${designSystem.accessibility.focusRing.style} ${theme.palette.primary.main}`,
      outlineOffset: designSystem.accessibility.focusRing.offset,
    },
  }),

  // Sort indicator styling
  "& .sort-icon": {
    marginLeft: designSystem.spacing[1],
    fontSize: designSystem.typography.fontSizes.sm,
    opacity: sortDirection ? 1 : 0.5,
    transition: designSystem.transitions.combinations.fast,
  },
}));

const StyledBodyCell = styled(TableCell)(({ theme }) => ({
  fontFamily: designSystem.typography.fontFamilies.sans,
  fontSize: designSystem.typography.fontSizes.base,
  fontWeight: designSystem.typography.fontWeights.normal,
  color: theme.palette.text.primary,
  padding: `${
    designSystem.spacing.semantic.table?.cell?.padding ||
    designSystem.spacing[3]
  } ${
    designSystem.spacing.semantic.table?.cell?.padding ||
    designSystem.spacing[4]
  }`,
  borderBottom: `${designSystem.borders.width[1]} solid ${theme.palette.divider}`,
  lineHeight: designSystem.typography.lineHeights.relaxed,
}));

const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop) => !["selectable", "selected"].includes(prop),
})(({ theme, selectable = false, selected = false }) => ({
  transition: designSystem.transitions.combinations.fast,
  cursor: selectable ? "pointer" : "default",

  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },

  "&:focus-visible": {
    outline: `${designSystem.accessibility.focusRing.width} ${designSystem.accessibility.focusRing.style} ${theme.palette.primary.main}`,
    outlineOffset: `-${designSystem.accessibility.focusRing.width}`,
  },

  ...(selected && {
    backgroundColor:
      theme.palette.mode === "dark"
        ? `rgba(${theme.palette.primary.main
            .replace("#", "")
            .match(/.{2}/g)
            .map((hex) => parseInt(hex, 16))
            .join(", ")}, 0.12)`
        : `rgba(${theme.palette.primary.main
            .replace("#", "")
            .match(/.{2}/g)
            .map((hex) => parseInt(hex, 16))
            .join(", ")}, 0.08)`,

    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? `rgba(${theme.palette.primary.main
              .replace("#", "")
              .match(/.{2}/g)
              .map((hex) => parseInt(hex, 16))
              .join(", ")}, 0.16)`
          : `rgba(${theme.palette.primary.main
              .replace("#", "")
              .match(/.{2}/g)
              .map((hex) => parseInt(hex, 16))
              .join(", ")}, 0.12)`,
    },
  }),
}));

// Empty state component
const EmptyState = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: `${designSystem.spacing[12]} ${designSystem.spacing[6]}`,
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const EmptyStateIcon = styled(Box)(({ theme }) => ({
  width: "64px",
  height: "64px",
  borderRadius: designSystem.borders.radius.full,
  backgroundColor: theme.palette.action.hover,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: designSystem.spacing[4],
  fontSize: "24px",
  color: theme.palette.text.disabled,
}));

// Loading skeleton row component
const SkeletonRow = ({ columns }) => (
  <StyledTableRow>
    {columns.map((column, index) => (
      <StyledBodyCell key={column.key || index}>
        <Skeleton
          variant="text"
          width={column.width === "auto" ? "80%" : column.width || "100%"}
          height={20}
        />
      </StyledBodyCell>
    ))}
  </StyledTableRow>
);

// Mobile card components for responsive behavior
const MobileCard = styled(Card)(({ theme, selected = false }) => ({
  marginBottom: designSystem.spacing[3],
  border: `${designSystem.borders.width[1]} solid ${theme.palette.divider}`,
  borderRadius: designSystem.borders.radius.lg,
  transition: designSystem.transitions.combinations.normal,
  cursor: "pointer",

  "&:hover": {
    boxShadow:
      designSystem.shadows.semantic.card?.hover ||
      designSystem.shadows.light.md,
    borderColor: theme.palette.primary.main,
  },

  "&:focus-visible": {
    outline: `${designSystem.accessibility.focusRing.width} ${designSystem.accessibility.focusRing.style} ${theme.palette.primary.main}`,
    outlineOffset: designSystem.accessibility.focusRing.offset,
  },

  ...(selected && {
    backgroundColor:
      theme.palette.mode === "dark"
        ? `rgba(${theme.palette.primary.main
            .replace("#", "")
            .match(/.{2}/g)
            .map((hex) => parseInt(hex, 16))
            .join(", ")}, 0.08)`
        : `rgba(${theme.palette.primary.main
            .replace("#", "")
            .match(/.{2}/g)
            .map((hex) => parseInt(hex, 16))
            .join(", ")}, 0.04)`,
    borderColor: theme.palette.primary.main,
  }),
}));

const MobileCardContent = styled(CardContent)(() => ({
  padding: designSystem.spacing[4],
  "&:last-child": {
    paddingBottom: designSystem.spacing[4],
  },
}));

const MobileCardField = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: designSystem.spacing[2],

  "&:last-child": {
    marginBottom: 0,
  },
}));

const MobileCardLabel = styled(Typography)(({ theme }) => ({
  fontSize: designSystem.typography.fontSizes.sm,
  fontWeight: designSystem.typography.fontWeights.medium,
  color: theme.palette.text.secondary,
  marginRight: designSystem.spacing[2],
  minWidth: "80px",
  flexShrink: 0,
}));

const MobileCardValue = styled(Box)(({ theme }) => ({
  fontSize: designSystem.typography.fontSizes.base,
  color: theme.palette.text.primary,
  textAlign: "right",
  flex: 1,
  wordBreak: "break-word",
}));

// Mobile skeleton card
const MobileSkeletonCard = ({ columns }) => (
  <MobileCard>
    <MobileCardContent>
      <Stack spacing={2}>
        {columns.slice(0, 4).map((column, index) => (
          <Box
            key={column.key || index}
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Skeleton variant="text" width="30%" height={16} />
            <Skeleton variant="text" width="50%" height={16} />
          </Box>
        ))}
      </Stack>
    </MobileCardContent>
  </MobileCard>
);

// Mobile card list container
const MobileCardList = styled(Box)(() => ({
  padding: designSystem.spacing[2],
}));

// Sort direction enum
const SORT_DIRECTION = {
  ASC: "asc",
  DESC: "desc",
  NONE: null,
};

// Main UnifiedTable Component
const UnifiedTable = forwardRef(
  (
    {
      data = [],
      columns = [],
      loading = false,
      error = null,
      emptyMessage = "No data available",
      emptyIcon = "📄",
      sortable = true,
      selectable = false,
      pagination = true,
      responsive = true,
      mobileBreakpoint = 768,
      initialSort = null,
      onRowClick,
      onSelectionChange,
      onSort,
      // Pagination props
      page = 0,
      rowsPerPage = 10,
      totalCount,
      onPageChange,
      onRowsPerPageChange,
      rowsPerPageOptions = [5, 10, 25, 50],
      // Styling props
      className,
      style,
      sx = {},
      // Accessibility props
      "aria-label": ariaLabel = "Data table",
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(`(max-width:${mobileBreakpoint}px)`);

    // Internal state for sorting
    const [sortConfig, setSortConfig] = useState(
      initialSort || { key: null, direction: SORT_DIRECTION.NONE }
    );

    // Internal state for selection
    const [selectedRows, setSelectedRows] = useState(new Set());

    // Memoized sorted data
    const sortedData = useMemo(() => {
      if (
        !sortable ||
        !sortConfig.key ||
        sortConfig.direction === SORT_DIRECTION.NONE
      ) {
        return data;
      }

      const column = columns.find((col) => col.key === sortConfig.key);
      if (!column) return data;

      return [...data].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle custom sort function
        if (column.sortFn) {
          return sortConfig.direction === SORT_DIRECTION.ASC
            ? column.sortFn(a, b)
            : column.sortFn(b, a);
        }

        // Handle null/undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;

        // Convert to strings for comparison if needed
        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        if (aValue < bValue) {
          return sortConfig.direction === SORT_DIRECTION.ASC ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === SORT_DIRECTION.ASC ? 1 : -1;
        }
        return 0;
      });
    }, [data, sortConfig, columns, sortable]);

    // Paginated data
    const paginatedData = useMemo(() => {
      if (!pagination) return sortedData;

      const startIndex = page * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      return sortedData.slice(startIndex, endIndex);
    }, [sortedData, pagination, page, rowsPerPage]);

    // Handle sort
    const handleSort = useCallback(
      (columnKey) => {
        if (!sortable) return;

        const column = columns.find((col) => col.key === columnKey);
        if (!column || column.sortable === false) return;

        let newDirection = SORT_DIRECTION.ASC;

        if (sortConfig.key === columnKey) {
          if (sortConfig.direction === SORT_DIRECTION.ASC) {
            newDirection = SORT_DIRECTION.DESC;
          } else if (sortConfig.direction === SORT_DIRECTION.DESC) {
            newDirection = SORT_DIRECTION.NONE;
          }
        }

        const newSortConfig = { key: columnKey, direction: newDirection };
        setSortConfig(newSortConfig);

        if (onSort) {
          onSort(newSortConfig);
        }
      },
      [sortable, columns, sortConfig, onSort]
    );

    // Handle row selection
    const handleRowSelect = useCallback(
      (rowId, selected) => {
        if (!selectable) return;

        const newSelectedRows = new Set(selectedRows);
        if (selected) {
          newSelectedRows.add(rowId);
        } else {
          newSelectedRows.delete(rowId);
        }

        setSelectedRows(newSelectedRows);

        if (onSelectionChange) {
          const selectedData = data.filter((row) =>
            newSelectedRows.has(row.id || row)
          );
          onSelectionChange(selectedData, Array.from(newSelectedRows));
        }
      },
      [selectable, selectedRows, onSelectionChange, data]
    );

    // Handle select all
    const handleSelectAll = useCallback(
      (selected) => {
        if (!selectable) return;

        const newSelectedRows = selected
          ? new Set(paginatedData.map((row) => row.id || row))
          : new Set();

        setSelectedRows(newSelectedRows);

        if (onSelectionChange) {
          const selectedData = selected ? [...paginatedData] : [];
          onSelectionChange(selectedData, Array.from(newSelectedRows));
        }
      },
      [selectable, paginatedData, onSelectionChange]
    );

    // Check if all rows are selected
    const isAllSelected =
      selectable &&
      paginatedData.length > 0 &&
      paginatedData.every((row) => selectedRows.has(row.id || row));

    const isIndeterminate =
      selectable && selectedRows.size > 0 && !isAllSelected;

    // Render sort icon
    const renderSortIcon = (columnKey) => {
      if (!sortable) return null;

      const column = columns.find((col) => col.key === columnKey);
      if (!column || column.sortable === false) return null;

      if (sortConfig.key === columnKey) {
        return sortConfig.direction === SORT_DIRECTION.ASC ? (
          <SortAscIcon className="sort-icon" />
        ) : sortConfig.direction === SORT_DIRECTION.DESC ? (
          <SortDescIcon className="sort-icon" />
        ) : (
          <SortIcon className="sort-icon" />
        );
      }

      return <SortIcon className="sort-icon" />;
    };

    // Get row ID for selection
    const getRowId = (row, index) => row.id || row.key || index;

    // Handle keyboard navigation for rows
    const handleRowKeyDown = (event, row, index) => {
      if (onRowClick) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onRowClick(row, index);
        }
      }

      if (selectable) {
        if (event.key === " ") {
          event.preventDefault();
          const rowId = getRowId(row, index);
          handleRowSelect(rowId, !selectedRows.has(rowId));
        }
      }
    };

    // Render mobile card view
    const renderMobileCards = () => (
      <MobileCardList>
        {loading ? (
          // Loading skeleton cards
          Array.from({ length: rowsPerPage }).map((_, index) => (
            <MobileSkeletonCard key={index} columns={columns} />
          ))
        ) : error ? (
          // Error state
          <EmptyState>
            <EmptyStateIcon>⚠️</EmptyStateIcon>
            <Typography variant="h6" gutterBottom>
              Error Loading Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {error}
            </Typography>
          </EmptyState>
        ) : paginatedData.length === 0 ? (
          // Empty state
          <EmptyState>
            <EmptyStateIcon>{emptyIcon}</EmptyStateIcon>
            <Typography variant="h6" gutterBottom>
              {emptyMessage}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are no items to display at this time.
            </Typography>
          </EmptyState>
        ) : (
          // Data cards
          paginatedData.map((row, index) => {
            const rowId = getRowId(row, index);
            const isSelected = selectedRows.has(rowId);

            return (
              <MobileCard
                key={rowId}
                selected={isSelected}
                onClick={() => onRowClick && onRowClick(row, index)}
                onKeyDown={(event) => handleRowKeyDown(event, row, index)}
                tabIndex={onRowClick ? 0 : -1}
                role={onRowClick ? "button" : undefined}
                aria-selected={selectable ? isSelected : undefined}
              >
                <MobileCardContent>
                  {selectable && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mb: 2,
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) =>
                          handleRowSelect(rowId, event.target.checked)
                        }
                        inputProps={{
                          "aria-label": `Select row ${index + 1}`,
                        }}
                      />
                    </Box>
                  )}
                  <Stack spacing={1.5}>
                    {columns
                      .filter((column) => column.responsive !== "hide")
                      .map((column) => {
                        const value = row[column.key];
                        return (
                          <MobileCardField key={column.key}>
                            <MobileCardLabel>{column.header}</MobileCardLabel>
                            <MobileCardValue>
                              {column.render
                                ? column.render(value, row, index)
                                : value}
                            </MobileCardValue>
                          </MobileCardField>
                        );
                      })}
                  </Stack>
                </MobileCardContent>
              </MobileCard>
            );
          })
        )}
      </MobileCardList>
    );

    return (
      <Box
        ref={ref}
        className={className}
        style={style}
        sx={{ width: "100%", ...sx }}
        {...props}
      >
        {responsive && isMobile ? (
          // Mobile card view
          renderMobileCards()
        ) : (
          // Desktop table view
          <StyledTableContainer
            component={Paper}
            responsive={responsive}
            mobileBreakpoint={mobileBreakpoint}
          >
            <Table
              stickyHeader
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              aria-describedby={ariaDescribedBy}
            >
              <StyledTableHead>
                <TableRow>
                  {selectable && (
                    <StyledHeaderCell padding="checkbox">
                      <Checkbox
                        indeterminate={isIndeterminate}
                        checked={isAllSelected}
                        onChange={(event) =>
                          handleSelectAll(event.target.checked)
                        }
                        inputProps={{
                          "aria-label": "Select all rows",
                        }}
                      />
                    </StyledHeaderCell>
                  )}
                  {columns.map((column) => (
                    <StyledHeaderCell
                      key={column.key}
                      align={column.align || "left"}
                      sortable={sortable && column.sortable !== false}
                      sortDirection={
                        sortConfig.key === column.key
                          ? sortConfig.direction
                          : null
                      }
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                      }}
                      onClick={() => handleSort(column.key)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          handleSort(column.key);
                        }
                      }}
                      tabIndex={sortable && column.sortable !== false ? 0 : -1}
                      role={
                        sortable && column.sortable !== false
                          ? "button"
                          : undefined
                      }
                      aria-sort={
                        sortConfig.key === column.key
                          ? sortConfig.direction === SORT_DIRECTION.ASC
                            ? "ascending"
                            : sortConfig.direction === SORT_DIRECTION.DESC
                            ? "descending"
                            : "none"
                          : undefined
                      }
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {column.header}
                        {renderSortIcon(column.key)}
                      </Box>
                    </StyledHeaderCell>
                  ))}
                </TableRow>
              </StyledTableHead>

              <TableBody>
                {loading ? (
                  // Loading skeleton rows
                  Array.from({ length: rowsPerPage }).map((_, index) => (
                    <SkeletonRow key={index} columns={columns} />
                  ))
                ) : error ? (
                  // Error state
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (selectable ? 1 : 0)}
                      align="center"
                    >
                      <EmptyState>
                        <EmptyStateIcon>⚠️</EmptyStateIcon>
                        <Typography variant="h6" gutterBottom>
                          Error Loading Data
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {error}
                        </Typography>
                      </EmptyState>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (selectable ? 1 : 0)}
                      align="center"
                    >
                      <EmptyState>
                        <EmptyStateIcon>{emptyIcon}</EmptyStateIcon>
                        <Typography variant="h6" gutterBottom>
                          {emptyMessage}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          There are no items to display at this time.
                        </Typography>
                      </EmptyState>
                    </TableCell>
                  </TableRow>
                ) : (
                  // Data rows
                  paginatedData.map((row, index) => {
                    const rowId = getRowId(row, index);
                    const isSelected = selectedRows.has(rowId);

                    return (
                      <StyledTableRow
                        key={rowId}
                        selectable={Boolean(onRowClick)}
                        selected={isSelected}
                        onClick={() => onRowClick && onRowClick(row, index)}
                        onKeyDown={(event) =>
                          handleRowKeyDown(event, row, index)
                        }
                        tabIndex={onRowClick ? 0 : -1}
                        role={onRowClick ? "button" : undefined}
                        aria-selected={selectable ? isSelected : undefined}
                      >
                        {selectable && (
                          <StyledBodyCell padding="checkbox">
                            <Checkbox
                              checked={isSelected}
                              onChange={(event) =>
                                handleRowSelect(rowId, event.target.checked)
                              }
                              inputProps={{
                                "aria-label": `Select row ${index + 1}`,
                              }}
                            />
                          </StyledBodyCell>
                        )}
                        {columns.map((column) => {
                          const value = row[column.key];
                          return (
                            <StyledBodyCell
                              key={column.key}
                              align={column.align || "left"}
                            >
                              {column.render
                                ? column.render(value, row, index)
                                : value}
                            </StyledBodyCell>
                          );
                        })}
                      </StyledTableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </StyledTableContainer>
        )}

        {pagination && !loading && !error && (
          <TablePagination
            component="div"
            count={totalCount || sortedData.length}
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={onRowsPerPageChange}
            rowsPerPageOptions={rowsPerPageOptions}
            showFirstButton
            showLastButton
            sx={{
              borderTop: `${designSystem.borders.width[1]} solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
          />
        )}
      </Box>
    );
  }
);

UnifiedTable.displayName = "UnifiedTable";

// PropTypes
UnifiedTable.propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      header: PropTypes.string.isRequired,
      align: PropTypes.oneOf(["left", "center", "right"]),
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      minWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      sortable: PropTypes.bool,
      sortFn: PropTypes.func,
      render: PropTypes.func,
      responsive: PropTypes.oneOf(["hide", "collapse", "stack"]),
    })
  ).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  emptyMessage: PropTypes.string,
  emptyIcon: PropTypes.string,
  sortable: PropTypes.bool,
  selectable: PropTypes.bool,
  pagination: PropTypes.bool,
  responsive: PropTypes.bool,
  mobileBreakpoint: PropTypes.number,
  initialSort: PropTypes.shape({
    key: PropTypes.string,
    direction: PropTypes.oneOf(["asc", "desc", null]),
  }),
  onRowClick: PropTypes.func,
  onSelectionChange: PropTypes.func,
  onSort: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  totalCount: PropTypes.number,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  rowsPerPageOptions: PropTypes.array,
  className: PropTypes.string,
  style: PropTypes.object,
  sx: PropTypes.object,
  "aria-label": PropTypes.string,
  "aria-labelledby": PropTypes.string,
  "aria-describedby": PropTypes.string,
};

export default UnifiedTable;
