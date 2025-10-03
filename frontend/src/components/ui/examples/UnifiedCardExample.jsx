/**
 * UnifiedCard Examples
 * Demonstrates all variants and usage patterns of the UnifiedCard component
 */

import React, { useState } from "react";
import { Box, Button, Typography, IconButton, Chip } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import UnifiedCard from "../UnifiedCard";

const UnifiedCardExample = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCardClick = () => {
    console.log("Card clicked!");
  };

  const handleLoadingToggle = () => {
    setLoading(!loading);
  };

  const handleErrorToggle = () => {
    setError(error ? null : "This is an example error message");
  };

  return (
    <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        UnifiedCard Examples
      </Typography>

      {/* Basic Variants */}
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Basic Variants
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          {/* Default Variant */}
          <UnifiedCard variant="default">
            <UnifiedCard.Header
              title="Default Card"
              subtitle="Standard card with border and shadow"
            />
            <UnifiedCard.Body>
              <Typography>
                This is the default card variant with a subtle border and
                shadow.
              </Typography>
            </UnifiedCard.Body>
          </UnifiedCard>

          {/* Elevated Variant */}
          <UnifiedCard variant="elevated">
            <UnifiedCard.Header
              title="Elevated Card"
              subtitle="Card with enhanced shadow"
            />
            <UnifiedCard.Body>
              <Typography>
                This card has an elevated appearance with a more prominent
                shadow.
              </Typography>
            </UnifiedCard.Body>
          </UnifiedCard>

          {/* Flat Variant */}
          <UnifiedCard variant="flat">
            <UnifiedCard.Header
              title="Flat Card"
              subtitle="Minimal card without shadows"
            />
            <UnifiedCard.Body>
              <Typography>
                This is a flat card with no shadows or borders for a minimal
                look.
              </Typography>
            </UnifiedCard.Body>
          </UnifiedCard>

          {/* Outlined Variant */}
          <UnifiedCard variant="outlined">
            <UnifiedCard.Header
              title="Outlined Card"
              subtitle="Card with prominent border"
            />
            <UnifiedCard.Body>
              <Typography>
                This card has a thicker border and no shadow for clear
                definition.
              </Typography>
            </UnifiedCard.Body>
          </UnifiedCard>
        </Box>
      </Box>

      {/* Interactive Cards */}
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Interactive Cards
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          {/* Interactive Variant */}
          <UnifiedCard variant="interactive" onClick={handleCardClick}>
            <UnifiedCard.Header title="Interactive Card" subtitle="Click me!" />
            <UnifiedCard.Body>
              <Typography>
                This card is interactive and responds to clicks and keyboard
                navigation.
              </Typography>
            </UnifiedCard.Body>
          </UnifiedCard>

          {/* Custom Interactive */}
          <UnifiedCard interactive onClick={handleCardClick}>
            <UnifiedCard.Header
              title="Custom Interactive"
              subtitle="With action button"
              action={
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <UnifiedCard.Body>
              <Typography>
                This card combines interactive behavior with action buttons.
              </Typography>
            </UnifiedCard.Body>
          </UnifiedCard>
        </Box>
      </Box>

      {/* Compound Component Examples */}
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Compound Component Patterns
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          {/* Full Structure */}
          <UnifiedCard variant="default">
            <UnifiedCard.Header
              title="Complete Card"
              subtitle="Header, body, and footer"
              action={<Button size="small">Edit</Button>}
            />
            <UnifiedCard.Body>
              <Typography paragraph>
                This card demonstrates the full structure with header, body, and
                footer components.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip label="Tag 1" size="small" />
                <Chip label="Tag 2" size="small" />
                <Chip label="Tag 3" size="small" />
              </Box>
            </UnifiedCard.Body>
            <UnifiedCard.Footer>
              <Button startIcon={<FavoriteIcon />} size="small">
                Like
              </Button>
              <Button startIcon={<ShareIcon />} size="small">
                Share
              </Button>
            </UnifiedCard.Footer>
          </UnifiedCard>

          {/* Custom Header Layout */}
          <UnifiedCard variant="elevated">
            <UnifiedCard.Header align="center" variant="spacious">
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Custom Header
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Centered content with custom layout
                </Typography>
              </Box>
            </UnifiedCard.Header>
            <UnifiedCard.Body padding="spacious" spacing="relaxed">
              <Typography>
                This card uses custom header alignment and spacing options.
              </Typography>
              <Typography>
                The body also has spacious padding and relaxed spacing between
                elements.
              </Typography>
            </UnifiedCard.Body>
          </UnifiedCard>

          {/* Footer Variations */}
          <UnifiedCard variant="outlined">
            <UnifiedCard.Header title="Footer Variations" />
            <UnifiedCard.Body>
              <Typography>
                This card demonstrates different footer layouts and spacing
                options.
              </Typography>
            </UnifiedCard.Body>
            <UnifiedCard.Footer justify="space-between" spacing="relaxed">
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last updated: Today
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton size="small" color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton size="small" color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </UnifiedCard.Footer>
          </UnifiedCard>
        </Box>
      </Box>

      {/* State Examples */}
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          State Examples
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Button onClick={handleLoadingToggle}>Toggle Loading</Button>
          <Button onClick={handleErrorToggle}>Toggle Error</Button>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          {/* Loading State */}
          <UnifiedCard variant="default" loading={loading}>
            <UnifiedCard.Header
              title="Loading State"
              subtitle="Shows skeleton loading"
            />
            <UnifiedCard.Body>
              <Typography>
                This card demonstrates the loading state with skeleton
                placeholders.
              </Typography>
            </UnifiedCard.Body>
          </UnifiedCard>

          {/* Error State */}
          <UnifiedCard variant="default" error={error}>
            <UnifiedCard.Header
              title="Error State"
              subtitle="Shows error styling"
            />
            <UnifiedCard.Body>
              <Typography>
                This card demonstrates the error state with error styling and
                messaging.
              </Typography>
            </UnifiedCard.Body>
          </UnifiedCard>
        </Box>
      </Box>

      {/* Polymorphic Examples */}
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Polymorphic Rendering
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 3,
          }}
        >
          {/* As Article */}
          <UnifiedCard as="article" variant="default">
            <UnifiedCard.Header
              title="Article Card"
              subtitle="Rendered as <article>"
            />
            <UnifiedCard.Body>
              <Typography>
                This card is rendered as an HTML article element for semantic
                markup.
              </Typography>
            </UnifiedCard.Body>
          </UnifiedCard>

          {/* As Section */}
          <UnifiedCard as="section" variant="elevated">
            <UnifiedCard.Header
              title="Section Card"
              subtitle="Rendered as <section>"
            />
            <UnifiedCard.Body>
              <Typography>
                This card is rendered as an HTML section element.
              </Typography>
            </UnifiedCard.Body>
          </UnifiedCard>
        </Box>
      </Box>
    </Box>
  );
};

export default UnifiedCardExample;
