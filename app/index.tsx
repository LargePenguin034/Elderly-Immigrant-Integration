import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Ensure you've installed react-native-vector-icons

const MicrophoneScreen = () => {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');

  const handleMicrophonePress = () => {
    if (isListening) {
      setText('Stopped listening');
    } else {
      setText('Listening...');
    }
    setIsListening(!isListening);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textArea}
        value={text}
        editable={false}
        onChangeText={(newText) => setText(newText)}
        placeholder="Start typing..."
        multiline
      />
      <TouchableOpacity style={styles.microphoneButton} onPress={handleMicrophonePress}>
        <Icon name="mic" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  textArea: {
    height: 150,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  microphoneButton: {
    width: 60,
    height: 60,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MicrophoneScreen;
