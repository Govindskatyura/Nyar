import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import { AntDesign } from '@expo/vector-icons';
import { getFirestore, doc, setDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { database } from '../config/firebase';


const CreateGroupScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [groupName, setGroupName] = useState('');
  const userData = useSelector((state) => state.auth.user);
  const userId = userData.userId;
  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
        });

        if (data.length > 0) {
          setContacts(data);
        }
      }
    })();
  }, []);

  const toggleContactSelection = (contact) => {
    setSelectedContacts(prevSelected => 
      prevSelected.includes(contact)
        ? prevSelected.filter(c => c !== contact)
        : [...prevSelected, contact]
    );
  };

  const renderContactItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.contactItem,
        selectedContacts.includes(item) && styles.selectedContact
      ]}
      onPress={() => toggleContactSelection(item)}
    >
      <Text>{item.name}</Text>
      {selectedContacts.includes(item) && (
        <AntDesign name="check" size={24} color="#008E97" />
      )}
    </TouchableOpacity>
  );

  const createGroup = async () => {
    try {
      const currentUser = userId;
      if (!currentUser) {
        throw new Error('No user is currently logged in');
      }

      // Generate a new group ID
      const groupId = doc(collection(database, 'groups')).id;

      // Prepare group members data
      const members = {
        [currentUser]: {
          userId: currentUser,
          displayName:userData.displayName,
          role: 'admin',
          joinedAt: serverTimestamp()
        }
      };

      selectedContacts.forEach(contact => {
        const phoneNumber = contact.phoneNumbers && contact.phoneNumbers[0] ? contact.phoneNumbers[0].number : null;
        const name = contact.name; //contact.Name && contact.Name[0] ? contact.Name[0].Name : null;
        if (phoneNumber) {
          members[phoneNumber] = {
            userId: phoneNumber, // Using phone number as temporary userId
            role: 'member',
            joinedAt: serverTimestamp(),
            displayName:name,
          };
        }
      });

      // Create group document
      await setDoc(doc(database, 'groups', groupId), {
        groupId,
        name: groupName,
        description: '',
        createdBy: currentUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        members,
        lastTransactionId: ''
      });

      // Update userGroups for the current user
      await setDoc(doc(database, 'userGroups', currentUser), {
        [groupId]: true
      }, { merge: true });

      // Initialize group balances
      const initialBalances = {};
      Object.keys(members).forEach(userId => {
        initialBalances[userId] = { balance: 0 };
      });
      await setDoc(doc(database, 'groupBalances', groupId), initialBalances);

      Alert.alert('Success', `Group "${groupName}" created successfully`);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    }
  };

  const handleNext = () => {
    // if (step === 1 && selectedContacts.length === 0) {
    //   Alert.alert('Error', 'Please select at least one contact');
    //   return;
    // }
    if (step === 2 && groupName.trim() === '') {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }
    if (step === 2) {
      createGroup();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {step === 1 ? (
        <>
          <Text style={styles.title}>Select Friends</Text>
          <FlatList
            data={contacts}
            renderItem={renderContactItem}
            keyExtractor={(item) => item.id}
          />
        </>
      ) : (
        <>
          <Text style={styles.title}>Name Your Group</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter group name"
            value={groupName}
            onChangeText={setGroupName}
          />
        </>
      )}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {step === 2 ? 'Create Group' : 'Next'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    padding: 20,
    margin:10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedContact: {
    backgroundColor: '#E1F5FE',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#008E97',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateGroupScreen;