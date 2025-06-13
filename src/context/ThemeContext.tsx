import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the Theme context
type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

// Provider component to wrap your app
export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(deviceTheme === 'dark');

  // Load saved theme preference on app start
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme_preference');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          // If no saved preference, use device theme
          setIsDarkMode(deviceTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadThemePreference();
  }, [deviceTheme]);

  // Save theme preference whenever it changes
  useEffect(() => {
    if (isInitialized) {
      AsyncStorage.setItem('theme_preference', isDarkMode ? 'dark' : 'light').catch(error => {
        console.error('Failed to save theme preference:', error);
      });
    }
  }, [isDarkMode, isInitialized]);

  // Function to toggle between dark and light mode
  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Function to set theme directly
  const setTheme = (isDark: boolean) => {
    setIsDarkMode(isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// COLORS object that can be used throughout the app
export const getColors = (isDark = false) => ({
  primary: "#FF5252", // Red/orange from the bar in the logo
  secondary: "#FF5252", // Dark blue/black from the "311" text
  background: isDark ? "#121212" : "#FFFFFF",
  surface: isDark ? "#1E1E1E" : "#FFFFFF",
  text: {
    primary: isDark ? "#FFFFFF" : "#FF5252",
    secondary: isDark ? "#AAAAAA" : "#666666",
  },
  border: isDark ? "#333333" : "#EEEEEE",
  tabInactive: isDark ? "#777777" : "#999999",
  status: {
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  }
});