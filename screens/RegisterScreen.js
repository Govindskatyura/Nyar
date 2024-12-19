import React, { useState } from "react";
import {
  Text,
  View,
  SafeAreaView,
  Pressable,
  KeyboardAvoidingView,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { MaterialIcons, AntDesign, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/AuthSlice';
import { auth, database } from "../config/firebase";
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, setDoc, doc } from "firebase/firestore";
import styles from '../styles/RegisterScreenStyles'; // Import styles from a separate file

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhone] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleRegister = async () => {
    if (name.trim() === "" || email.trim() === "" || password.trim() === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      const userData = {
        userId: user.uid,
        email: user.email,
        displayName: name,
        phoneNumber: phoneNumber,
        password: password,
        profilePictureUrl: "",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const usersRef = collection(database, 'users');
      const docRef = doc(usersRef, user.uid);
      await setDoc(docRef, userData);

      dispatch(setUser(userData));
      navigation.replace("Main");
    } catch (error) {
      Alert.alert("Registration Error", error.message);
      console.log("registration failed", error);
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
            <Text style={styles.title}>Create your account</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person" size={24} color="#008080" style={styles.icon} />
              <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#666"
              />
            </View>
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
              <MaterialIcons name="phone" size={24} color="#008080" style={styles.icon} />
              <TextInput
                value={phoneNumber}
                onChangeText={setPhone}
                style={styles.input}
                placeholder="phone number"
                placeholderTextColor="#666"
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
            <Pressable style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Register</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginLink}>Log In</Text>
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;