// src/components/ui/ContentCard.jsx
import React from 'react';
import { Paper, Box, Typography, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

/**
 * A consistent content card component for displaying content with an optional title
 * 
 * @param {Object} props - Component props
 * @param {string} [props.title] - Optional title for the card
 * @param {string} [props.subtitle] - Optional subtitle for the card
 * @param {React.ReactNode} [props.action] - Optional action button or component
 * @param {React.ReactNode} props.children - The content to display in the card
 * @param {number} [props.elevation=1] - The elevation of the card
 * @param {boolean} [props.divider=false] - Whether to show a divider below the heading
 * @param {Object} [props.sx] - Additional styles to apply to the card
 * @param {Object} [props.contentSx] - Additional styles to apply to the content container
 */
function ContentCard({ 
  title, 
  subtitle, 
  action, 
  children, 
  elevation = 1, 
  divider = false,
  sx = {},
  contentSx = {}
}) {
  return (
    <StyledPaper elevation={elevation} sx={sx}>
      {title && (
        <>
          <Box 
            sx={{ 
              mb: divider ? 2 : 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2
            }}
          >
            <Box sx={{ textAlign: 'left', width: '100%' }}>
              <Typography 
                variant="h6" 
                component="h3"
                sx={{ 
                  mb: subtitle ? 0.5 : 0, 
                  textAlign: 'left',
                  fontWeight: 600,
                  color: 'primary.main',
                  lineHeight: 1.4
                }}
              >
                {title}
              </Typography>
              
              {subtitle && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    mt: 0.5, 
                    mb: 0, 
                    textAlign: 'left',
                    lineHeight: 1.4
                  }}
                >
                  {subtitle}
                </Typography>
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
      )}
      
      <Box sx={contentSx}>
        {children}
      </Box>
    </StyledPaper>
  );
}

export default ContentCard;