import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AccentContext = createContext();

export const AccentProvider = ({ children }) => {
  const [accent, setAccent] = useState('en-US');

  useEffect(() => {
    loadAccentPreference();
  }, []);

  const loadAccentPreference = async () => {
    try {
      const value = await AsyncStorage.getItem('@accent_preference');
      if (value !== null) {
        setAccent(value);
      }
    } catch (error) {
      console.error('Error loading accent preference:', error);
    }
  };

  const changeAccent = async (newAccent) => {
    try {
      setAccent(newAccent);
      await AsyncStorage.setItem('@accent_preference', newAccent);
    } catch (error) {
      console.error('Error saving accent preference:', error);
    }
  };

  return (
    <AccentContext.Provider value={{ accent, changeAccent }}>
      {children}
    </AccentContext.Provider>
  );
};

export const useAccent = () => useContext(AccentContext);