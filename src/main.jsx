// Polyfills for Cognito
window.global = window;
window.process = window.process || { env: {} };
try {
  window.Buffer = window.Buffer || require("buffer/").Buffer;
} catch (e) {
  console.warn("Buffer polyfill not loaded:", e);
}

// For some versions of Cognito
window.AWS = window.AWS || {};
window.navigator = window.navigator || {};
window.navigator.userAgent = window.navigator.userAgent || "Mozilla/5.0";

// You might need to install these packages: npm install buffer
import { Buffer } from "buffer";
window.Buffer = Buffer;

// Your existing imports and application code
// ...existing code...
