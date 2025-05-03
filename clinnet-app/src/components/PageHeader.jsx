// src/components/PageHeader.jsx
import React from 'react';
import { Box, Typography, Button, Divider } from '@mui/material';

/**
 * A consistent page header component that can be used across all pages
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The page title
 * @param {string} [props.subtitle] - Optional subtitle text
 * @param {React.ReactNode} [props.action] - Optional action button or component
 * @param {Object} [props.sx] - Additional styles to apply to the container
 */
function PageHeader({ title, subtitle, action, sx = {} }) {
  return (
    <Box 
      sx={{ 
        mb: 4,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        ...sx
      }}
    >
      <Box>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 500, 
            color: 'primary.main',
            mb: subtitle ? 0.5 : 0
          }}
        >
          {title}
        </Typography>
        
        {subtitle && (
          <Typography 
            variant="subtitle1" 
            color="text.secondary"
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      
      {action && (
        <Box sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>
          {action}
        </Box>
      )}
    </Box>
  );
}

/**
 * A page header with a bottom divider
 */
export function PageHeaderWithDivider(props) {
  return (
    <>
      <PageHeader {...props} />
      <Divider sx={{ mb: 4 }} />
    </>
  );
}

export default PageHeader;