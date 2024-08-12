import React, { useState } from "react";
import {
  StyleSheet,
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
// import { useAuth } from '../context/AuthContext'; // Assume you have an auth context
import { collection,setDoc, doc} from "firebase/firestore";



const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
        phoneNumber: "",
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
  button: {
    backgroundColor: "#008080",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginText: {
    marginTop: 20,
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },
  loginLink: {
    color: "#008080",
    fontWeight: "bold",
  },
});

export default RegisterScreen;