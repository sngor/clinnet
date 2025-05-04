// src/components/ui/PageHeading.jsx
import React from 'react';
import { Box, Divider } from '@mui/material';
import { PageTitle, SecondaryText } from './Typography';

/**
 * A consistent page heading component that can be used across all pages
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The page title
 * @param {string} [props.subtitle] - Optional subtitle text
 * @param {React.ReactNode} [props.action] - Optional action button or component
 * @param {boolean} [props.divider=false] - Whether to show a divider below the heading
 * @param {Object} [props.sx] - Additional styles to apply to the container
 */
function PageHeading({ title, subtitle, action, divider = false, sx = {} }) {
  return (
    <>
      <Box 
        sx={{ 
          mb: divider ? 2 : 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          pb: 2,
          borderBottom: divider ? 'none' : '1px solid',
          borderColor: 'grey.200',
          ...sx
        }}
      >
        <Box sx={{ textAlign: 'left', width: '100%' }}>
          <PageTitle 
            variant="h5" 
            sx={{ 
              mb: subtitle ? 0.5 : 0, 
              textAlign: 'left',
              fontWeight: 600,
              color: 'primary.main',
              lineHeight: 1.3
            }}
          >
            {title}
          </PageTitle>
          
          {subtitle && (
            <SecondaryText 
              variant="body2" 
              sx={{ 
                mt: 0.5, 
                mb: 0, 
                fontSize: '1rem', 
                textAlign: 'left',
                lineHeight: 1.4,
                color: 'text.secondary'
              }}
            >
              {subtitle}
            </SecondaryText>
          )}
        </Box>
        
        {action && (
          <Box sx={{ 
            alignSelf: { xs: 'flex-start', sm: 'center' },
            flexShrink: 0
          }}>
            {action}
          </Box>
        )}
      </Box>
      
      {divider && <Divider sx={{ mb: 4 }} />}
    </>
  );
}

export default PageHeading;