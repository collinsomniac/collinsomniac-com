import React, { createContext, useContext, useEffect } from 'react';
import { useThemeStore } from '../../stores/themeStore';

// Create a new context with default values
const ThemeContext = createContext(null);

// Create a provider component that wraps its children and provides the theme context
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const themeStore = useThemeStore();

  return (
    <ThemeContext.Provider value={themeStore}>{children}</ThemeContext.Provider>
  );
};

// Create a custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Export the ThemeContext for direct access if needed
export default ThemeContext;
