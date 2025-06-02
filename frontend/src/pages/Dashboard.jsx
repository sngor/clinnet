import React from "react";
import { Box, Collapse, IconButton, Typography, useTheme } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import WarningBanner from "../components/Common/WarningBanner";

const Dashboard = () => {
  // Simulate a connection error for demonstration
  const connectionError =
    "Appointments: Network error. Please check your connection.";

  return (
    <div>
      {/* ...existing code... */}
      {connectionError && (
        <WarningBanner
          message={`Some data failed to load: ${connectionError}`}
        />
      )}
      {/* ...existing code... */}
    </div>
  );
};

const WarningBanner = ({ message, details }) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: theme.palette.warning.main,
        color: theme.palette.warning.contrastText,
        p: 2,
        borderRadius: 1,
        mb: 2,
      }}
    >
      <Typography variant="subtitle1" fontWeight="bold">
        {message}
      </Typography>
      <IconButton
        onClick={handleToggle}
        size="small"
        sx={{ color: "inherit", ml: 1 }}
      >
        {open ? <ExpandLess /> : <ExpandMore />}
      </IconButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" color="inherit">
            {details}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};

export default Dashboard;
