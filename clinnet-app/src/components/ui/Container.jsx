// src/components/ui/Container.jsx
import React from 'react';
import { Box, Paper, Container as MuiContainer } from '@mui/material';

/**
 * A consistent page container with standard padding and max width
 */
export function PageContainer({ children, maxWidth = 'xl', sx = {}, ...props }) {
  return (
    <MuiContainer
      maxWidth={maxWidth}
      disableGutters
      sx={{
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        ...sx
      }}
      {...props}
    >
      {children}
    </MuiContainer>
  );
}

/**
 * A consistent section container with standard styling
 */
export function SectionContainer({ children, elevation = 0, sx = {}, ...props }) {
  return (
    <Paper
      elevation={elevation}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        border: elevation === 0 ? '1px solid' : 'none',
        borderColor: 'divider',
        mb: 4,
        ...sx
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}

/**
 * A consistent card container for content items
 */
export function CardContainer({ children, sx = {}, ...props }) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
        },
        ...sx
      }}
      {...props}
    >
      {children}
    </Paper>
  );
}

/**
 * A flex container with common alignment options
 */
export function FlexBox({ 
  children, 
  direction = 'row', 
  justify = 'flex-start', 
  align = 'center',
  spacing = 2,
  wrap = 'nowrap',
  sx = {},
  ...props 
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: direction,
        justifyContent: justify,
        alignItems: align,
        flexWrap: wrap,
        gap: spacing,
        ...sx
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

export default {
  PageContainer,
  SectionContainer,
  CardContainer,
  FlexBox
};