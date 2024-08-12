import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Entypo, AntDesign, Ionicons, Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux"; // Import Redux hook

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import ProductInfoScreen from "../screens/ProductInfoScreen";
import AddAddressScreen from "../screens/AddAddressScreen";
import AddressScreen from "../screens/AddressScreen";
import CartScreen from "../screens/CartScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ConfirmationScreen from "../screens/ConfirmationScreen";
import ActivityScreen from "../screens/ActivityScreen";
import CreateGroupScreen from "../screens/CreateGroupScreen"; // New screen
import GroupInfoScreen from "../screens/GroupInfoScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          // height: 60,
          position: 'absolute',
          bottom: 16,
          right: 16,
          left: 16,
          padding:20,
          borderRadius: 16
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Groups",
          tabBarLabelStyle: { color: "#008E97"},
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Entypo name="home" size={24} color="#008E97" />
            ) : (
              <AntDesign name="home" size={24} color="black" />
            ),
        }}
      />

      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarLabel: "Activity",
          tabBarLabelStyle: { color: "#008E97" },
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Feather name="activity" size={24} color="#008E97" />
            ) : (
              <Feather name="activity" size={24} color="black" />
            ),
        }}
      />

      <Tab.Screen
        name="AddGroup"
        component={CreateGroupScreen}
        options={({ navigation }) => ({
          tabBarLabel: "",
          tabBarIcon: ({ focused }) => (
            <TouchableOpacity
              style={{
                top: -3,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => navigation.navigate('CreateGroup')}
            >
              <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#008E97',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <AntDesign name="plus" size={30} color="white" />
              </View>
            </TouchableOpacity>
          ),
        })}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          headerShown: false,
          tabBarLabelStyle: { color: "#008E97" },
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Ionicons name="person" size={24} color="#008E97" />
            ) : (
              <Ionicons name="person-outline" size={24} color="black" />
            ),
        }}
      />
    </Tab.Navigator>
  );
}

const StackNavigator = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // Get auth state from Redux
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Main"
              component={BottomTabs}
              options={{ headerShown: false }}
            />
            {/* Add your other screens here that require authentication */}
            <Stack.Screen
              name="Info"
              component={ProductInfoScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Address"
              component={AddAddressScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Add"
              component={AddressScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Confirm"
              component={ConfirmationScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreateGroup"
              component={CreateGroupScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GroupInfoScreen"
              component={GroupInfoScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;

const styles = StyleSheet.create({});