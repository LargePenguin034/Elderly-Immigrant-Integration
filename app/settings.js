import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Switch, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from './_layout';

export default function Settings() {
  const router = useRouter();
  const [language, setLanguage] = useState('Australian');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  const toggleVoice = () => setVoiceEnabled(previousState => !previousState);

  const languages = ['Australian', 'Chinese'];

  useEffect(() => {
    StatusBar.setBarStyle(isDarkMode ? "light-content" : "dark-content", true);
  }, [isDarkMode]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? "#4DA6FF" : "#007AFF"} />
          <Text style={[styles.backText, { color: isDarkMode ? "#4DA6FF" : "#007AFF" }]}>Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <TouchableOpacity style={styles.settingItem} onPress={() => setModalVisible(true)}>
          <Text style={[styles.settingText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Accent</Text>
          <View style={styles.settingValue}>
            <Text style={[styles.valueText, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>{language}</Text>
            <Ionicons name="chevron-forward" size={24} color={isDarkMode ? "#BBBBBB" : "#999999"} />
          </View>
        </TouchableOpacity>
        <View style={styles.settingItem}>
          <Text style={[styles.settingText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Voice Enabled</Text>
          <Switch
            trackColor={{ false: "#767577", true: isDarkMode ? "#4DA6FF" : "#81b0ff" }}
            thumbColor={voiceEnabled ? "#FFFFFF" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleVoice}
            value={voiceEnabled}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={[styles.settingText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Dark Mode</Text>
          <Switch
            trackColor={{ false: "#767577", true: isDarkMode ? "#4DA6FF" : "#81b0ff" }}
            thumbColor={isDarkMode ? "#FFFFFF" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleTheme}
            value={isDarkMode}
          />
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalView, { backgroundColor: isDarkMode ? '#2C2C2C' : 'white' }]}>
          <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Select Accent</Text>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang}
              style={styles.languageOption}
              onPress={() => {
                setLanguage(lang);
                setModalVisible(false);
              }}
            >
              <Text style={[styles.languageText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>{lang}</Text>
              {language === lang && <Ionicons name="checkmark" size={24} color={isDarkMode ? "#4DA6FF" : "#007AFF"} />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 17,
    marginLeft: 5,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingText: {
    fontSize: 18,
    fontWeight: '500',
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    marginRight: 10,
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  languageText: {
    fontSize: 18,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 12,
    paddingHorizontal: 24,
    elevation: 2,
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});