// src/components/PasswordStrengthMeter.jsx
import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { 
  getPasswordStrength, 
  getPasswordStrengthLabel, 
  getPasswordStrengthColor 
} from '../utils/password-validator';

/**
 * A component that displays password strength as a meter
 * @param {Object} props - Component props
 * @param {string} props.password - The password to evaluate
 * @param {boolean} props.showLabel - Whether to show the strength label
 */
const PasswordStrengthMeter = ({ password, showLabel = true }) => {
  const strength = getPasswordStrength(password);
  const label = getPasswordStrengthLabel(strength);
  const color = getPasswordStrengthColor(strength);
  
  // Calculate progress value (0-100)
  const progress = (strength / 4) * 100;
  
  return (
    <Box sx={{ width: '100%', mt: 1, mb: showLabel ? 0 : 1 }}>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4,
          borderRadius: 2,
          bgcolor: 'rgba(0, 0, 0, 0.09)',
          '& .MuiLinearProgress-bar': {
            bgcolor: color,
          },
        }}
      />
      {showLabel && password && (
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block',
            textAlign: 'right',
            mt: 0.5,
            color: color
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
};

export default PasswordStrengthMeter;