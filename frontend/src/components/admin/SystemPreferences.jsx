import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Box, FormControlLabel, Switch, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

const SystemPreferences = () => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('system_preferences')}
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Configure system-wide preferences here.
      </Typography>

      {/* Allow Notifications Option */}
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label={t('allow_notifications')}
        />
      </Box>

      {/* Change Font Size Option */}
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel id="font-size-select-label">{t('font_size')}</InputLabel>
          <Select
            labelId="font-size-select-label"
            id="font-size-select"
            defaultValue="Medium"
            label={t('font_size')}
          >
            <MenuItem value="Small">Small</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Large">Large</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Language Selection Option */}
      <Box sx={{ minWidth: 120, mt: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="language-select-label">{t('language')}</InputLabel>
          <Select
            labelId="language-select-label"
            id="language-select"
            value={i18n.language.split('-')[0]} // Use i18n.language and take the base language if region specific
            onChange={handleLanguageChange}
            label={t('language')}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="km">Khmer</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default SystemPreferences;
