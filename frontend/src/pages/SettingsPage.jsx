import React, { useState, useEffect } from "react";
import { PageLayout, SectionContainer } from "../components/ui";
import { Typography, Box, Tabs, Tab } from "@mui/material";
import {
  Settings as SettingsIcon,
  BugReport as BugReportIcon,
  Palette as PaletteIcon,
} from "@mui/icons-material";
import DiagnosticsPage from "./DiagnosticsPage"; // Import diagnostics page
import SimpleThemeToggle from "../components/SimpleThemeToggle";

const SettingsPage = () => {
  const [tab, setTab] = useState(0);

  // Automatically select tab based on URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "system-diagnostics") {
      setTab(1);
    } else if (tabParam === "system-preferences") {
      setTab(0);
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const tabs = [
    { label: "General", icon: <SettingsIcon /> },
    { label: "Theme", icon: <PaletteIcon /> },
    { label: "System Diagnostics", icon: <BugReportIcon /> },
  ];

  return (
    <PageLayout
      title="Settings"
      subtitle="Customize application preferences"
      menuIcon={null}
    >
      <Tabs
        value={tab}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        aria-label="settings tabs"
      >
        {tabs.map((tabItem, index) => (
          <Tab key={index} icon={tabItem.icon} label={tabItem.label} />
        ))}
      </Tabs>

      {tab === 0 && (
        <SectionContainer>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              General application settings will be available here.
            </Typography>
          </Box>
        </SectionContainer>
      )}

      {tab === 1 && (
        <Box sx={{ py: 3 }}>
          <SimpleThemeToggle />
        </Box>
      )}

      {tab === 2 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ borderRadius: 1, overflow: "hidden" }}>
            <DiagnosticsPage />
          </Box>
        </Box>
      )}
    </PageLayout>
  );
};

export default SettingsPage;
