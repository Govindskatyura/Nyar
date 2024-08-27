import { Swipeable } from 'react-native-gesture-handler';
import {
    Alert,
    StyleSheet,
    Text,
    View,
    FlatList,
    Pressable,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Image
  } from 'react-native';
import { app as firebase , database } from '../../config/firebase'; // Adjust this import based on your Firebase setup
// import { useAuth } from '../context/AuthContext'; // Assume you have an auth context
import { collection, addDoc,setDoc, doc,deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useSelector } from 'react-redux';

export const renderTransaction = ({ item }) => {
  const userData = useSelector((state) => state.auth.user);
  const userId = userData.userId;
  const isCurrentUserTransaction = item.userId === userId;

  // Function to handle the edit action
  const handleEdit = () => {
    // Navigate to an edit screen or open a modal with transaction details
    // For example:
    Alert.alert('Edit Transaction', 'Edit transaction feature coming soon.');
  };

  // Function to handle the delete action
  const handleDelete = async () => {
    try {
      await deleteDoc(doc(database, 'transactions', item.id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const renderRightActions = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Pressable
        style={[styles.actionButton, styles.editButton]}
        onPress={handleEdit}
      >
        <Text style={styles.actionText}>Edit</Text>
      </Pressable>
      <Pressable
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() =>
          Alert.alert(
            'Delete Transaction',
            'Are you sure you want to delete this transaction?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', onPress: handleDelete },
            ],
            { cancelable: true }
          )
        }
      >
        <Text style={styles.actionText}>Delete</Text>
      </Pressable>
    </View>
  );

  return (
    <Swipeable renderRightActions={isCurrentUserTransaction ? renderRightActions : null}>
      <View style={[
        styles.transactionItem,
        isCurrentUserTransaction ? styles.currentUserTransaction : styles.otherUserTransaction
      ]}>
        <View style={[
          styles.transactionContent,
          isCurrentUserTransaction ? styles.currentUserContent : styles.otherUserContent
        ]}>
          <Text style={styles.transactionAmount}>₹{item.amount}</Text>
          <Text style={styles.transactionNote}>{item.description}</Text>
          <Text style={styles.transactionNote}>{item.createdBy}</Text>
          <Text style={styles.transactionDate}>
            {item.createdAt}
          </Text>
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#075E54',
    },
    container: {
      flex: 1,
      backgroundColor: '#F0F2F5',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      backgroundColor: '#075E54',
    },
    header_2:{
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: 10,
    },
    groupImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 15,
    },
    headerInfo: {
      flex: 1,
    },
    groupName: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    memberCount: {
      color: 'white',
      fontSize: 14,
    },
    headerTitle: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 20,
    },
    list: {
      flex: 1,
    },
    transactionItem: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginVertical: 5,
      marginHorizontal: 10,
    },
    transactionContent: {
      backgroundColor: 'white',
      padding: 10,
      borderRadius: 10,
      maxWidth: '80%',
    },
    transactionAmount: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    transactionNote: {
      fontSize: 14,
      marginTop: 5,
    },
    transactionDate: {
      fontSize: 12,
      color: 'gray',
      marginTop: 5,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 10,
      backgroundColor: 'white',
    },
    amountInput: {
      flex: 1,
      backgroundColor: '#F0F2F5',
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginRight: 10,
    },
    noteInput: {
      flex: 2,
      backgroundColor: '#F0F2F5',
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginRight: 10,
    },
    sendButton: {
      backgroundColor: '#075E54',
      borderRadius: 50,
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
    },
    currentUserTransaction: {
      justifyContent: 'flex-end',
    },
    otherUserTransaction: {
      justifyContent: 'flex-start',
    },
    currentUserContent: {
      backgroundColor: '#DCF8C6',
    },
    otherUserContent: {
      backgroundColor: 'white',
    },
    actionButton: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
      },
      editButton: {
        backgroundColor: 'blue',
      },
      deleteButton: {
        backgroundColor: 'red',
      },
      actionText: {
        color: 'white',
        fontWeight: 'bold',
      },      
  });