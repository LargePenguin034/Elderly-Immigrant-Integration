import React, { createContext, useState, useContext, useEffect } from 'react';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the theme and font size context
const AppContext = createContext({
  isDarkMode: true,
  toggleTheme: () => {},
  fontSize: 20,
  setFontSize: () => {},
});

// Export the useAppContext hook
export const useAppContext = () => useContext(AppContext);

// AppProvider component
function AppProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState(20);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const themeValue = await AsyncStorage.getItem('@theme_preference');
      if (themeValue !== null) {
        setIsDarkMode(JSON.parse(themeValue));
      }

      const fontSizeValue = await AsyncStorage.getItem('@font_size_preference');
      if (fontSizeValue !== null) {
        setFontSize(JSON.parse(fontSizeValue));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('@theme_preference', JSON.stringify(newTheme));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const changeFontSize = async (newSize) => {
    try {
      setFontSize(newSize);
      await AsyncStorage.setItem('@font_size_preference', JSON.stringify(newSize));
    } catch (error) {
      console.error('Error saving font size preference:', error);
    }
  };

  return (
    <AppContext.Provider value={{ isDarkMode, toggleTheme, fontSize, setFontSize: changeFontSize }}>
      {children}
    </AppContext.Provider>
  );
}

// Layout component
export default function Layout() {
  return (
    <AppProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
    </AppProvider>
  );
}