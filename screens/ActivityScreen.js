import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const ActivityScreen = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    // In a real app, you would fetch this data from your API
    // For this example, we'll use dummy data
    setLoading(true);
    setTimeout(() => {
      setActivities([
        {
          id: '1',
          type: 'expense',
          groupName: 'Roommates',
          description: 'Groceries',
          amount: 50.75,
          date: new Date('2023-08-01T12:00:00'),
          paidBy: 'You',
          participants: ['John', 'Sarah', 'Mike'],
        },
        {
          id: '2',
          type: 'settlement',
          description: 'Settled up',
          amount: 25.50,
          date: new Date('2023-07-30T15:30:00'),
          settledWith: 'Sarah',
        },
        {
          id: '3',
          type: 'groupCreated',
          groupName: 'Summer Vacation',
          date: new Date('2023-07-28T10:00:00'),
          participants: ['You', 'Alex', 'Emma', 'David'],
        },
        // Add more dummy data here
      ]);
      setLoading(false);
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  };

  const renderActivityItem = ({ item }) => {
    let icon, title, subtitle, amount;

    switch (item.type) {
      case 'expense':
        icon = <Ionicons name="cart-outline" size={24} color="#008080" />;
        title = `${item.paidBy} paid for ${item.description}`;
        subtitle = `in ${item.groupName} • ${item.participants.join(', ')}`;
        amount = `$${item.amount.toFixed(2)}`;
        break;
      case 'settlement':
        icon = <MaterialCommunityIcons name="bank-transfer" size={24} color="#4CAF50" />;
        title = `You settled up with ${item.settledWith}`;
        subtitle = '';
        amount = `$${item.amount.toFixed(2)}`;
        break;
      case 'groupCreated':
        icon = <FontAwesome5 name="users" size={24} color="#FFA000" />;
        title = `"${item.groupName}" group created`;
        subtitle = `Members: ${item.participants.join(', ')}`;
        amount = '';
        break;
      default:
        return null;
    }

    return (
      <TouchableOpacity style={styles.activityItem}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.activityDetails}>
          <Text style={styles.activityTitle}>{title}</Text>
          {subtitle ? <Text style={styles.activitySubtitle}>{subtitle}</Text> : null}
          <Text style={styles.activityDate}>{item.date.toLocaleDateString()}</Text>
        </View>
        {amount ? <Text style={styles.activityAmount}>{amount}</Text> : null}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={activities}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListHeaderComponent={
          <Text style={styles.header}>Recent Activity</Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No recent activity</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: 'white',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1F5FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  activityDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#008080',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 50,
  },
});

export default ActivityScreen;