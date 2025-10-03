/**
 * UnifiedButton Example Component
 * Demonstrates all variants, sizes, and features of the UnifiedButton component
 */

import React, { useState } from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import UnifiedButton from "../UnifiedButton.jsx";
import {
  Add as AddIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Edit as EditIcon,
} from "@mui/icons-material";

const UnifiedButtonExample = () => {
  const [loading, setLoading] = useState({});

  const handleLoadingToggle = (buttonId) => {
    setLoading((prev) => ({
      ...prev,
      [buttonId]: !prev[buttonId],
    }));

    // Auto-reset loading after 2 seconds
    setTimeout(() => {
      setLoading((prev) => ({
        ...prev,
        [buttonId]: false,
      }));
    }, 2000);
  };

  const ExampleSection = ({ title, children }) => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box
        sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}
      >
        {children}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        UnifiedButton Component Examples
      </Typography>

      <Typography variant="body1" sx={{ mb: 4, color: "text.secondary" }}>
        A comprehensive button system with polymorphic rendering, multiple
        variants, sizes, and full accessibility support.
      </Typography>

      {/* Variants */}
      <ExampleSection title="Button Variants">
        <UnifiedButton variant="contained">Contained</UnifiedButton>
        <UnifiedButton variant="outlined">Outlined</UnifiedButton>
        <UnifiedButton variant="text">Text</UnifiedButton>
        <UnifiedButton variant="ghost">Ghost</UnifiedButton>
      </ExampleSection>

      {/* Sizes */}
      <ExampleSection title="Button Sizes">
        <UnifiedButton size="xs">Extra Small</UnifiedButton>
        <UnifiedButton size="sm">Small</UnifiedButton>
        <UnifiedButton size="md">Medium</UnifiedButton>
        <UnifiedButton size="lg">Large</UnifiedButton>
        <UnifiedButton size="xl">Extra Large</UnifiedButton>
      </ExampleSection>

      {/* Colors */}
      <ExampleSection title="Button Colors">
        <UnifiedButton color="primary">Primary</UnifiedButton>
        <UnifiedButton color="secondary">Secondary</UnifiedButton>
        <UnifiedButton color="success">Success</UnifiedButton>
        <UnifiedButton color="warning">Warning</UnifiedButton>
        <UnifiedButton color="error">Error</UnifiedButton>
      </ExampleSection>

      {/* With Icons */}
      <ExampleSection title="Buttons with Icons">
        <UnifiedButton startIcon={<AddIcon />}>Add Item</UnifiedButton>
        <UnifiedButton
          variant="outlined"
          endIcon={<SaveIcon />}
          onClick={() => handleLoadingToggle("save")}
          loading={loading.save}
        >
          Save Changes
        </UnifiedButton>
        <UnifiedButton
          variant="text"
          startIcon={<DownloadIcon />}
          color="secondary"
        >
          Download
        </UnifiedButton>
        <UnifiedButton variant="ghost" endIcon={<ShareIcon />}>
          Share
        </UnifiedButton>
      </ExampleSection>

      {/* Icon-only Buttons */}
      <ExampleSection title="Icon-only Buttons">
        <UnifiedButton startIcon={<EditIcon />} aria-label="Edit" size="sm" />
        <UnifiedButton
          startIcon={<FavoriteIcon />}
          aria-label="Add to favorites"
          variant="outlined"
          color="error"
        />
        <UnifiedButton
          startIcon={<SettingsIcon />}
          aria-label="Settings"
          variant="text"
          size="lg"
        />
        <UnifiedButton
          startIcon={<DeleteIcon />}
          aria-label="Delete"
          variant="ghost"
          color="error"
          size="xl"
        />
      </ExampleSection>

      {/* States */}
      <ExampleSection title="Button States">
        <UnifiedButton>Normal</UnifiedButton>
        <UnifiedButton disabled>Disabled</UnifiedButton>
        <UnifiedButton
          loading={loading.loading1}
          onClick={() => handleLoadingToggle("loading1")}
        >
          {loading.loading1 ? "Loading..." : "Click to Load"}
        </UnifiedButton>
        <UnifiedButton
          variant="outlined"
          loading={loading.loading2}
          onClick={() => handleLoadingToggle("loading2")}
          startIcon={<SaveIcon />}
        >
          {loading.loading2 ? "Saving..." : "Save"}
        </UnifiedButton>
      </ExampleSection>

      {/* Full Width */}
      <ExampleSection title="Full Width Buttons">
        <Box sx={{ width: "100%" }}>
          <UnifiedButton fullWidth sx={{ mb: 2 }}>
            Full Width Contained
          </UnifiedButton>
          <UnifiedButton variant="outlined" fullWidth sx={{ mb: 2 }}>
            Full Width Outlined
          </UnifiedButton>
          <UnifiedButton variant="text" fullWidth startIcon={<AddIcon />}>
            Full Width with Icon
          </UnifiedButton>
        </Box>
      </ExampleSection>

      {/* Polymorphic Rendering */}
      <ExampleSection title="Polymorphic Rendering">
        <UnifiedButton as="a" href="#" variant="outlined">
          Link Button
        </UnifiedButton>
        <UnifiedButton as="div" role="button" tabIndex={0}>
          Div Button
        </UnifiedButton>
        <UnifiedButton as="span" onClick={() => alert("Span clicked!")}>
          Span Button
        </UnifiedButton>
      </ExampleSection>

      {/* Size and Variant Combinations */}
      <ExampleSection title="Size and Variant Matrix">
        <Grid container spacing={2}>
          {["contained", "outlined", "text", "ghost"].map((variant) => (
            <Grid item xs={12} sm={6} md={3} key={variant}>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ textTransform: "capitalize" }}
              >
                {variant}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {["xs", "sm", "md", "lg", "xl"].map((size) => (
                  <UnifiedButton
                    key={`${variant}-${size}`}
                    variant={variant}
                    size={size}
                    fullWidth
                  >
                    {size.toUpperCase()}
                  </UnifiedButton>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
      </ExampleSection>

      {/* Accessibility Features */}
      <ExampleSection title="Accessibility Features">
        <UnifiedButton
          aria-label="Save document with keyboard shortcut Ctrl+S"
          startIcon={<SaveIcon />}
        >
          Save (Ctrl+S)
        </UnifiedButton>
        <UnifiedButton
          variant="outlined"
          aria-describedby="delete-help"
          color="error"
          startIcon={<DeleteIcon />}
        >
          Delete Item
        </UnifiedButton>
        <Typography
          id="delete-help"
          variant="caption"
          sx={{ display: "block", mt: 1, color: "text.secondary" }}
        >
          This action cannot be undone
        </Typography>
      </ExampleSection>
    </Box>
  );
};

export default UnifiedButtonExample;
