import React from "react";
import { Box, Typography, Paper, Grid, useTheme } from "@mui/material";
import { UnifiedCard, UnifiedButton } from "./index";

/**
 * Theme Color Audit Component
 * Displays all theme colors to verify dark mode compatibility
 */
const ThemeColorAudit = () => {
  const theme = useTheme();

  const colorCategories = [
    {
      name: "Primary Colors",
      colors: {
        "primary.main": theme.palette.primary.main,
        "primary.light": theme.palette.primary.light,
        "primary.dark": theme.palette.primary.dark,
      },
    },
    {
      name: "Secondary Colors",
      colors: {
        "secondary.main": theme.palette.secondary.main,
        "secondary.light": theme.palette.secondary.light,
        "secondary.dark": theme.palette.secondary.dark,
      },
    },
    {
      name: "Status Colors",
      colors: {
        "success.main": theme.palette.success.main,
        "warning.main": theme.palette.warning.main,
        "error.main": theme.palette.error.main,
        "info.main": theme.palette.info.main,
      },
    },
    {
      name: "Background Colors",
      colors: {
        "background.default": theme.palette.background.default,
        "background.paper": theme.palette.background.paper,
      },
    },
    {
      name: "Text Colors",
      colors: {
        "text.primary": theme.palette.text.primary,
        "text.secondary": theme.palette.text.secondary,
        "text.disabled": theme.palette.text.disabled,
      },
    },
    {
      name: "Action Colors",
      colors: {
        "action.hover": theme.palette.action.hover,
        "action.selected": theme.palette.action.selected,
        "action.disabled": theme.palette.action.disabled,
      },
    },
    {
      name: "Grey Scale",
      colors: {
        "grey.50": theme.palette.grey[50],
        "grey.100": theme.palette.grey[100],
        "grey.200": theme.palette.grey[200],
        "grey.300": theme.palette.grey[300],
        "grey.400": theme.palette.grey[400],
        "grey.500": theme.palette.grey[500],
        "grey.600": theme.palette.grey[600],
        "grey.700": theme.palette.grey[700],
        "grey.800": theme.palette.grey[800],
        "grey.900": theme.palette.grey[900],
      },
    },
  ];

  const ColorSwatch = ({ name, color }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 1,
        borderRadius: 1,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          backgroundColor: color,
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontFamily: "monospace",
            fontSize: "0.7rem",
          }}
        >
          {color}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <UnifiedCard
      title="Theme Color Audit"
      subtitle={`Current mode: ${theme.palette.mode}`}
    >
      <Grid container spacing={3}>
        {colorCategories.map((category) => (
          <Grid item xs={12} md={6} lg={4} key={category.name}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, color: theme.palette.primary.main }}
              >
                {category.name}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {Object.entries(category.colors).map(([name, color]) => (
                  <ColorSwatch key={name} name={name} color={color} />
                ))}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mt: 4,
          p: 3,
          backgroundColor: theme.palette.background.default,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Component Examples
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <UnifiedButton variant="contained">Primary Button</UnifiedButton>
          <UnifiedButton variant="outlined">Secondary Button</UnifiedButton>
          <UnifiedButton variant="text">Text Button</UnifiedButton>
        </Box>
      </Box>
    </UnifiedCard>
  );
};

export default ThemeColorAudit;
