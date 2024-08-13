import React, { useState, useEffect } from 'react';
import {
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
import { AntDesign, Ionicons, MaterialIcons} from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { app as firebase , database } from '../config/firebase'; // Adjust this import based on your Firebase setup
// import { useAuth } from '../context/AuthContext'; // Assume you have an auth context
import { collection, addDoc,setDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useSelector } from 'react-redux';

const TransactionListScreen = ({ route }) => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const { groupId, groupName } = route.params;
  // const { user } = useAuth(); // Assume this hook provides the current user
  const userData = useSelector((state) => state.auth.user);
  const userId = userData.userId;

  useEffect(() => {
    if (!groupId) return;

    const transactionsRef = collection(database, 'transactions');
    const q = query(transactionsRef, where('groupId', '==', groupId), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTransactions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(fetchedTransactions);
    });
    return () => unsubscribe();
  }, [groupId]);

  const addTransaction = async () => {
    if (newAmount.trim() !== '' && newDescription.trim() !== '') {
      const timestamp = Date.now(); // Get the current timestamp in milliseconds
      const transactionId = `${userId}_${timestamp}`; // Generate the custom transaction ID

      const transactionData = {
        transactionId: transactionId,
        type: 'expense',
        createdBy: userData.displayName, // Use the user ID from props or state
        amount: parseFloat(newAmount),
        description: newDescription,
        category: 'General', // You might want to add a category input
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        groupId: groupId,
        userId
      };

      try {
        const transactionsRef = collection(database, 'transactions');
        const docRef = doc(transactionsRef, transactionId);
        await setDoc(docRef, transactionData);
        setNewAmount('');
        setNewDescription('');
      } catch (error) {
        console.error("Error adding transaction: ", error);
      }
    }
  };

  const goToGroupInfo = () => {
    navigation.navigate('GroupInfoScreen', { groupId, groupName, transactions });
  };

  const renderHeader = () => (
    <Pressable style={styles.header}>
      <AntDesign onPress={() => navigation.goBack()} name="arrowleft" size={24} color="white" style={styles.backButton} />
      <Pressable onPress={goToGroupInfo}  style={styles.header_2}>
        <Image style={styles.groupImage} source={{ uri: 'https://picsum.photos/200' }} />
        <View style={styles.headerInfo}>
          <Text style={styles.groupName}>{groupName}</Text>
          <Text style={styles.memberCount}>5 members</Text>
        </View>
      </Pressable>
    </Pressable>
  );


  const renderTransaction = ({ item }) => {
    const isCurrentUserTransaction = item.userId === userId;//user.uid;
    return (
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
          {/* {item.createdAt ? item.createdAt.toDate().toLocaleString() : 'Date not available'} */}
          {item.createdAt}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {renderHeader()}

        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          style={styles.list}
          inverted
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.amountInput}
            placeholder="Amount"
            value={newAmount}
            onChangeText={setNewAmount}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.noteInput}
            placeholder="Add a description"
            value={newDescription}
            onChangeText={setNewDescription}
          />
          <Pressable onPress={addTransaction} style={styles.sendButton}>
            <Ionicons name="send" size={24} color="white" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
});

export default TransactionListScreen;