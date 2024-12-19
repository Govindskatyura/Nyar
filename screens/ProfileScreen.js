import React, { useState, useEffect, useContext } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { UserType } from '../UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../redux/AuthSlice';
import styles from '../styles/ProfileScreenStyles'; // Import styles from a separate file

const ProfileScreen = () => {
  const userData = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [user, setUser] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    // In a real app, you would fetch this data from your API
    // For this example, we'll use dummy data
    setUser({
      name: userData.displayName,
      email: userData.email,
      phone: userData.phoneNumber,
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      totalBalance:100,
    });
  };

  const handleLogout = async () => {
    try {
      // await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userId');
      setUserId(null);
      dispatch(clearUser());
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' },
      ],
      { cancelable: false }
    );
  };

  const navigateToEditProfile = () => {
    // Navigate to Edit Profile screen
    // navigation.navigate('EditProfile');
    Alert.alert('Navigate', 'Navigate to Edit Profile Screen');
  };

  const navigateToPaymentMethods = () => {
    // Navigate to Payment Methods screen
    // navigation.navigate('PaymentMethods');
    Alert.alert('Navigate', 'Navigate to Payment Methods Screen');
  };

  const navigateToFriends = () => {
    // Navigate to Friends screen
    // navigation.navigate('Friends');
    Alert.alert('Navigate', 'Navigate to Friends Screen');
  };

  const navigateToActivityHistory = () => {
    // Navigate to Activity History screen
    navigation.navigate('Activity');
    // Alert.alert('Navigate', 'Navigate to Activity History Screen');
  };

  if (!user) {
    return <Text>Loading...</Text>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.email}>{user.phone}</Text>
          <TouchableOpacity style={styles.editButton} onPress={navigateToEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.balanceTitle}>Total Balance</Text>
          <Text style={styles.balanceAmount}>${user.totalBalance.toFixed(2)}</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.option} onPress={navigateToPaymentMethods}>
            <FontAwesome5 name="credit-card" size={24} color="#008080" />
            <Text style={styles.optionText}>Payment Methods</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#008080" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={navigateToFriends}>
            <Ionicons name="people" size={24} color="#008080" />
            <Text style={styles.optionText}>Friends</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#008080" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={navigateToActivityHistory}>
            <MaterialIcons name="history" size={24} color="#008080" />
            <Text style={styles.optionText}>Activity History</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#008080" />
          </TouchableOpacity>

          <View style={styles.option}>
            <Ionicons name="notifications" size={24} color="#008080" />
            <Text style={styles.optionText}>Notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#767577", true: "#008080" }}
              thumbColor={notificationsEnabled ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;