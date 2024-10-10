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
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    controlButton: {
      backgroundColor: '#007bff',
      padding: 10,
      borderRadius: 20,
      marginHorizontal: 10,
    },
    fontSizeDisplay: {
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 20,
      marginHorizontal: 10,
    },
    fontSizeText: {
      fontSize: 18,
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
    // Modal styles
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