// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App.jsx"; // Ensure this path is correct
import "./index.css"; // Or your global styles entry point
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./app/providers/ThemeProvider.jsx"; // Adjust path if needed
import { AuthProvider } from "./app/providers/AuthProvider.jsx"; // Adjust path if needed

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <App /> {/* This should be your main App component */}
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
