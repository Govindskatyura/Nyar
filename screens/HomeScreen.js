import React, { useState, useEffect, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  FlatList,
  Modal,
  TouchableOpacity,
} from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { UserType } from "../UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import GroupBox from "../components/GroupBox";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [groups, setGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);

  // Dummy friends data - replace with actual data in a real app
  const [friends] = useState([
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Mike Johnson" },
    // Add more friends as needed
  ]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const decodedToken = jwt_decode(token);
      const userId = decodedToken.userId;
      setUserId(userId);
    };

    fetchUser();
    // Fetch groups data here
    // For now, we'll use dummy data
    setGroups([
      { id: 1, name: "Roommates", totalAmount: 500, owesOrOwns: "Owes you" },
      { id: 2, name: "Trip to Paris", totalAmount: 200, owesOrOwns: "You owe" },
      { id: 3, name: "Lunch group", totalAmount: 30, owesOrOwns: "Settled" },
      // Add more dummy data as needed
    ]);
  }, []);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderGroupBox = ({ item }) => (
    <GroupBox
      key={item.id}
      imageLink="https://picsum.photos/200"
      groupName={item.name}
      totalAmount={item.totalAmount}
      owesOrOwns={item.owesOrOwns}
      onPress={() => navigation.navigate("Info", { groupId: item.id })}
    />
  );

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prevSelected =>
      prevSelected.includes(friendId)
        ? prevSelected.filter(id => id !== friendId)
        : [...prevSelected, friendId]
    );
  };

  const createNewGroup = () => {
    if (newGroupName.trim() === "") {
      alert("Please enter a group name");
      return;
    }

    // Here you would typically make an API call to create the group
    // For this example, we'll just add it to the local state
    const newGroup = {
      id: groups.length + 1,
      name: newGroupName,
      totalAmount: 0,
      owesOrOwns: "Settled",
    };

    setGroups([...groups, newGroup]);
    setModalVisible(false);
    setNewGroupName("");
    setSelectedFriends([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <AntDesign name="search1" size={20} color="#008080" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredGroups}
        renderItem={renderGroupBox}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.groupsList}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Group</Text>
            <TextInput
              style={styles.input}
              placeholder="Group Name"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <Text style={styles.subTitle}>Select Friends:</Text>
            <FlatList
              data={friends}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.friendItem,
                    selectedFriends.includes(item.id) && styles.selectedFriend
                  ]}
                  onPress={() => toggleFriendSelection(item.id)}
                >
                  <Text>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id.toString()}
            />
            <TouchableOpacity style={styles.createButton} onPress={createNewGroup}>
              <Text style={styles.createButtonText}>Create Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 5,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#008080",
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  groupsList: {
    padding: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#008080",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  friendItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  selectedFriend: {
    backgroundColor: "#E6F3F3",
  },
  createButton: {
    backgroundColor: "#008080",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#008080",
    fontSize: 16,
  },
});

export default HomeScreen;