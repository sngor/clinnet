import React, { useState, useEffect } from "react";
import { Alert, Snackbar } from "@mui/material";

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Snackbar
      open={showOffline}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert severity="warning" variant="filled">
        You are currently offline. Some features may not work properly.
      </Alert>
    </Snackbar>
  );
};

export default OfflineIndicator;
