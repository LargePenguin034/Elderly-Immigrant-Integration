import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000000",
      justifyContent: "space-between",
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      backgroundColor: 'black',
    },
    headerButton: {
      padding: 5,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
    },
    translationContainer: {
      padding: 20,
    },
    textContainer: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 10,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    textArea: {
      height: 150,
      textAlignVertical: "top",
    },
    speakerButton: {
      position: 'absolute',
      bottom: 10,
      right: 10,
    },
    controls: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    languageSwitcherContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    languageToggle: {
      backgroundColor: '#F0F0F0',
      borderRadius: 28,
      padding: 4,
      flexDirection: 'row',
      width: 250,
      height: 56,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    languageButton: {
      borderRadius: 24,
      width: 96,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    languageButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    arrowContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      left: 0,
      right: 0,
      zIndex: -1,
    },
    arrow: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    button: {
      backgroundColor: '#007bff',
      borderRadius: 50,
      padding: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      marginHorizontal: 20,
    },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredView: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tutorialText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default styles;