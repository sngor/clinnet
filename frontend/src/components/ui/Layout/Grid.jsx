import React from "react";
import { Grid as MuiGrid, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledGrid = styled(MuiGrid)(({ theme, spacing = 3 }) => ({
  "& .MuiGrid-item": {
    paddingTop: theme.spacing(spacing),
    paddingLeft: theme.spacing(spacing),
  },
}));

/**
 * Enhanced grid system with consistent spacing
 */
const Grid = ({
  container = false,
  item = false,
  spacing = 3,
  children,
  ...props
}) => {
  if (container) {
    return (
      <StyledGrid
        container
        spacing={spacing}
        sx={{
          margin: 0,
          width: "100%",
          "& > .MuiGrid-item": {
            paddingTop: spacing,
            paddingLeft: spacing,
          },
        }}
        {...props}
      >
        {children}
      </StyledGrid>
    );
  }

  return (
    <MuiGrid item {...props}>
      {children}
    </MuiGrid>
  );
};

/**
 * Responsive grid container with consistent breakpoints
 */
export const ResponsiveGrid = ({
  children,
  spacing = 3,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  ...props
}) => {
  return (
    <Grid container spacing={spacing} {...props}>
      {React.Children.map(children, (child, index) => (
        <Grid
          item
          xs={12 / columns.xs}
          sm={12 / columns.sm}
          md={12 / columns.md}
          lg={12 / columns.lg}
          key={index}
        >
          {child}
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * Dashboard grid specifically for metric cards
 */
export const DashboardGrid = ({ children, ...props }) => {
  return (
    <ResponsiveGrid
      columns={{ xs: 1, sm: 2, md: 2, lg: 4 }}
      spacing={3}
      {...props}
    >
      {children}
    </ResponsiveGrid>
  );
};

export default Grid;
