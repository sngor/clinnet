// src/components/ui/ContentCard.jsx
import React from 'react';
import { Paper, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import SectionHeading from './SectionHeading';

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
        <SectionHeading 
          title={title} 
          subtitle={subtitle} 
          action={action} 
          divider={divider} 
        />
      )}
      
      <Box sx={contentSx}>
        {children}
      </Box>
    </StyledPaper>
  );
}

export default ContentCard;