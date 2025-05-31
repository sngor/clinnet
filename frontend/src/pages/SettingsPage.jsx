import React, { useState } from "react";
import { PageLayout, SectionContainer } from "../components/ui";
import { useFontSize } from "../context/FontSizeContext";
import {
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import DiagnosticsPage from "./DiagnosticsPage"; // Import diagnostics page

const SettingsPage = () => {
  const { fontSize, updateFontSize, fontSizes } = useFontSize();
  const [tab, setTab] = useState(0);

  const handleFontSizeChange = (event, newSize) => {
    if (newSize !== null) {
      updateFontSize(newSize);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <PageLayout
      title="Settings"
      subtitle="Customize application appearance and behavior."
      maxWidth="lg"
    >
      <Tabs
        value={tab}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        aria-label="settings tabs"
      >
        <Tab label="System Preferences" />
        <Tab label="System Diagnostics" />
      </Tabs>

      {tab === 0 && (
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
                sx={{ textTransform: "capitalize", minWidth: "100px" }}
              >
                {sizeKey}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </SectionContainer>
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
