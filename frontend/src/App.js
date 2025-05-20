import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  
  useEffect(() => {
    // Initialize your app state based on the current route
    // This will ensure proper state initialization on direct page loads
    console.log('App initialized at path:', location.pathname);
    // Load necessary data based on current route
  }, []);
  
  return (
    // ...existing routes and components
  );
}

export default App;