// src/app/providers/AppProviders.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./AuthProvider";
import { DataProvider } from "./DataProvider";
import ThemeContextProvider from "../../context/ThemeContext";

function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <ThemeContextProvider>
        <AuthProvider>
          <DataProvider>{children}</DataProvider>
        </AuthProvider>
      </ThemeContextProvider>
    </BrowserRouter>
  );
}

export default AppProviders;
