// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AppProviders from './core/providers/AppProviders';
import './index.css';

// Add error handler for debugging
window.addEventListener('error', function(e) {
  console.error('Global error handler:', e.error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);