import React, { createContext, useState, useContext, useEffect } from 'react'; // Added useEffect
import theme from '../app/theme';

const FontSizeContext = createContext();
const LOCAL_STORAGE_KEY = 'appFontSize';

export const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(() => {
    const storedSize = localStorage.getItem(LOCAL_STORAGE_KEY);
    // Check if storedSize is a valid key in theme.fontSizes
    return storedSize && theme.fontSizes[storedSize] ? storedSize : 'medium';
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, fontSize);
  }, [fontSize]);

  const updateFontSize = (newSize) => {
    if (newSize && theme.fontSizes[newSize]) { // Ensure newSize is not null/undefined
      setFontSize(newSize);
    } else {
      console.warn(`Invalid font size: ${newSize}. Reverting to current or default.`);
      // Optionally, revert to a default or do nothing if newSize is invalid
      // For now, if newSize is invalid, it won't update.
      // If it's null (e.g. from ToggleButtonGroup), it also won't update.
    }
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, updateFontSize, fontSizes: theme.fontSizes }}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => {
  const context = useContext(FontSizeContext);
  if (context === undefined) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
};

export default FontSizeContext;
