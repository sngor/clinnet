import React from 'react';
import { PageLayout, SectionContainer } from '../components/ui'; // Adjusted imports
import { useFontSize } from '../context/FontSizeContext'; // Import useFontSize
import { ToggleButton, ToggleButtonGroup, Typography, Box } from '@mui/material'; // Import MUI components

const SettingsPage = () => {
  const { fontSize, updateFontSize, fontSizes } = useFontSize();

  const handleFontSizeChange = (event, newSize) => {
    if (newSize !== null) { // Ensure a value is selected
      updateFontSize(newSize);
    }
  };

  return (
    <PageLayout
      title="Settings" // Changed title for brevity
      subtitle="Customize application appearance and behavior." // Updated subtitle
    >
      <SectionContainer>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Font Size
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Adjust the application-wide font size.
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
              sx={{ textTransform: 'capitalize', minWidth: '100px' }} // Style adjustments
            >
              {sizeKey}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </SectionContainer>
    </PageLayout>
  );
};

export default SettingsPage;
