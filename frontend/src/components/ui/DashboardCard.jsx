// src/components/DashboardCard.jsx
import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import { 
  Paper, 
  Typography, 
  Box 
} from '@mui/material';
import { Link } from 'react-router-dom';
import { TextButton } from './AppButton';

/**
 * A consistent dashboard card component for summary statistics
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon to display in the card
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.linkText - Text for the link button
 * @param {string} props.linkTo - URL for the link button
 * @param {Object} props.sx - Additional styles to apply
 */
function DashboardCard({ icon, title, value, linkText, linkTo, sx = {} }) {
  return (
    <Paper
      elevation={0}
      sx={{ 
        p: 3, 
        display: "flex", 
        flexDirection: "column", 
        height: 180,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-4px)"
        },
        ...sx
      }}
    >
      {/* Background icon */}
      <Box 
        sx={{ 
          position: "absolute",
          top: 10,
          right: 10,
          color: "primary.light",
          opacity: 0.15,
          transform: "scale(2.5)",
          transformOrigin: "top right"
        }}
      >
        {icon}
      </Box>
      
      {/* Content container with fixed height for title and value */}
      <Box sx={{ height: 110 }}>
        <Typography 
          component="h2" 
          variant="h6" 
          color="primary.main" 
          fontWeight="medium"
          sx={{
            mb: 2,
            height: 28, // Fixed height for title
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {title}
        </Typography>
        
        <Typography 
          component="p" 
          variant="h2" 
          sx={{ 
            fontWeight: 'bold',
            lineHeight: 1.2
          }}
        >
          {value}
        </Typography>
      </Box>
      
      {/* Link button at the bottom */}
      <Box sx={{ mt: 'auto' }}>
        <TextButton
          component={Link}
          to={linkTo}
          sx={{ 
            alignSelf: "flex-start", 
            pl: 0,
            // Ensure text button specific styling if needed, e.g., padding adjustments
            // TextButton is already styled, so this might not be necessary
            // or could be theme dependent.
            // For now, direct replacement and rely on TextButton styles.
          }}
        >
          {linkText}
        </TextButton>
      </Box>
    </Paper>
  );
}

DashboardCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  linkText: PropTypes.string.isRequired,
  linkTo: PropTypes.string.isRequired,
  sx: PropTypes.object,
};

export default DashboardCard;