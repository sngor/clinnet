import "../style.css";
import React from "react";
import AppRouter from "./router.jsx"; // Import your router configuration
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import OfflineIndicator from "../components/ui/OfflineIndicator.jsx";

function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
      <OfflineIndicator />
    </ErrorBoundary>
  );
}

export default App;
