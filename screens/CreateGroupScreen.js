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
import { getFirestore, doc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { useSelector } from 'react-redux';
import { database } from '../config/firebase';
import * as SMS from 'expo-sms';

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
          const enrichedContacts = await enrichContactsWithUserData(data);
          setContacts(enrichedContacts);
        }
      }
    })();
  }, []);

  const enrichContactsWithUserData = async (contactsData) => {
    const usersRef = collection(database, 'users');
    const enrichedContacts = await Promise.all(contactsData.map(async (contact) => {
      const phoneNumber = contact.phoneNumbers && contact.phoneNumbers[0] ? contact.phoneNumbers[0].number : null;
      if (phoneNumber) {
        console.log(phoneNumber);
        const q = query(usersRef, where('phoneNumber', '==', phoneNumber.replace(/\s/g,'')));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          return { ...contact, userId: querySnapshot.docs[0].id, accountName: userData.displayName };
        }
      }
      return contact;
    }));
    return enrichedContacts;
  };

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
      <View>
        <Text>{item.name}</Text>
        {item.accountName && (
          <Text style={styles.accountName}>{item.accountName}</Text>
        )}
      </View>
      {selectedContacts.includes(item) && (
        <AntDesign name="check" size={24} color="#008E97" />
      )}
    </TouchableOpacity>
  );

  const inviteUser = async (phoneNumber) => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const inviteLink = 'https://yourappdomain.com/invite'; // Replace with your actual invite link
      await SMS.sendSMSAsync(phoneNumber, `You're invited to join our Splitwise clone app! Download the app and use this link: ${inviteLink}`);
      Alert.alert('Invite Sent', 'An SMS invite has been sent to the user');
    } else {
      Alert.alert('Error', 'SMS is not available on this device');
    }
  };

  const createGroup = async () => {
    try {
      const currentUser = userId;
      if (!currentUser) {
        throw new Error('No user is currently logged in');
      }

      const groupId = doc(collection(database, 'groups')).id;

      const members = {
        [currentUser]: {
          userId: currentUser,
          displayName: userData.displayName,
          role: 'admin',
          joinedAt: serverTimestamp()
        }
      };

      for (const contact of selectedContacts) {
        const phoneNumber = contact.phoneNumbers && contact.phoneNumbers[0] ? contact.phoneNumbers[0].number : null;
        if (phoneNumber) {
          if (contact.userId) {
            members[contact.userId] = {
              userId: contact.userId,
              role: 'member',
              joinedAt: serverTimestamp(),
              displayName: contact.accountName,
            };
          } else {
            await inviteUser(phoneNumber);
            members[phoneNumber] = {
              userId: phoneNumber,
              role: 'invited',
              invitedAt: serverTimestamp(),
              displayName: contact.name,
            };
          }
        }
      }

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

      await setDoc(doc(database, 'userGroups', currentUser), {
        [groupId]: true
      }, { merge: true });

      for(const member in members){
        await setDoc(doc(database, 'userGroups', member), {
          [groupId]: true
        }, { merge: true });
      }

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
    margin: 10
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
  accountName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default CreateGroupScreen;