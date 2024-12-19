import {
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import React, { useEffect, useContext, useState, useCallback } from "react";
import { Feather, AntDesign } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import axios from "axios";
import { UserType } from "../UserContext";
import styles from '../styles/AddAddressScreenStyles'; // Import styles from a separate file

const AddAddressScreen = () => {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState([]);
  const { userId, setUserId } = useContext(UserType);
  console.log("userId", userId);
  useEffect(() => {
    fetchAddresses();
  }, []);
  const fetchAddresses = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8000/addresses/${userId}`
      );
      const { addresses } = response.data;

      setAddresses(addresses);
    } catch (error) {
      console.log("error", error);
    }
  };
  //refresh the addresses when the component comes to the focus ie basically when we navigate back
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );
  console.log("addresses", addresses);
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 50 }}>
      <View style={styles.searchContainer}>
        <Pressable style={styles.searchInputContainer}>
          <AntDesign
            style={styles.searchIcon}
            name="search1"
            size={22}
            color="black"
          />
          <TextInput placeholder="Search Amazon.in" />
        </Pressable>
        <Feather name="mic" size={24} color="black" />
      </View>
      <View style={styles.addressContainer}>
        <Text style={styles.addressTitle}>Your Addresses</Text>
        <Pressable
          onPress={() => navigation.navigate("Add")}
          style={styles.addAddressButton}
        >
          <Text>Add a new Address</Text>
          <MaterialIcons name="keyboard-arrow-right" size={24} color="black" />
        </Pressable>
        <Pressable>
          {addresses?.map((item, index) => (
            <Pressable style={styles.addressItem}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressName}>
                  {item?.name}
                </Text>
                <Entypo name="location-pin" size={24} color="red" />
              </View>
              <Text style={styles.addressText}>
                {item?.houseNo}, {item?.landmark}
              </Text>
              <Text style={styles.addressText}>
                {item?.street}
              </Text>
              <Text style={styles.addressText}>
                India, Bangalore
              </Text>
              <Text style={styles.addressText}>
                phone No : {item?.mobileNo}
              </Text>
              <Text style={styles.addressText}>
                pin code : {item?.postalCode}
              </Text>
              <View style={styles.addressActions}>
                <Pressable style={styles.addressActionButton}>
                  <Text>Edit</Text>
                </Pressable>
                <Pressable style={styles.addressActionButton}>
                  <Text>Remove</Text>
                </Pressable>
                <Pressable style={styles.addressActionButton}>
                  <Text>Set as Default</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default AddAddressScreen;
