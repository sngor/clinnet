import React from 'react';
import { Typography, Box, FormControlLabel, Switch, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const SystemPreferences = () => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        System Preferences
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Configure system-wide preferences here.
      </Typography>

      {/* Allow Notifications Option */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Allow Notifications"
        />
      </Box>

      {/* Change Font Size Option */}
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel id="font-size-select-label">Font Size</InputLabel>
          <Select
            labelId="font-size-select-label"
            id="font-size-select"
            defaultValue="Medium"
            label="Font Size"
          >
            <MenuItem value="Small">Small</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Large">Large</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default SystemPreferences;
