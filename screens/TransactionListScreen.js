import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
  Alert,
  Modal
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { app as firebase, database } from '../config/firebase';
import { collection, addDoc, setDoc, doc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, updateDoc } from "firebase/firestore";
import { useSelector } from 'react-redux';

const TransactionListScreen = ({ route }) => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const { groupId, groupName } = route.params;
  const userData = useSelector((state) => state.auth.user);
  const userId = userData.userId;

  // New state for edit modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');

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
      const timestamp = Date.now();
      const transactionId = `${userId}_${timestamp}`;

      const transactionData = {
        transactionId: transactionId,
        type: 'expense',
        createdBy: userData.userId,
        amount: parseFloat(newAmount),
        description: newDescription,
        category: 'General',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        groupId: groupId,
        displayName:userData.displayName,
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

  const editTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setEditAmount(transaction.amount.toString());
    setEditDescription(transaction.description);
    setIsEditModalVisible(true);
  };

  const updateTransaction = async () => {
    if (editAmount.trim() !== '' && editDescription.trim() !== '') {
      try {
        const transactionRef = doc(database, 'transactions', editingTransaction.id);
        await updateDoc(transactionRef, {
          amount: parseFloat(editAmount),
          description: editDescription,
          updatedAt: new Date().toISOString()
        });
        setIsEditModalVisible(false);
        setEditingTransaction(null);
      } catch (error) {
        console.error("Error updating transaction: ", error);
      }
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      await deleteDoc(doc(database, 'transactions', transactionId));
      console.log('Transaction deleted successfully');
    } catch (error) {
      console.error("Error deleting transaction: ", error);
    }
  };

  const goToGroupInfo = () => {
    navigation.navigate('GroupInfoScreen', { groupId, groupName, transactions });
  };
  const renderHeader = () => (
    <Pressable style={styles.header}>
      <AntDesign onPress={() => navigation.goBack()} name="arrowleft" size={24} color="white" style={styles.backButton} />
      <Pressable onPress={goToGroupInfo} style={styles.header_2}>
        <Image style={styles.groupImage} source={{ uri: 'https://picsum.photos/200' }} />
        <View style={styles.headerInfo}>
          <Text style={styles.groupName}>{groupName}</Text>
          <Text style={styles.memberCount}>{}</Text>
        </View>
      </Pressable>
    </Pressable>
  );

  const renderTransaction = ({ item }) => {
    const isCurrentUserTransaction = item.createdBy === userId;
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
          <Text style={styles.transactionNote}>{item.displayName}</Text>
          <Text style={styles.transactionDate}>{item.createdAt}</Text>
        </View>
      </View>
    );
  };

  const renderHiddenItem = (data, rowMap) => {
    if (data.item.createdBy !== userId) return null;

    return (
      <View style={styles.rowBack}>
        <Pressable
          style={[styles.backRightBtn, styles.backRightBtnLeft]}
          onPress={() => editTransaction(data.item)}
        >
          <Text style={styles.backTextWhite}>Edit</Text>
        </Pressable>
        <Pressable
          style={[styles.backRightBtn, styles.backRightBtnRight]}
          onPress={() => {
            Alert.alert(
              "Delete Transaction",
              "Are you sure you want to delete this transaction?",
              [
                {
                  text: "Cancel",
                  style: "cancel"
                },
                { 
                  text: "OK", 
                  onPress: () => deleteTransaction(data.item.id)
                }
              ]
            );
          }}
        >
          <Text style={styles.backTextWhite}>Delete</Text>
        </Pressable>
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

        <SwipeListView
          data={transactions}
          renderItem={renderTransaction}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-150}
          disableRightSwipe
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

        <Modal
          animationType="slide"
          transparent={true}
          visible={isEditModalVisible}
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Edit Transaction</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Amount"
                value={editAmount}
                onChangeText={setEditAmount}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Description"
                value={editDescription}
                onChangeText={setEditDescription}
              />
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.button, styles.buttonCancel]}
                  onPress={() => setIsEditModalVisible(false)}
                >
                  <Text style={styles.textStyle}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.buttonUpdate]}
                  onPress={updateTransaction}
                >
                  <Text style={styles.textStyle}>Update</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  header_2: {
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
  list: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 5,
    marginHorizontal: 10
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
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    right:10,
    borderRadius:50,
    justifyContent: 'space-between',
    // paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    // bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right:50,
    height:40,
    width: 75,
  },
  backRightBtnLeft: {
    backgroundColor: 'blue',
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
  },
  backTextWhite: {
    color: '#FFF',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold"
  },
  modalInput: {
    height: 40,
    width: 200,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonCancel: {
    backgroundColor: "#2196F3",
  },
  buttonUpdate: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
});

export default TransactionListScreen;