import React from "react";
import { Alert, AlertTitle, Box } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const WarningBanner = ({ message }) => (
  <Box sx={{ mb: 2 }}>
    <Alert
      severity="warning"
      icon={<WarningAmberIcon fontSize="inherit" />}
      sx={{
        alignItems: "center",
        borderRadius: 2,
        fontWeight: 500,
        backgroundColor: (theme) => theme.palette.warning.light,
        color: (theme) => theme.palette.warning.dark,
      }}
    >
      <AlertTitle sx={{ fontWeight: 700 }}>Some data failed to load</AlertTitle>
      {message}
    </Alert>
  </Box>
);

export default WarningBanner;
