import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import userService from '../../services/userService'; // Added import
import { PageLayout, SectionContainer } from "../components/ui";
import { useFontSize } from "../context/FontSizeContext";
import {
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Box,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import DiagnosticsPage from "./DiagnosticsPage"; // Import diagnostics page

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { fontSize, updateFontSize, fontSizes } = useFontSize();
  const [tab, setTab] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language.split('-')[0] || 'en');

  const handleFontSizeChange = (event, newSize) => {
    if (newSize !== null) {
      updateFontSize(newSize);
    }
  };

  const handleLanguageChange = (newLang) => {
    i18n.changeLanguage(newLang);
    setSelectedLanguage(newLang);
    userService.updateUserLanguagePreference(newLang) // Added service call
      .then(() => console.log('Language preference updated via service'))
      .catch(err => console.error('Failed to update language preference via service', err));
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <PageLayout
      title={t('settings')}
      subtitle="Customize application appearance and behavior."
      maxWidth="lg"
    >
      <Tabs
        value={tab}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        aria-label="settings tabs"
      >
        <Tab label={t('systemPreferences')} />
        <Tab label={t('systemDiagnostics')} />
      </Tabs>

      {tab === 0 && (
        <>
          <SectionContainer>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('fontSize')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t('adjustFontSize')}
              </Typography>
            </Box>
            <ToggleButtonGroup
            color="primary"
            value={fontSize}
            exclusive
            onChange={handleFontSizeChange}
            aria-label="font size"
          >
            {Object.keys(fontSizes).map((sizeKey) => (
              <ToggleButton
                key={sizeKey}
                value={sizeKey}
                aria-label={`${sizeKey} font size`}
                sx={{ textTransform: "capitalize", minWidth: "100px" }}
              >
                {sizeKey}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </SectionContainer>
        <SectionContainer sx={{ mt: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('language')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('selectLanguage')}
            </Typography>
          </Box>
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel id="language-select-label">{t('language')}</InputLabel>
            <Select
              labelId="language-select-label"
              id="language-select"
              value={selectedLanguage}
              label={t('language')}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="km">ខ្មែរ (Khmer)</MenuItem>
            </Select>
          </FormControl>
        </SectionContainer>
       </>
      )}

      {tab === 1 && (
        <Box sx={{ mt: 2 }}>
          <DiagnosticsPage />
        </Box>
      )}
    </PageLayout>
  );
};

export default SettingsPage;
