import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  SafeAreaView,
} from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { doc, getDoc, collection, getDocs, where, query, orderBy } from 'firebase/firestore';
import { database as db } from '../config/firebase';  // Adjust according to your Firebase setup

const GroupInfoScreen = ({ route }) => {
  const navigation = useNavigation();
  const { groupId, groupName } = route.params;

  const [groupMembers, setGroupMembers] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [balances, setBalances] = useState({});
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] });

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
          // const transactionsRef = collection(db, 'transactions', groupId);
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
          console.log(balanceMap);

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
        </View>

        {/* Add more sections as needed, e.g., member list, group settings, etc. */}
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
});

export default GroupInfoScreen;
