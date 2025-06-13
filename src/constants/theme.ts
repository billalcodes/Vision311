// src/constants/theme.ts
export const COLORS = {
  // Primary colors from the 311 logo
  primary: "#FF5252", // Red/orange from the bar in the logo
  primaryDark: "#E64A4A", // Darker red for pressed states
  primaryLight: "#FF6B6B", // Lighter red for highlights

  // Secondary colors
  secondary: "#0F1A2A", // Dark blue/black from the "311" text
  secondaryDark: "#0A1420", // Darker blue/black
  secondaryLight: "#1A2A40", // Lighter blue/black

  // Background colors
  background: {
    light: "#FFFFFF",
    dark: "#121212",
  },

  // Surface colors (cards, modals)
  surface: {
    light: "#FFFFFF",
    dark: "#1E1E1E",
  },

  // Text colors
  text: {
    light: {
      primary: "#0F1A2A", // Using the dark blue/black from logo
      secondary: "#666666",
      tertiary: "#999999",
    },
    dark: {
      primary: "#FFFFFF",
      secondary: "#AAAAAA",
      tertiary: "#777777",
    },
  },

  // Status colors
  status: {
    success: "#10b981", // Green
    warning: "#f59e0b", // Amber
    error: "#ef4444", // Red
    info: "#3b82f6", // Blue
  },

  // Border colors
  border: {
    light: "#EEEEEE",
    dark: "#333333",
  },
}

export const FONTS = {
  regular: "System",
  medium: "System",
  bold: "System",
}

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
}

