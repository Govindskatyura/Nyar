import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/AuthSlice';
import { auth, database } from "../config/firebase";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDoc, doc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../styles/LoginScreenStyles'; // Import styles from a separate file

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          console.log(userId);
          console.log("Searching ////")
          fetchUserData(userId);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      }
    };

    checkUserSession();

    // const unsubscribe = auth.onAuthStateChanged((user) => {
    //   if (user) {
    //     fetchUserData(user.uid);
    //   }
    // });

    // return unsubscribe;
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const usersRef = collection(database, 'users');
      const userDoc = doc(usersRef, userId);
      const snapshot = await getDoc(userDoc);
      if (snapshot.exists()) {
        const userData = snapshot.data();
        dispatch(setUser(userData));
        await AsyncStorage.setItem('userId', userId);  // Save user ID in AsyncStorage
        if (userId){
          console.log(userId);
          navigation.replace("Main");
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogin = async () => {
    if (email.trim() === "" || password.trim() === "") {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await fetchUserData(user.uid);
    } catch (error) {
      Alert.alert("Login Error", error.message);
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <KeyboardAvoidingView behavior="padding">
          <View style={styles.header}>
            <Text style={styles.logo}>Nyar</Text>
            <Text style={styles.tagline}>Split expenses, not friendships</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Welcome Back</Text>

            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={24} color="#008080" style={styles.icon} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#666"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <AntDesign name="lock1" size={24} color="#008080" style={styles.icon} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                secureTextEntry
              />
            </View>

            <Pressable style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Log In</Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerText}>
                Don't have an account? <Text style={styles.registerLink}>Sign Up</Text>
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;