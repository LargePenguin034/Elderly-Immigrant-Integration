import React, { createContext, useState, useContext, useEffect } from 'react';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the theme and font size context with default values
const AppContext = createContext({
  isDarkMode: true, // Default to dark mode
  toggleTheme: () => {}, // Placeholder function for toggling theme
  fontSize: 20, // Default font size
  setFontSize: () => {}, // Placeholder function for setting font size
});

// Custom hook to access the AppContext
export const useAppContext = () => useContext(AppContext);

// AppProvider component that manages theme and font size states
function AppProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true); // State to manage theme mode
  const [fontSize, setFontSize] = useState(20); // State to manage font size

  // Load preferences from AsyncStorage on component mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Function to load theme and font size preferences from AsyncStorage
  const loadPreferences = async () => {
    try {
      const themeValue = await AsyncStorage.getItem('@theme_preference');
      if (themeValue !== null) {
        setIsDarkMode(JSON.parse(themeValue)); // Set theme if found in storage
      }

      const fontSizeValue = await AsyncStorage.getItem('@font_size_preference');
      if (fontSizeValue !== null) {
        setFontSize(JSON.parse(fontSizeValue)); // Set font size if found in storage
      }
    } catch (error) {
      console.error('Error loading preferences:', error); // Log any errors during loading
    }
  };

  // Function to toggle the theme between dark and light modes
  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode; // Toggle theme
      setIsDarkMode(newTheme); // Update state
      await AsyncStorage.setItem('@theme_preference', JSON.stringify(newTheme)); // Save new theme to storage
    } catch (error) {
      console.error('Error saving theme preference:', error); // Log any errors during saving
    }
  };

  // Function to change the font size
  const changeFontSize = async (newSize) => {
    try {
      setFontSize(newSize); // Update font size state
      await AsyncStorage.setItem('@font_size_preference', JSON.stringify(newSize)); // Save new font size to storage
    } catch (error) {
      console.error('Error saving font size preference:', error); // Log any errors during saving
    }
  };

  // Provide context values (theme, toggle function, font size, set font size function) to children
  return (
    <AppContext.Provider value={{ isDarkMode, toggleTheme, fontSize, setFontSize: changeFontSize }}>
      {children}
    </AppContext.Provider>
  );
}

// Layout component that wraps screens in the AppProvider to pass down context
export default function Layout() {
  return (
    <AppProvider>
      <Stack>
        {/* Ensure screens exist in the app directory */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
    </AppProvider>
  );
}
