import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Modal, 
  Switch, 
  Animated, 
  Easing, 
  ScrollView, 
  Alert, 
  TouchableWithoutFeedback,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppContext } from './_layout';  // Update this line
import emailjs from 'emailjs-com';

// Add version and developer info
const APP_VERSION = "1.0.0";
const DEVELOPER_INFO = "Developed by Team Blue";

export default function Settings() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const { isDarkMode, toggleTheme, fontSize, setFontSize } = useAppContext();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [modalAnimation] = useState(new Animated.Value(0));

  const fontSizes = Array.from({ length: 16 }, (_, i) => 20 + i * 2);

  useEffect(() => {
    StatusBar.setBarStyle(isDarkMode ? "light-content" : "dark-content", true);
  }, [isDarkMode]);

  const openFontSizeModal = () => {
    setModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.in(Easing.ease),
    }).start(() => {
      setModalVisible(false);
    });
  };

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize);
    closeModal();
  };

  const handleRating = (star) => {
    setRating(star);
  };

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
  };

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

  const showAboutAlert = () => {
    Alert.alert(
      "About",
      `Version: ${APP_VERSION}\n${DEVELOPER_INFO}`,
      [{ text: "OK" }]
    );
  };

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
        <TouchableOpacity style={styles.settingItem} onPress={openFontSizeModal}>
          <Text style={[styles.settingText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Font Size</Text>
          <View style={styles.settingValue}>
            <Text style={[styles.valueText, { color: isDarkMode ? '#BBBBBB' : '#666666' }]}>{fontSize}px</Text>
            <Ionicons name="chevron-forward" size={24} color={isDarkMode ? "#BBBBBB" : "#999999"} />
          </View>
        </TouchableOpacity>

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

        <TouchableOpacity style={styles.settingItem} onPress={() => setFeedbackModalVisible(true)}>
          <Text style={[styles.settingText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>Give Feedback</Text>
          <Ionicons name="chevron-forward" size={24} color={isDarkMode ? "#BBBBBB" : "#999999"} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={showAboutAlert}>
          <Text style={[styles.settingText, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>About</Text>
          <Ionicons name="chevron-forward" size={24} color={isDarkMode ? "#BBBBBB" : "#999999"} />
        </TouchableOpacity>
      </View>

      {/* Font Size Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.modalView, 
                { 
                  backgroundColor: isDarkMode ? '#2C2C2C' : 'white',
                  transform: [{ translateY: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }) }]
                }
              ]}
            >
              <ScrollView style={styles.modalScrollView}>
                <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFFFFF' : '#000000' }]}>
                  Select Font Size
                </Text>
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
            </Animated.View>
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
              <View style={[styles.feedbackModalView, { backgroundColor: isDarkMode ? '#2C2C2C' : 'white' }]}>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalView: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 18,
  },
  feedbackModalView: {
    margin: 20,
    backgroundColor: 'white',
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
    elevation: 5,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  star: {
    marginHorizontal: 5,
  },
  input: {
    height: 120,
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    width: '100%',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 10,
    padding: 15,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});