// src/main.jsx

// Add polyfills at the very top of this file
if (typeof global === "undefined") {
  window.global = window;
}
if (typeof process === "undefined") {
  window.process = { env: {} };
}

// Import buffer for Cognito
import { Buffer } from "buffer";
window.Buffer = Buffer;

// Import React and your app component
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App";
import TestApp from "./TestApp";
import AppProviders from "./app/providers/AppProviders";
import "./style.css";

// Debug environment variables
import "./debug-env.js";

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

// Log environment for debugging
console.log("Environment:", {
  NODE_ENV: import.meta.env.MODE,
  BASE_URL: import.meta.env.BASE_URL,
});

// Import and run health check in development
if (import.meta.env.DEV) {
  import("./utils/healthCheck.js").then(({ runHealthCheck }) => {
    runHealthCheck();
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <AppProviders>
    <App />
    {import.meta.env.DEV && (
      <div
        style={{
          position: "fixed",
          bottom: 8,
          right: 8,
          background: "#0008",
          color: "#fff",
          padding: "6px 8px",
          borderRadius: 6,
          fontFamily: "monospace",
          fontSize: 12,
          zIndex: 9999,
        }}
      >
        <span>DEV • {location.pathname}</span>
      </div>
    )}
  </AppProviders>
);
