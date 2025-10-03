// src/components/ui/FormLayout.jsx
import React from "react";
import { Grid, Box, Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  border: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

/**
 * FormLayout component for consistent form layouts across the application
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Form fields
 * @param {boolean} props.withPaper - Whether to wrap form in a Paper component
 * @param {string} props.spacing - Grid spacing
 * @param {Object} props.sx - Additional styles
 */
const FormLayout = ({
  children,
  withPaper = true,
  spacing = 2,
  sx = {},
  ...props
}) => {
  const content = (
    <Grid container spacing={spacing} {...props}>
      {React.Children.map(children, (child, index) => {
        // Skip null or undefined children
        if (!child) return null;

        // If child already has Grid item props, use them
        if (child && child.type === Grid && child.props.item) {
          return child;
        }

        // If child is a Box with gridColumn span prop, respect it
        if (
          child &&
          child.props &&
          child.props.sx &&
          child.props.sx.gridColumn
        ) {
          return (
            <Grid item xs={12} key={index}>
              {child}
            </Grid>
          );
        }

        // Default to full width on mobile, half width on larger screens
        return (
          <Grid item xs={12} sm={6} key={index}>
            {child}
          </Grid>
        );
      })}
    </Grid>
  );

  if (withPaper) {
    return <StyledPaper sx={sx}>{content}</StyledPaper>;
  }

  return <Box sx={sx}>{content}</Box>;
};

export default FormLayout;
