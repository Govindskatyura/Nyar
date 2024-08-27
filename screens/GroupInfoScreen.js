import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { doc,setDoc, getDoc, collection, getDocs, where, query, orderBy, updateDoc, arrayUnion } from 'firebase/firestore';
import { database as db } from '../config/firebase';  // Adjust according to your Firebase setup
import * as SMS from 'expo-sms';

const GroupInfoScreen = ({ route }) => {
  const navigation = useNavigation();
  const { groupId, groupName } = route.params;

  const [groupMembers, setGroupMembers] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balances, setBalances] = useState({});
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] });
  const [isInviteModalVisible, setIsInviteModalVisible] = useState(false);
  const [invitePhoneNumber, setInvitePhoneNumber] = useState('');

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupRef = doc(db, 'groups', groupId);
        const groupSnap = await getDoc(groupRef);

        if (groupSnap.exists()) {
          const membersData = groupSnap.data().members;
          setGroupMembers(Object.values(membersData));

          // Fetch transactions for the group
          const transactionsRef = collection(db, 'transactions');
          const q = query(transactionsRef, where('groupId', '==', groupId), orderBy('createdAt', 'desc'));
          const transactionsSnap = await getDocs(q);

          let expenses = 0;
          let balanceMap = {};

          transactionsSnap.forEach((doc) => {
            const transaction = doc.data();
            expenses += transaction.amount;

            if (!balanceMap[transaction.createdBy]) {
              balanceMap[transaction.createdBy] = 0;
            }
            balanceMap[transaction.createdBy] += transaction.amount;
          });

          setTotalExpenses(expenses);
          setBalances(balanceMap);

          // Prepare data for the chart
          const chartLabels = [];
          const chartData = [];
          for (const [userId, amount] of Object.entries(balanceMap)) {
            const member = membersData[userId];
            chartLabels.push(member.displayName || 'Unknown');
            chartData.push(amount);
          }

          setChartData({
            labels: chartLabels,
            datasets: [{ data: chartData }],
          });
        }
      } catch (error) {
        console.error('Error fetching group data:', error);
      }
    };

    fetchGroupData();
  }, [groupId]);

  const addUserGroupInfo = async (invitedUser) =>{
    try {
      // Check if the document exists
      const userGroupsDocRef = doc(db, 'userGroups', invitedUser);
      const userGroupsDoc = await getDoc(userGroupsDocRef);
    
      if (userGroupsDoc.exists()) {
        // If the document exists, update it with the new groupId
        await setDoc(userGroupsDocRef, {
          [groupId]: true
        }, { merge: true });
      } else {
        // If the document doesn't exist, create it with the new groupId
        await setDoc(userGroupsDocRef, {
          [groupId]: true
        });
      }
    
      console.log('User group updated successfully');
    } catch (error) {
      console.error('Error updating user group:', error);
    }
  }
  const handleInviteUser = async () => {
    if (!invitePhoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    try {
      // Check if user exists in the database
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phoneNumber', '==', invitePhoneNumber));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // User exists, add to group
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
        const groupRef = doc(db, 'groups', groupId);
        await updateDoc(groupRef, {
          [`members.${userId}`]: {
            userId: userId,
            displayName: userDoc.data().displayName,
            phoneNumber: invitePhoneNumber
          }
        });

        await addUserGroupInfo(userId);
        Alert.alert('Success', 'User added to the group');
      } else {
        console.log("here");
        // User doesn't exist, send SMS invite
        const inviteLink = 'https://yourappdomain.com/invite'; // Replace with your actual invite link
        const isAvailable = await SMS.isAvailableAsync();
        if (isAvailable) {
          await SMS.sendSMSAsync(invitePhoneNumber, `You're invited to join our Splitwise group! Download the app and use this link: ${inviteLink}`);
          Alert.alert('Invite Sent', 'An SMS invite has been sent to the user');
        } else {
          Alert.alert('Error', 'SMS is not available on this device');
        }
      }
      setIsInviteModalVisible(false);
      setInvitePhoneNumber('');
    } catch (error) {
      console.error('Error inviting user:', error);
      Alert.alert('Error', 'Failed to invite user. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <AntDesign name="arrowleft" size={24} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Group Info</Text>
        </View>

        <View style={styles.groupInfo}>
          <Image style={styles.groupImage} source={{ uri: 'https://picsum.photos/200' }} />
          <Text style={styles.groupName}>{groupName}</Text>
          <Text style={styles.memberCount}>{groupMembers.length} members</Text>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text>Total group expenses:</Text>
            <Text style={styles.amount}>₹{totalExpenses}</Text>
          </View>
          {groupMembers.map((member) => (
            <View key={member.userId} style={styles.summaryRow}>
              <Text>{member.displayName || 'Unknown'} spent:</Text>
              <Text style={styles.amount}>₹{balances[member.userId] || 0}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Expenses Overview</Text>
          <BarChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            fromZero
            chartConfig={{
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 142, 151, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={styles.chart}
          />
        </View>

        <View style={styles.actionSection}>
          <Pressable style={styles.actionButton} onPress={() => {/* Handle settle up */}}>
            <MaterialIcons name="account-balance-wallet" size={24} color="white" />
            <Text style={styles.actionButtonText}>Settle up</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => {/* Handle whiteboard */}}>
            <MaterialIcons name="dashboard" size={24} color="white" />
            <Text style={styles.actionButtonText}>Whiteboard</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => setIsInviteModalVisible(true)}>
            <MaterialIcons name="person-add" size={24} color="#075E54" />
            <Text style={styles.actionButtonText}>Invite User</Text>
          </Pressable>
        </View>

        {/* Invite User Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isInviteModalVisible}
          onRequestClose={() => setIsInviteModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Invite User</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                value={invitePhoneNumber}
                onChangeText={setInvitePhoneNumber}
                keyboardType="phone-pad"
              />
              <View style={styles.modalButtons}>
                <Pressable style={styles.modalButton} onPress={() => setIsInviteModalVisible(false)}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, styles.inviteButton]} onPress={handleInviteUser}>
                  <Text style={[styles.modalButtonText, styles.inviteButtonText]}>Invite</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
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
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  groupInfo: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  groupImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  memberCount: {
    fontSize: 16,
    color: 'gray',
  },
  summarySection: {
    backgroundColor: 'white',
    marginTop: 20,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  amount: {
    fontWeight: 'bold',
  },
  chartSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
  },
  chart: {
    marginTop: 10,
    borderRadius: 16,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    marginTop: 5,
    color: '#075E54',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
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
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    width: '100%',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    width: '45%',
  },
  modalButtonText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inviteButton: {
    backgroundColor: '#075E54',
  },
  inviteButtonText: {
    color: 'white',
  },
});

export default GroupInfoScreen;