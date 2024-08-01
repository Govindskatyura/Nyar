import React, { useState } from 'react';
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
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const TransactionListScreen = () => {
  const navigation = useNavigation();
  const [transactions, setTransactions] = useState([]);
  const [newExpense, setNewExpense] = useState('');
  const [newNote, setNewNote] = useState('');

  const addTransaction = () => {
    if (newExpense.trim() !== '' && newNote.trim() !== '') {
      setTransactions([
        ...transactions,
        { 
          id: Date.now().toString(), 
          amount: newExpense, 
          note: newNote,
          date: new Date() 
        },
      ]);
      setNewExpense('');
      setNewNote('');
    }
  };

  const renderTransaction = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionAmount}>₹{item.amount}</Text>
        <Text style={styles.transactionNote}>{item.note}</Text>
        <Text style={styles.transactionDate}>
          {item.date.toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" size={24} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Expense Group</Text>
        </View>

        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          style={styles.list}
          // inverted
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.amountInput}
            placeholder="Amount"
            value={newExpense}
            onChangeText={setNewExpense}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note"
            value={newNote}
            onChangeText={setNewNote}
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
});

export default TransactionListScreen;