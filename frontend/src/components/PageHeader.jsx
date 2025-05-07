// src/components/PageHeader.jsx
import React from 'react';
import { Box, Divider } from '@mui/material';
import { PageTitle, SecondaryText } from './ui';

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
      <Box sx={{ textAlign: 'left', width: '100%' }}>
        <PageTitle sx={{ mb: subtitle ? 0.5 : 0, textAlign: 'left' }}>
          {title}
        </PageTitle>
        
        {subtitle && (
          <SecondaryText sx={{ mt: 0.5, mb: 0, fontSize: '1rem', textAlign: 'left' }}>
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