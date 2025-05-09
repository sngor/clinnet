// src/components/ui/PageContainer.jsx
import React from 'react';
import { Container } from '@mui/material';

/**
 * A consistent container for all pages to ensure consistent spacing and responsiveness
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content to display
 * @param {Object} [props.sx] - Additional styles to apply
 */
function PageContainer({ children, sx = {} }) {
  return (
    <Container 
      maxWidth="xl" 
      disableGutters
      sx={{
        width: '100%',
        ...sx
      }}
    >
      {children}
    </Container>
  );
}

export default PageContainer;