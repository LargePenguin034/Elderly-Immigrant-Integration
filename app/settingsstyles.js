import  {StyleSheet, Dimensions} from 'react-native';

const { width, height } = Dimensions.get('window');
// Styles
const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center', // Centers the title
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },
    backButton: {
      position: 'absolute', // Keeps the button aligned to the left
      left: 16,
      padding: 8,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: 'bold',
    },
    placeholderView: {
      width: 40, // Approximate width of the back button
    },
    content: {
      flex: 1,
    },
    settingsContainer: {
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
    settingItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingIcon: {
      marginRight: 15,
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
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalView: {
      width: width * 0.9,
      maxHeight: height * 0.8,
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
    modalScrollView: {
      maxHeight: 300,
      width: '100%',
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

  export default styles;