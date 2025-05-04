// src/components/ui/SectionHeading.jsx
import React from 'react';
import { Box, Divider } from '@mui/material';
import { SectionTitle, SecondaryText } from './Typography';

/**
 * A consistent section heading component that can be used within pages
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The section title
 * @param {string} [props.subtitle] - Optional subtitle text
 * @param {React.ReactNode} [props.action] - Optional action button or component
 * @param {boolean} [props.divider=true] - Whether to show a divider below the heading
 * @param {Object} [props.sx] - Additional styles to apply to the container
 */
function SectionHeading({ title, subtitle, action, divider = true, sx = {} }) {
  return (
    <>
      <Box 
        sx={{ 
          mb: divider ? 2 : 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          ...sx
        }}
      >
        <Box sx={{ textAlign: 'left', width: '100%' }}>
          <SectionTitle 
            variant="h6" 
            sx={{ 
              mb: subtitle ? 0.5 : 0, 
              textAlign: 'left',
              fontWeight: 600,
              color: 'primary.main',
              lineHeight: 1.4
            }}
          >
            {title}
          </SectionTitle>
          
          {subtitle && (
            <SecondaryText 
              variant="body2" 
              sx={{ 
                mt: 0.5, 
                mb: 0, 
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
      
      {divider && <Divider sx={{ mb: 3 }} />}
    </>
  );
}

export default SectionHeading;