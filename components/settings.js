// SettingsScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';

const SettingsScreen = ({ navigation, route }) => {
  const [isDarkMode, setIsDarkMode] = useState(route.params.isDarkMode);
  const [fontSize, setFontSize] = useState(route.params.fontSize);

  const handleDarkModeToggle = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const adjustFontSize = (change) => {
    setFontSize((prevSize) => {
      const newSize = prevSize + change;
      return newSize >= 12 && newSize <= 32 ? newSize : prevSize;
    });
  };

  const saveSettings = () => {
    navigation.navigate('Home', { isDarkMode, fontSize });
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#000' : '#fff' }]}>
      <Text style={[styles.header, { color: isDarkMode ? '#fff' : '#000' }]}>Settings</Text>
      
      {/* Dark Mode Toggle */}
      <View style={styles.settingItem}>
        <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={handleDarkModeToggle} />
      </View>

      {/* Font Size Adjuster */}
      <View style={styles.settingItem}>
        <TouchableOpacity onPress={() => adjustFontSize(-2)}>
          <Text style={[styles.buttonText, { color: isDarkMode ? '#fff' : '#000' }]}>-</Text>
        </TouchableOpacity>
        <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>Font Size: {fontSize}</Text>
        <TouchableOpacity onPress={() => adjustFontSize(2)}>
          <Text style={[styles.buttonText, { color: isDarkMode ? '#fff' : '#000' }]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
