// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Assuming global styles
import { BrowserRouter } from 'react-router-dom';
// Import ThemeProvider and AuthProvider if created

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Wrap with ThemeProvider and AuthProvider here */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);