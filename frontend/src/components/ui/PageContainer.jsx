// src/components/ui/PageContainer.jsx
import React from "react";
import { Container } from "@mui/material";

/**
 * A consistent container for all pages to ensure consistent spacing and responsiveness
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to display
 * @param {Object} [props.sx] - Additional styles to apply
 *
 * Example usage for responsive padding:
 * <PageContainer sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
 *   ...
 * </PageContainer>
 */
function PageContainer({ children, sx = {} }) {
  return (
    <Container
      maxWidth="xl"
      disableGutters
      sx={{
        width: "100%",
        px: { xs: 1, sm: 2, md: 3 }, // Responsive horizontal padding
        ...sx,
      }}
    >
      {children}
    </Container>
  );
}

export default PageContainer;
