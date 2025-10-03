// src/components/ui/TableStyles.jsx
// Consistent table styles for Clinnet-EMR UI system
//
// Accessibility & Best Practices:
// - Uses <Paper> and <TableContainer> for tables
// - Standard header and action button styles
//
// Usage Example:
// import { StyledTableContainer, tableHeaderStyle, actionButtonsStyle } from '../components/ui';
// <StyledTableContainer><Table>...</Table></StyledTableContainer>

import React from "react";
import { Paper, TableContainer, Table } from "@mui/material";
import { styled } from "@mui/material/styles";
import { designSystem } from "./DesignSystem";

const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: theme.spacing(designSystem.borderRadius.lg / 8),
  overflow: "hidden",
  border: "1px solid",
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.paper,
}));

const StyledTable = styled(Table)(({ theme }) => ({
  minWidth: 650,
  backgroundColor: theme.palette.background.paper,

  "& .MuiTableCell-root": {
    borderBottom: "none",
    padding: theme.spacing(designSystem.spacing.md / 8),
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    color: theme.palette.text.primary,
  },

  "& tbody tr": {
    borderBottom: `1px solid ${theme.palette.divider}`,
    transition: designSystem.transitions.normal,
    backgroundColor: theme.palette.background.paper,

    "&:hover": {
      backgroundColor: theme.palette.action.hover,
    },
  },

  "& tbody tr:last-child": {
    border: 0,
  },

  borderCollapse: "separate",
  borderSpacing: 0,

  "& thead tr th:first-of-type": {
    borderRadius: `${theme.spacing(
      designSystem.borderRadius.sm / 8
    )} 0 0 ${theme.spacing(designSystem.borderRadius.sm / 8)}`,
  },

  "& thead tr th:last-of-type": {
    borderRadius: `0 ${theme.spacing(
      designSystem.borderRadius.sm / 8
    )} ${theme.spacing(designSystem.borderRadius.sm / 8)} 0`,
  },

  "& thead th": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? theme.palette.grey[800]
        : theme.palette.grey[100],
    fontWeight: designSystem.typography.fontWeights.semibold,
    fontSize: designSystem.typography.fontSizes.sm,
    color: theme.palette.text.primary,
    textTransform: "uppercase",
    letterSpacing: "0.025em",
  },
}));

/**
 * A consistent table wrapper with standardized styling using design system
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The table content
 * @param {Object} [props.sx] - Additional styles to apply to the Paper component
 * @param {Object} [props.tableSx] - Additional styles to apply to the Table component
 */
export const StyledTableContainer = ({ children, sx = {}, tableSx = {} }) => (
  <StyledPaper elevation={0} sx={sx}>
    <TableContainer sx={{ boxShadow: "none" }}>
      <StyledTable sx={tableSx}>{children}</StyledTable>
    </TableContainer>
  </StyledPaper>
);

/**
 * Standard styles for table headers using design system
 */
export const tableHeaderStyle = (theme) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.grey[800]
      : theme.palette.grey[100],
  fontWeight: designSystem.typography.fontWeights.semibold,
  fontSize: designSystem.typography.fontSizes.sm,
  color: theme.palette.text.primary,
  textTransform: "uppercase",
  letterSpacing: "0.025em",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
});

/**
 * Standard styles for action buttons container using design system
 */
export const actionButtonsStyle = (theme) => ({
  display: "flex",
  gap: theme.spacing(designSystem.spacing.sm / 8),
  alignItems: "center",
});
