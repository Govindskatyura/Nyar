import React, { useState, useEffect } from "react";
import {
  StyleSheet,
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
import { ref, get } from 'firebase/database';
import { collection,getDoc, doc} from "firebase/firestore";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
      }
    });

    return unsubscribe;
  }, []);

  const fetchUserData = async (userId) => {
    try {

      const usersRef = collection(database, 'users');
      const userDoc = doc(usersRef, userId);
      const snapshot = await getDoc(userDoc);
      if (snapshot.exists()) {
        const userData = snapshot.data();
        dispatch(setUser(userData));
        navigation.replace("Main");
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#008080",
  },
  tagline: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  form: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#008080",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#008080",
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 10,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#008080",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#008080",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerText: {
    marginTop: 20,
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },
  registerLink: {
    color: "#008080",
    fontWeight: "bold",
  },
});

export default LoginScreen;