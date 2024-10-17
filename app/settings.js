import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Modal, Switch,Animated, Easing, ScrollView, Alert, TouchableWithoutFeedback,TextInput,Dimensions} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppContext } from './_layout';
import emailjs from 'emailjs-com';
import styles from './settingsstyles';
// Constants for app information
const APP_VERSION = "1.0.0";
const DEVELOPER_INFO = "Developed by Team Blue";
const { width, height } = Dimensions.get('window');

export default function Settings() {
  // Hooks and state management
  const router = useRouter();
  const [fontSizeModalVisible, setFontSizeModalVisible] = useState(false);
  const { isDarkMode, toggleTheme, fontSize, setFontSize } = useAppContext();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [modalAnimation] = useState(new Animated.Value(0));

  // Array of available font sizes
  const fontSizes = Array.from({ length: 16 }, (_, i) => 20 + i * 2);

  // Update StatusBar style based on theme
  useEffect(() => {
    StatusBar.setBarStyle(isDarkMode ? "light-content" : "dark-content", true);
  }, [isDarkMode]);

  // Animation function for modal
  const animateModal = (toValue) => {
    Animated.timing(modalAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  // Functions to handle modal visibility
  const openFontSizeModal = () => {
    setFontSizeModalVisible(true);
    animateModal(1);
  };

  const closeFontSizeModal = () => {
    animateModal(0);
    setTimeout(() => setFontSizeModalVisible(false), 300);
  };

  // Function to update font size
  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    closeFontSizeModal();
  };

  // Function to handle user rating
  const handleRating = (star) => {
    setRating(star);
  };

  // Function to send feedback
  const sendFeedback = () => {
    const templateParams = {
      from_name: "User Feedback",
      message: `Rating: ${rating} stars\nReview: ${review}`,
    };

    emailjs.send(
      'service_0hhgwpi',
      'template_ac7x5ad',
      templateParams,
      'I99mbwPvzOlP8StAp'
    ).then((response) => {
      Alert.alert('Success', 'Feedback sent successfully!');
      setFeedbackModalVisible(false);
      setRating(0);
      setReview('');
    }, (err) => {
      console.error('Failed to send feedback. Error:', err);
      Alert.alert('Error', 'Failed to send feedback. Please try again later.');
    });
    setFeedbackModalVisible(false);
  };

  // Function to render star rating
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => handleRating(star)}>
        <Ionicons
          name={star <= rating ? "star" : "star-outline"}
          size={32}
          color={star <= rating ? "#FFD700" : isDarkMode ? "#555" : "#CCC"}
          style={styles.star}
        />
      </TouchableOpacity>
    ));
  };

  // Function to show About alert
  const showAboutAlert = () => {
    Alert.alert(
      "About",
      `Version: ${APP_VERSION}\n${DEVELOPER_INFO}`,
      [{ text: "OK" }]
    );
  };

  // Reusable component for setting items
  const SettingItem = ({ title, onPress, value, icon }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon} size={24} color={isDarkMode ? "#4DA6FF" : "#007AFF"} style={styles.settingIcon} />
        <Text style={[styles.settingText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>{title}</Text>
      </View>
      <View style={styles.settingValue}>
        {typeof value === 'string' ? (
          <Text style={[styles.valueText, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>{value}</Text>
        ) : (
          value
        )}
        {onPress && <Ionicons name="chevron-forward" size={24} color={isDarkMode ? "#BBBBBB" : "#999999"} />}
      </View>
    </TouchableOpacity>
  );

  // Main component render
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? "#4DA6FF" : "#007AFF"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Settings</Text>
      </View>
      {/* Settings list */}
      <ScrollView style={styles.content}>
        <View style={styles.settingsContainer}>
          <SettingItem 
            title="Font Size" 
            onPress={openFontSizeModal} 
            value={`${fontSize}px`}
            icon="text"
          />
          <SettingItem 
            title="Dark Mode" 
            value={
              <Switch
                trackColor={{ false: "#767577", true: isDarkMode ? "#4DA6FF" : "#81b0ff" }}
                thumbColor={isDarkMode ? "#FFFFFF" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleTheme}
                value={isDarkMode}
              />
            }
            icon="moon"
          />
          <SettingItem 
            title="Give Feedback" 
            onPress={() => setFeedbackModalVisible(true)}
            icon="chatbubble-ellipses"
          />
          <SettingItem 
            title="About" 
            onPress={showAboutAlert}
            icon="information-circle"
          />
        </View>
      </ScrollView>

      {/* Font Size Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={fontSizeModalVisible}
        onRequestClose={closeFontSizeModal}
      >
        <TouchableWithoutFeedback onPress={closeFontSizeModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View 
                style={[
                  styles.modalView, 
                  { 
                    backgroundColor: isDarkMode ? '#2C2C2C' : 'white',
                    opacity: modalAnimation,
                    transform: [{ scale: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }) }]
                  }
                ]}
              >
                <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                  Select Font Size
                </Text>
                <ScrollView style={styles.modalScrollView}>
                  {fontSizes.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={styles.optionItem}
                      onPress={() => handleFontSizeChange(option)}
                    >
                      <Text style={[styles.optionText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                        {`${option}px`}
                      </Text>
                      {fontSize === option && <Ionicons name="checkmark" size={24} color={isDarkMode ? "#4DA6FF" : "#007AFF"} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: isDarkMode ? '#4DA6FF' : '#007AFF' }]} 
                  onPress={closeFontSizeModal}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        transparent={true}
        visible={feedbackModalVisible}
        onRequestClose={() => setFeedbackModalVisible(false)}
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={() => setFeedbackModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalView, { backgroundColor: isDarkMode ? '#2C2C2C' : 'white' }]}>
                <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Rate Your Experience</Text>
                <View style={styles.starContainer}>
                  {renderStars()}
                </View>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5',
                    color: isDarkMode ? '#FFFFFF' : '#000000',
                    borderColor: isDarkMode ? '#555' : '#CCC'
                  }]}
                  placeholder="Write your review..."
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                  value={review}
                  onChangeText={setReview}
                  multiline={true}
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: isDarkMode ? '#4DA6FF' : '#007AFF' }]} 
                    onPress={sendFeedback}
                  >
                    <Text style={styles.buttonText}>Submit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: isDarkMode ? '#555' : '#CCC' }]} 
                    onPress={() => setFeedbackModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}