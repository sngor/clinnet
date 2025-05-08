// src/main.jsx
import "./aws-exports.js";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import AppProviders from "./app/providers/AppProviders";
import "./index.css"; // Ensure this file exists and is correctly imported

// Add error handler for debugging
window.addEventListener("error", function (e) {
  console.error("Global error handler:", e.error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1 style="color: #d32f2f;">React Rendering Error</h1>
      <pre style="background: #f5f5f5; padding: 15px; border-radius: 4px; overflow: auto;">
        ${e.error?.stack || e.message || "Unknown error"}
      </pre>
      <p>Check your browser console for more details.</p>
    </div>
  `;
});

console.log("Amplify config:", amplifyConfig);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
